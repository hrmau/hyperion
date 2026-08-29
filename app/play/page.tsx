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
} from '@/lib/questions';
import { trackEvent } from '@/lib/analytics';
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
  const nextButton = useRef<HTMLButtonElement>(null);

  const dealFrom = useCallback((source: Question[]) => {
    if (cursor.current >= source.length) cursor.current = 0;
    const question = source[cursor.current++];
    const [left, right] = sidesFor(question);
    setRound({ question, left, right });
    setPhase('question');
    setPicked(null);
    trackEvent('play_round_start', {
      question_id: question.id,
      metric: question.metric,
    });
  }, []);

  useEffect(() => {
    loadQuestions()
      .then((questions) => {
        if (!questions.length) {
          setError(true);
          return;
        }
        const built = buildDeck(questions);
        setBank(questions);
        setDeck(built);
        cursor.current = 0;
        dealFrom(built);
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

      if (correct && nextStreak > bestStreak) writeBestStreak(nextStreak);

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
  useEffect(() => {
    if (phase === 'reveal') nextButton.current?.focus();
  }, [phase]);

  const handleShare = useCallback(async () => {
    if (!round) return;
    // Never leak the answer into the shared text.
    const text = `Grid Gorilla - I got a streak of ${endedStreak}\n${round.question.prompt}\nhttps://gridgorilla.app/play`;
    trackEvent('play_share', { streak_length: endedStreak });

    if (typeof navigator !== 'undefined' && navigator.share) {
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
      <div className="gg-page min-h-screen flex flex-col">
        <TopNav active="play" />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="card p-6 text-center max-w-sm">
            <p className="text-sm text-primary mb-2">Couldn&apos;t load the question bank.</p>
            <p className="text-xs text-muted">
              Try reloading, or{' '}
              <Link href="/" className="underline hover:text-primary">
                explore the map
              </Link>{' '}
              instead.
            </p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!round || !bank) {
    return (
      <div className="gg-page min-h-screen flex items-center justify-center">
        <div className="text-secondary text-sm">Loading questions...</div>
      </div>
    );
  }

  const { question, left, right } = round;

  return (
    <ToastProvider>
    <div className="gg-page min-h-screen flex flex-col">
      <TopNav active="play" />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 sm:py-10">
        {/* Streak header */}
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted">Higher or lower</div>
            <div className="text-[11px] text-muted mt-0.5">
              {bank.length} questions &middot; no game over
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right">
              <div className="text-xl font-semibold text-primary tabular-nums" aria-hidden="true">
                {streak}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted" aria-hidden="true">
                Streak
              </div>
              <span className="sr-only">Current streak: {streak}</span>
            </div>
            <div className="w-px h-8 bg-border" aria-hidden="true" />
            <div className="text-right">
              <div className="text-xl font-semibold text-secondary tabular-nums" aria-hidden="true">
                {bestStreak}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted" aria-hidden="true">
                Best
              </div>
              <span className="sr-only">Best streak: {bestStreak}</span>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-5 sm:mb-7">
          <h1 className="text-[17px] sm:text-[19px] font-medium text-primary">
            {question.prompt}
          </h1>
          <p className="text-[11px] text-muted mt-1.5">
            {question.metricLabel} &middot; {question.year}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[left, right].map((side) => {
            const isWinner = isTie || side.iso3 === winner;
            const isPicked = side.iso3 === picked;
            const revealed = phase === 'reveal';

            let tone = 'border-border bg-card';
            if (revealed && isWinner) {
              tone = 'border-[var(--positive)] bg-[var(--color-success-bg)]';
            } else if (revealed && isPicked) {
              tone = 'border-[var(--negative)] bg-[var(--color-danger-bg)]';
            } else if (revealed) {
              tone = 'border-border bg-card opacity-60';
            }

            return (
              <button
                key={side.iso3}
                type="button"
                onClick={() => handlePick(side.iso3)}
                disabled={revealed}
                aria-label={`Choose ${side.name}`}
                className={`gg-play-card p-5 sm:p-6 text-center border ${tone} ${
                  revealed ? 'cursor-default' : 'cursor-pointer hover:border-primary/30'
                } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary-brand)]`}
              >
                <div className="flex justify-center mb-3">
                  <FlagImg iso3={side.iso3} size={32} />
                </div>
                <div className="text-[15px] font-medium text-primary">{side.name}</div>

                <div className="mt-3 h-8 flex items-center justify-center">
                  {revealed ? (
                    <span className="gg-play-reveal text-[21px] font-semibold text-primary tabular-nums">
                      {formatValue(side.value, question.unit)}
                    </span>
                  ) : (
                    <span className="text-[21px] font-semibold text-muted/40" aria-hidden="true">
                      ?
                    </span>
                  )}
                </div>

                {revealed && (
                  <div
                    className="mt-1 text-[11px] font-medium uppercase tracking-wider"
                    style={{ color: isWinner ? 'var(--positive)' : 'var(--text-muted)' }}
                  >
                    {isTie ? 'Tied' : isWinner ? 'Higher' : 'Lower'}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Result + insight. Colour is never the only signal — the verdict is text. */}
        <div aria-live="polite" className="mt-5 sm:mt-6">
          {phase === 'reveal' && (
            <div className="gg-play-reveal card p-5">
              <div
                className="text-[13px] font-semibold mb-2"
                style={{ color: wasCorrect ? 'var(--positive)' : 'var(--negative)' }}
              >
                {wasCorrect ? 'Correct' : 'Not quite'}
                <span className="text-muted font-normal">
                  {' '}
                  &mdash;{' '}
                  {left.name}{' '}
                  {formatValue(left.value, question.unit)} vs {right.name}{' '}
                  {formatValue(right.value, question.unit)} in {question.year}.
                </span>
              </div>
              <p className="text-[14px] leading-relaxed text-primary">{question.insight}</p>

              {!wasCorrect && streak === 0 && endedStreak > 0 && (
                <p className="text-[11px] text-muted mt-3">
                  Streak reset to zero. The run keeps going.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        {phase === 'reveal' && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              ref={nextButton}
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-lg bg-primary text-canvas text-[13px] font-medium hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary-brand)]"
            >
              Next round
            </button>
            {canShare && (
              <button
                type="button"
                onClick={handleShare}
                className="px-4 py-2.5 rounded-lg border border-border bg-card text-secondary text-[13px] hover:text-primary hover:border-primary/30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary-brand)]"
              >
                Share your streak of {endedStreak}
              </button>
            )}
          </div>
        )}

        <p className="mt-8 text-center text-[11px] text-muted">
          Every round compares both countries in the same year.{' '}
          <Link href="/" className="underline hover:text-primary transition-colors">
            See the whole map
          </Link>
          .
        </p>
      </main>

      <SiteFooter />
    </div>
    </ToastProvider>
  );
}
