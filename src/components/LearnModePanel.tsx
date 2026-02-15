import React, { useMemo, useState } from "react";

export type LearnQuestion = {
  id: string;
  prompt: string;
  options: { id: string; text: string; correct?: boolean; why: string }[];
  tip?: string;
};

export default function LearnModePanel({
  algorithmName,
  questions,
}: {
  algorithmName: string;
  questions: LearnQuestion[];
}) {
  const [qIndex, setQIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const q = questions[qIndex];

  const result = useMemo(() => {
    if (!picked) return null;
    const opt = q.options.find((o) => o.id === picked);
    const correct = !!opt?.correct;
    return { correct, why: opt?.why ?? "" };
  }, [picked, q]);

  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
        padding: 14,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 950, color: "rgba(255,255,255,0.92)" }}>
        Learn Mode
      </div>
      <div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.62)" }}>
        Guided mini-questions for <b>{algorithmName}</b>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: 12,
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(10,14,20,0.45)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: "rgba(255,255,255,0.80)" }}>
            Question {qIndex + 1} / {questions.length}
          </div>
          <button
            onClick={() => {
              setQIndex(0);
              setPicked(null);
            }}
            style={{
              padding: "6px 10px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.80)",
              fontWeight: 900,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Restart
          </button>
        </div>

        <div style={{ marginTop: 10, fontSize: 13, fontWeight: 900, color: "rgba(255,255,255,0.88)", lineHeight: 1.4 }}>
          {q.prompt}
        </div>

        {q.tip ? (
          <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.60)" }}>
            Tip: {q.tip}
          </div>
        ) : null}

        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          {q.options.map((o) => {
            const active = picked === o.id;
            const isCorrect = !!o.correct;
            const show = !!picked;

            const borderColor = !show
              ? "rgba(255,255,255,0.10)"
              : active
              ? isCorrect
                ? "rgba(74,222,128,0.55)"
                : "rgba(255,106,122,0.55)"
              : "rgba(255,255,255,0.10)";

            const bg = !show
              ? active
                ? "rgba(255,255,255,0.06)"
                : "rgba(255,255,255,0.03)"
              : active
              ? isCorrect
                ? "rgba(74,222,128,0.14)"
                : "rgba(255,106,122,0.14)"
              : "rgba(255,255,255,0.02)";

            return (
              <button
                key={o.id}
                onClick={() => setPicked(o.id)}
                disabled={!!picked}
                style={{
                  textAlign: "left",
                  padding: "10px 10px",
                  borderRadius: 12,
                  border: `1px solid ${borderColor}`,
                  background: bg,
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 850,
                  fontSize: 12,
                  cursor: picked ? "default" : "pointer",
                }}
              >
                {o.text}
              </button>
            );
          })}
        </div>

        {result ? (
          <div
            style={{
              marginTop: 12,
              padding: 10,
              borderRadius: 12,
              border: `1px solid ${result.correct ? "rgba(74,222,128,0.40)" : "rgba(255,106,122,0.40)"}`,
              background: result.correct ? "rgba(74,222,128,0.10)" : "rgba(255,106,122,0.10)",
              color: "rgba(255,255,255,0.82)",
              fontSize: 12,
              lineHeight: 1.45,
              fontWeight: 800,
            }}
          >
            <div style={{ fontWeight: 950, marginBottom: 4 }}>
              {result.correct ? "✅ Correct" : "❌ Not quite"}
            </div>
            {result.why}
          </div>
        ) : null}

        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 12 }}>
          <button
            onClick={() => {
              setPicked(null);
              setQIndex((x) => Math.max(0, x - 1));
            }}
            disabled={qIndex === 0}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.10)",
              background: qIndex === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.80)",
              fontWeight: 950,
              cursor: qIndex === 0 ? "not-allowed" : "pointer",
            }}
          >
            ◀ Prev
          </button>

          <button
            onClick={() => {
              setPicked(null);
              setQIndex((x) => Math.min(questions.length - 1, x + 1));
            }}
            disabled={qIndex >= questions.length - 1}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.10)",
              background: qIndex >= questions.length - 1 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.90)",
              fontWeight: 950,
              cursor: qIndex >= questions.length - 1 ? "not-allowed" : "pointer",
            }}
          >
            Next ▶
          </button>
        </div>
      </div>
    </div>
  );
}
