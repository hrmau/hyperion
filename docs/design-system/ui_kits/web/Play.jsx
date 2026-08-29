import React from "react";
import { TopNav } from "../../components/nav/TopNav.jsx";
import { SiteFooter } from "../../components/nav/SiteFooter.jsx";
import { Eyebrow } from "../../components/core/Eyebrow.jsx";
import { Badge } from "../../components/core/Badge.jsx";
import { Button } from "../../components/core/Button.jsx";
import { QuizCard } from "../../components/content/QuizCard.jsx";
import { RankedBarList } from "../../components/data/RankedBarList.jsx";
import { GorillaNote } from "../../components/core/GorillaNote.jsx";

const ROUNDS = [
  { q: "Does Ireland or Spain get more of its power from wind?", options: ["Ireland", "Spain"], answer: "Ireland",
    wrong: "58% of Irish visitors get this wrong.",
    reveal: [{ label: "Ireland", value: 34, display: "34%", tone: "accent" }, { label: "Spain", value: 25, display: "25%" }] },
  { q: "Which grid is cleaner: France or Denmark?", options: ["France", "Denmark"], answer: "France",
    wrong: "44% get this wrong.",
    reveal: [{ label: "France", value: 92, display: "92%", tone: "accent" }, { label: "Denmark", value: 82, display: "82%" }] },
];

export function Play({ onNavigate, mark = "../../assets/gorilla-dark.svg" }) {
  const [i, setI] = React.useState(0);
  const [picked, setPicked] = React.useState(null);
  const [score, setScore] = React.useState(0);
  const round = ROUNDS[i % ROUNDS.length];

  const answer = (opt) => {
    setPicked(opt);
    if (opt === round.answer) setScore((s) => s + 1);
  };
  const next = () => { setPicked(null); setI((n) => n + 1); };

  return (
    <div className="gg-page" style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <TopNav active="Play" mark={mark} onNavigate={onNavigate} />
      <div style={{ padding: "var(--band-y) var(--gutter)", maxWidth: 760 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-5)", marginBottom: "var(--space-8)" }}>
          <Eyebrow>Higher or lower</Eyebrow>
          <Badge tone="outline">Round {(i % ROUNDS.length) + 1} of 10</Badge>
          <Badge tone={score > 0 ? "accent" : "neutral"}>Score {score}</Badge>
        </div>

        {!picked ? (
          <QuizCard question={round.q} options={round.options} footnote={round.wrong} onAnswer={answer} />
        ) : (
          <div>
            <div style={{
              fontSize: "var(--fs-h3)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-h3)",
              color: picked === round.answer ? "var(--green)" : "var(--clay)", marginBottom: "var(--space-8)",
            }}>
              {picked === round.answer ? "Correct." : `Not quite — it's ${round.answer}.`}
            </div>
            <RankedBarList items={round.reveal} labelWidth={96} barHeight={12} />
            <GorillaNote lead="Wind punches above its weight." mark={mark}>
              Share of generation is not the same as gigawatts built. Small grids with good weather beat big grids with good policy, every time.
            </GorillaNote>
            <Button variant="primary" size="lg" style={{ marginTop: "var(--space-8)" }} onClick={next}>Next question</Button>
          </div>
        )}
      </div>
      <SiteFooter mark={mark} />
    </div>
  );
}
