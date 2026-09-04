import type { Question } from './types';

const BEST_STREAK_KEY = 'gg_best_streak';

/**
 * Best streak is functional/preference storage, not tracking: it holds a single
 * integer, is never sent anywhere, and cannot identify anyone. That places it
 * outside the consent gate in CookieConsent.tsx, which exists to gate analytics.
 * Storage can still be unavailable (private browsing, blocked storage), so every
 * access degrades to "no persisted best" rather than throwing.
 */
function readBestStreak(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(BEST_STREAK_KEY);
    const parsed = raw === null ? 0 : Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

// Exposed as an external store so the page can read it with useSyncExternalStore
// rather than hydrating it through an effect. The server snapshot is always 0;
// React swaps in the real value after hydration without a mismatch.
let cachedBest: number | null = null;
const listeners = new Set<() => void>();

export function subscribeBestStreak(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function getBestStreak(): number {
  if (cachedBest === null) cachedBest = readBestStreak();
  return cachedBest;
}

export function getServerBestStreak(): number {
  return 0;
}

export function writeBestStreak(value: number): void {
  cachedBest = value;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(BEST_STREAK_KEY, String(value));
    } catch {
      // Storage unavailable (private browsing). The game still works and the
      // streak still shows this session; it just won't survive a reload.
    }
  }
  for (const listener of listeners) listener();
}

function shuffle<T>(items: T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Order the question bank for one session.
 *
 * Surprising questions lead (they are the ones that teach), but a deck of only
 * surprising rounds trains the player to always pick the underdog, so ordinary
 * rounds are mixed in at roughly one in three. A final pass pushes apart
 * consecutive questions on the same metric, which otherwise read as a rut.
 */
export function buildDeck(questions: Question[]): Question[] {
  const surprising = shuffle(questions.filter((q) => q.surprising));
  const ordinary = shuffle(questions.filter((q) => !q.surprising));

  const deck: Question[] = [];
  let s = 0;
  let o = 0;
  while (s < surprising.length || o < ordinary.length) {
    for (let k = 0; k < 2 && s < surprising.length; k++) deck.push(surprising[s++]);
    if (o < ordinary.length) deck.push(ordinary[o++]);
  }

  for (let i = 1; i < deck.length; i++) {
    if (deck[i].metric !== deck[i - 1].metric) continue;
    const swap = deck.findIndex(
      (q, j) =>
        j > i &&
        q.metric !== deck[i - 1].metric &&
        (j + 1 >= deck.length || deck[j + 1].metric !== deck[i].metric)
    );
    if (swap !== -1) [deck[i], deck[swap]] = [deck[swap], deck[i]];
  }

  return deck;
}

/** Randomise which side each country appears on, so position is never a tell. */
export function sidesFor(question: Question): [Question['a'], Question['b']] {
  return Math.random() < 0.5 ? [question.a, question.b] : [question.b, question.a];
}

export function formatValue(value: number, unit: string): string {
  const num = value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  return unit ? `${num}${unit}` : num;
}

/**
 * Reorder a deck so a run opens where the reader came from.
 *
 * Two things move to the front, in order: the exact question they clicked on
 * the homepage, then any other question their own country appears in. Everything
 * else keeps the order `buildDeck` gave it.
 *
 * This is a lead, not a quota. Of the 86 countries in the bank, 60 appear in
 * only one or two questions, so for most visitors "about you" is one or two
 * rounds and then the world. Forcing a higher share would mean repeating the
 * same pair, which is worse than moving on.
 */
export function leadWith(
  deck: Question[],
  opts: { questionId?: string | null; iso3?: string | null }
): Question[] {
  const { questionId, iso3 } = opts;
  if (!questionId && !iso3) return deck;

  const lead: Question[] = [];
  const mine: Question[] = [];
  const rest: Question[] = [];
  for (const q of deck) {
    if (questionId && q.id === questionId) lead.push(q);
    else if (iso3 && (q.a.iso3 === iso3 || q.b.iso3 === iso3)) mine.push(q);
    else rest.push(q);
  }
  return [...lead, ...mine, ...rest];
}

/** The side with the higher value, or null for a tie the generator should have rejected. */
export function winnerOf(question: Question): string | null {
  if (question.a.value === question.b.value) return null;
  return question.a.value > question.b.value ? question.a.iso3 : question.b.iso3;
}

/**
 * Link from the homepage card into a run.
 *
 * The card used to point at a bare `/play`, so clicking an answer threw the
 * answer away and dealt an unrelated question - the reader was asked about
 * Austria and Switzerland, clicked one, and arrived at Germany and France. The
 * three parameters carry enough to continue rather than restart: which question
 * they were looking at, which side they picked, and where they were viewing
 * from so the rest of the run can lead with their own country.
 */
export const PLAY_PARAMS = { question: 'q', pick: 'pick', from: 'from' } as const;

export function playPathFor(
  questionId: string,
  pick: string,
  fromIso3?: string | null
): string {
  const params = new URLSearchParams({
    [PLAY_PARAMS.question]: questionId,
    [PLAY_PARAMS.pick]: pick,
  });
  // 'WORLD' is the homepage's no-country variant, not a country to lead with.
  if (fromIso3 && fromIso3 !== 'WORLD') params.set(PLAY_PARAMS.from, fromIso3);
  return `/play?${params.toString()}`;
}
