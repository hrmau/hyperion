'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import Link from 'next/link';
import TopNav from '@/components/ds/nav/TopNav';
import SiteFooter from '@/components/ds/nav/SiteFooter';
import FlagImg from '@/components/FlagImg';
import { showToast, ToastProvider } from '@/components/Toast';
import { loadQuestions } from '@/lib/data';
import {
  buildDeck,
  formatValue,
  getBestStreak,
  getServerBestStreak,
  sidesFor,
  subscribeBestStreak,
  writeBestStreak,
  leadWith,
  winnerOf,
  PLAY_PARAMS,
} from '@/lib/questions';
import { trackEvent, trackShare } from '@/lib/analytics';
import { Eyebrow } from '@/components/ds/core/Eyebrow';
import { Card } from '@/components/ds/core/Card';
import { Stat } from '@/components/ds/core/Stat';
import { Badge } from '@/components/ds/core/Badge';
import { Button } from '@/components/ds/core/Button';
import { GorillaNote } from '@/components/ds/core/GorillaNote';
import { RankedBarList } from '@/components/ds/data/RankedBarList';
import type { Question, QuestionSide } from '@/lib/types';

type Phase = 'question' | 'reveal';

interface Round {
  question: Question;
  left: QuestionSide;
  right: QuestionSide;
}

/** Streak at which ending a run is worth offering as a share. */
const SHARE_THRESHOLD = 3;

export default function PlayPage() {
  const [deck, setDeck] = useState<Question[] | null>(null);
  const [bank, setBank] = useState<Question[] | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [phase, setPhase] = useState<Phase>('question');
  const [picked, setPicked] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [endedStreak, setEndedStreak] = useState(0);
  const [error, setError] = useState(false);

  const bestStreak = useSyncExternalStore(
    subscribeBestStreak,
    getBestStreak,
    getServerBestStreak
  );

  // Deck position lives in a ref: advancing a round must not depend on stale state.
  const cursor = useRef(0);
  // Separate from `cursor`, which wraps back to 0 at the end of the deck. This
  // one only ever goes up, because the question it answers is "how many rounds
  // before they left", not "where in the deck were they".
  const roundsPlayed = useRef(0);
  const nextButton = useRef<HTMLButtonElement>(null);

  const dealFrom = useCallback((source: Question[]) => {
    if (cursor.current >= source.length) cursor.current = 0;
    const question = source[cursor.current++];
    const [left, right] = sidesFor(question);
    setRound({ question, left, right });
    setPhase('question');
    setPicked(null);
    // round_index is the drop-off curve: without it the bank's own stats say
    // nothing about how long anyone actually stays.
    trackEvent('play_round_start', {
      question_id: question.id,
      metric: question.metric,
      round_index: ++roundsPlayed.current,
    });
  }, []);

  useEffect(() => {
    loadQuestions()
      .then((questions) => {
        if (!questions.length) {
          setError(true);
          return;
        }

        // Arriving from the homepage card. Read from `window.location` rather
        // than `useSearchParams`, which would put this page behind a Suspense
        // boundary for three values only ever read once, on the client, on
        // arrival.
        const params = new URLSearchParams(window.location.search);
        const wantId = params.get(PLAY_PARAMS.question);
        const pick = params.get(PLAY_PARAMS.pick)?.toUpperCase() ?? null;
        const from = params.get(PLAY_PARAMS.from)?.toUpperCase() ?? null;

        const built = leadWith(buildDeck(questions), { questionId: wantId, iso3: from });
        setBank(questions);
        setDeck(built);
        cursor.current = 0;
        dealFrom(built);

        // The reader already answered on the homepage. Replaying the question
        // and making them click again would throw that away, so resolve it here
        // and open on the reveal.
        const first = built[0];
        const onThisQuestion =
          pick && first && (pick === first.a.iso3 || pick === first.b.iso3);
        if (!onThisQuestion || first.id !== wantId) return;

        const correct = winnerOf(first) === null || winnerOf(first) === pick;
        setPicked(pick);
        setPhase('reveal');
        setStreak(correct ? 1 : 0);

        // getBestStreak() rather than the `bestStreak` this render closed over:
        // that value can still be the server snapshot of 0 during hydration, and
        // writing a best of 1 over a stored 5 would lose the reader's record.
        if (correct && getBestStreak() < 1) {
          writeBestStreak(1);
          trackEvent('play_best_streak', { streak_length: 1 });
        }
        trackEvent('play_answer', {
          question_id: first.id,
          metric: first.metric,
          correct,
          streak_after: correct ? 1 : 0,
        });
      })
      .catch(() => setError(true));
  }, [dealFrom]);

  const handlePick = useCallback(
    (iso3: string) => {
      // Cards go inert on reveal, so a second click can never resubmit.
      if (!round || phase === 'reveal') return;

      const { question } = round;
      // Values are pre-rounded at build time and the generator rejects ties, so
      // an equal pair should be impossible. If one ever slips through, award it
      // rather than showing an unwinnable round.
      const correct =
        question.a.value === question.b.value ||
        (question.a.value > question.b.value ? question.a.iso3 : question.b.iso3) === iso3;

      const nextStreak = correct ? streak + 1 : 0;

      setPicked(iso3);
      setPhase('reveal');
      setStreak(nextStreak);
      setEndedStreak(correct ? 0 : streak);

      if (correct && nextStreak > bestStreak) {
        writeBestStreak(nextStreak);
        trackEvent('play_best_streak', { streak_length: nextStreak });
      }

      trackEvent('play_answer', {
        question_id: question.id,
        metric: question.metric,
        correct,
        streak_after: nextStreak,
      });
      if (!correct && streak > 0) {
        trackEvent('play_streak_end', { streak_length: streak });
      }
    },
    [round, phase, streak, bestStreak]
  );

  const handleNext = useCallback(() => {
    if (deck) dealFrom(deck);
  }, [deck, dealFrom]);

  // Move focus to Next on reveal so keyboard players aren't stranded on a card
  // that has just gone inert.
  //
  // preventScroll matters: the reveal is now tall enough that scrolling the
  // button into view jumps the page past the answer, which is the one thing the
  // player is waiting to see. Focus moves, the viewport does not.
  useEffect(() => {
    if (phase === 'reveal') nextButton.current?.focus({ preventScroll: true });
  }, [phase]);

  const handleShare = useCallback(async () => {
    if (!round) return;
    // Never leak the answer into the shared text.
    const text = `Grid Gorilla - I got a streak of ${endedStreak}\n${round.question.prompt}\nhttps://gridgorilla.app/play`;
    const canWebShare = typeof navigator !== 'undefined' && !!navigator.share;
    trackShare('streak', canWebShare ? 'web_share' : 'copy_link', String(endedStreak));

    if (canWebShare) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // User dismissed the sheet, or sharing is unavailable — fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied - paste it anywhere.');
    } catch {
      showToast('Sharing is unavailable in this browser.');
    }
  }, [round, endedStreak]);

  // A tie has no winner. Values are pre-rounded at build time and the generator
  // rejects equal pairs, so this is unreachable by design — but if one ever slips
  // through, both cards read as correct rather than the player being told they
  // were wrong while their streak goes up.
  const isTie = round ? round.question.a.value === round.question.b.value : false;

  const winner = useMemo(() => {
    if (!round) return null;
    const { a, b } = round.question;
    if (a.value === b.value) return null;
    return a.value > b.value ? a.iso3 : b.iso3;
  }, [round]);

  const wasCorrect = phase === 'reveal' && (isTie || picked === winner);
  const canShare = phase === 'reveal' && !wasCorrect && endedStreak >= SHARE_THRESHOLD;

  if (error) {
    return (
      <div className="gg-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopNav active="play" />
        <main style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 'var(--gutter)' }}>
          <div style={{ maxWidth: '46ch', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 'var(--fs-lead)', color: 'var(--text-primary)' }}>
              Couldn&apos;t load the question bank.
            </p>
            <p style={{ marginTop: 'var(--space-5)', color: 'var(--text-tertiary)' }}>
              Try reloading, or <Link href="/explore">explore the map</Link> instead.
            </p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!round || !bank) {
    return (
      <div className="gg-page" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-mono)',
            color: 'var(--text-quiet)',
          }}
        >
          Loading questions…
        </span>
      </div>
    );
  }

  const { question, left, right } = round;

  const revealItems = [left, right].map((side) => ({
    label: side.name,
    value: side.value,
    display: formatValue(side.value, question.unit),
    tone: (side.iso3 === winner ? 'accent' : 'default') as 'accent' | 'default',
  }));

  return (
    <ToastProvider>
      <div
        className="gg-page"
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <TopNav active="play" />

        <main
          style={{
            flex: 1,
            width: '100%',
            maxWidth: 760,
            margin: '0 auto',
            padding: 'var(--band-y) var(--gutter) var(--space-10)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-5)',
              flexWrap: 'wrap',
              marginBottom: 'var(--space-9)',
            }}
          >
            <Eyebrow>Higher or Lower</Eyebrow>
            <Badge tone={streak > 0 ? 'accent' : 'neutral'}>
              <span aria-hidden="true">Streak {streak}</span>
              <span className="sr-only">Current streak: {streak}</span>
            </Badge>
            <Badge tone="outline">
              <span aria-hidden="true">Best {bestStreak}</span>
              <span className="sr-only">Best streak: {bestStreak}</span>
            </Badge>
            <span
              style={{
                marginLeft: 'auto',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-mono-xs)',
                color: 'var(--text-quiet)',
              }}
            >
              {bank.length} questions · no game over
            </span>
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 'var(--fs-h3)',
              fontWeight: 'var(--fw-bold)',
              letterSpacing: 'var(--ls-h3)',
              lineHeight: 'var(--lh-h3)',
              textWrap: 'pretty',
            }}
          >
            {question.prompt}
          </h1>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-mono-xs)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-quiet)',
              marginTop: 'var(--space-4)',
            }}
          >
            {question.metricLabel} · {question.year}
          </div>

          <div
            className="gg-card-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-6)',
              marginTop: 'var(--space-9)',
            }}
          >
            {[left, right].map((side) => {
              const revealed = phase === 'reveal';
              const isWinner = isTie || side.iso3 === winner;
              const isPicked = side.iso3 === picked;

              let border = 'var(--border-default)';
              let background = 'var(--bg-card)';
              if (revealed && isWinner) {
                border = 'var(--green)';
                background = 'var(--green-wash)';
              } else if (revealed && isPicked) {
                border = 'var(--clay)';
                background = 'transparent';
              }

              return (
                <button
                  key={side.iso3}
                  type="button"
                  onClick={() => handlePick(side.iso3)}
                  disabled={revealed}
                  aria-label={`Choose ${side.name}`}
                  className="gg-play-card"
                  style={{
                    padding: 'var(--space-9) var(--space-7)',
                    borderRadius: 'var(--r-card)',
                    border: `1px solid ${border}`,
                    background,
                    textAlign: 'center',
                    cursor: revealed ? 'default' : 'pointer',
                    color: 'var(--text-primary)',
                    font: 'inherit',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: 'var(--space-5)',
                    }}
                  >
                    <FlagImg iso3={side.iso3} size={28} />
                  </div>
                  <div style={{ fontSize: 'var(--fs-h4)', fontWeight: 'var(--fw-semibold)' }}>
                    {side.name}
                  </div>
                  <div
                    style={{
                      marginTop: 'var(--space-6)',
                      minHeight: 34,
                      fontSize: 'var(--fs-stat-sm)',
                      fontWeight: 'var(--fw-bold)',
                      letterSpacing: 'var(--ls-stat)',
                      fontVariantNumeric: 'tabular-nums',
                      color: revealed ? 'var(--text-primary)' : 'var(--paper-a32)',
                    }}
                  >
                    {revealed ? (
                      <span className="gg-play-reveal">
                        {formatValue(side.value, question.unit)}
                      </span>
                    ) : (
                      <span aria-hidden="true">?</span>
                    )}
                  </div>
                  {revealed && (
                    <div
                      style={{
                        marginTop: 'var(--space-3)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--fs-mono-xxs)',
                        letterSpacing: 'var(--ls-label)',
                        textTransform: 'uppercase',
                        color: isWinner ? 'var(--green)' : 'var(--text-quiet)',
                      }}
                    >
                      {isTie ? 'Tied' : isWinner ? 'Higher' : 'Lower'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Colour is never the only signal — the verdict is text. */}
          <div aria-live="polite" style={{ marginTop: 'var(--space-9)' }}>
            {phase === 'reveal' && (
              <div className="gg-play-reveal">
                {/* The bloom is anchored to the verdict, not to the block. On
                    the wrapper it centred itself in the middle of the bars and
                    the insight note - a glow around nothing in particular,
                    which is most of why it was hard to see. */}
                <div
                  className={wasCorrect ? 'gg-play-correct' : undefined}
                  style={{
                    fontSize: 'var(--fs-h3)',
                    fontWeight: 'var(--fw-bold)',
                    letterSpacing: 'var(--ls-h3)',
                    color: wasCorrect ? 'var(--green)' : 'var(--clay)',
                    marginBottom: 'var(--space-8)',
                  }}
                >
                  {wasCorrect ? 'Correct.' : `Not quite - it's ${
                    [left, right].find((s) => s.iso3 === winner)?.name
                  }.`}
                </div>

                <RankedBarList items={revealItems} labelWidth={132} barHeight={12} />

                <GorillaNote lead={`${question.metricLabel}, ${question.year}.`}>
                  {question.insight}
                </GorillaNote>

                {/* A run ending is a moment, but it is not a game over - this
                    game deliberately has none, and the page says so two lines
                    further down. So this is a panel in the flow rather than a
                    modal over it: nothing to dismiss, and Next is still the
                    thing under your cursor. It appears for a streak of one,
                    because ending a run of two is worth marking even though it
                    is not worth sharing. */}
                {!wasCorrect && endedStreak > 0 && (
                  <Card
                    tone="raised"
                    padding="var(--space-7)"
                    style={{ marginTop: 'var(--space-8)' }}
                  >
                    <Eyebrow style={{ marginBottom: 'var(--space-5)' }}>Run ended</Eyebrow>
                    <div style={{ display: 'flex', gap: 'var(--space-10)', flexWrap: 'wrap' }}>
                      <Stat label="This run" value={String(endedStreak)} note="in a row" />
                      <Stat
                        label="Your best"
                        value={String(Math.max(bestStreak, endedStreak))}
                        note="all time"
                      />
                    </div>
                    <p
                      style={{
                        margin: 'var(--space-6) 0 0',
                        fontSize: 'var(--fs-ui)',
                        color: 'var(--text-secondary)',
                        lineHeight: 'var(--lh-body)',
                      }}
                    >
                      {endedStreak >= bestStreak
                        ? 'That is your best run so far. The streak resets, but the run does not end.'
                        : `${bestStreak - endedStreak} more would have matched your best. The streak resets, but the run keeps going.`}
                    </p>
                  </Card>
                )}

                <div
                  className="gg-action-row"
                  style={{
                    display: 'flex',
                    gap: 'var(--space-4)',
                    flexWrap: 'wrap',
                    marginTop: 'var(--space-9)',
                  }}
                >
                  <Button ref={nextButton} variant="primary" size="lg" onClick={handleNext}>
                    Next question
                  </Button>
                  {canShare && (
                    <Button variant="secondary" size="lg" onClick={handleShare}>
                      Share your streak of {endedStreak}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          <p
            style={{
              marginTop: 'var(--space-11)',
              fontSize: 'var(--fs-caption)',
              color: 'var(--text-quiet)',
            }}
          >
            Every round compares both countries in the same year.{' '}
            <Link href="/explore">See the whole map</Link>.
          </p>
        </main>

        <SiteFooter />
      </div>
    </ToastProvider>
  );
}
