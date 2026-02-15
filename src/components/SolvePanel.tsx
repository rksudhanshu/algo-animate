import React, { useMemo, useState } from "react";
import { solveStructured } from "../solvers/structuredSolver";

export function SolvePanel({
  onVisualize,
  onSelectAlgorithm,
}: {
  onVisualize: (payload: { inputArray: number[]; target?: number }) => void;
  onSelectAlgorithm: (algoId: string) => void;
}) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"Structured" | "AI Tutor (later)">("Structured");

  const result = useMemo(() => {
    if (mode !== "Structured") return null;
    return solveStructured(text);
  }, [text, mode]);

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 8 }}>Solve a Problem</div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <button
          className={`tab ${mode === "Structured" ? "tabActive" : ""}`}
          onClick={() => setMode("Structured")}
        >
          Structured (Free)
        </button>
        <button
          className={`tab ${mode === "AI Tutor (later)" ? "tabActive" : ""}`}
          onClick={() => setMode("AI Tutor (later)")}
        >
          AI Tutor (Coming)
        </button>
      </div>

      {mode === "AI Tutor (later)" && (
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.70)", lineHeight: 1.5 }}>
          AI Tutor mode will let students paste a full question in natural language and get a guided explanation.
          <br />
          <br />
          Important: We’ll implement it using a <b>backend</b> endpoint so you don’t expose API keys in the browser.
        </div>
      )}

      {mode === "Structured" && (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Paste a problem like:
• Sort: [5,2,9,1]
• Bubble sort [55, 12, 78, 45]
• Move zeros [0,5,0,3,12]
• Binary search in [3,8,12,19,25] target 19`}
            style={{
              width: "100%",
              minHeight: 130,
              resize: "vertical",
              padding: 12,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.90)",
              outline: "none",
              fontSize: 13,
              lineHeight: 1.4,
            }}
          />

          <div style={{ marginTop: 12 }}>
            {!result && (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.70)" }}>
                Paste a problem to see the solution.
              </div>
            )}

            {result?.ok === false && (
              <div
                style={{
                  marginTop: 8,
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid rgba(255,106,122,0.25)",
                  background: "rgba(255,106,122,0.08)",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                <div style={{ fontWeight: 900, marginBottom: 6 }}>Couldn’t solve yet</div>
                <div style={{ fontSize: 13, marginBottom: 8 }}>{result.error}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.70)" }}>
                  {result.hints.map((h, i) => (
                    <div key={i}>{h}</div>
                  ))}
                </div>
              </div>
            )}

            {result?.ok === true && (
              <div
                style={{
                  marginTop: 8,
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid rgba(74,222,128,0.25)",
                  background: "rgba(74,222,128,0.08)",
                  color: "rgba(255,255,255,0.90)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                  <div style={{ fontWeight: 900 }}>
                    Recognized: {result.algoName} ({result.algoId})
                  </div>
                  <div className="row">
                    <button
                      className="btn"
                      onClick={() => onSelectAlgorithm(result.algoId)}
                      title="Switch the visualizer to the recognized algorithm"
                    >
                      Use this algorithm
                    </button>
                    <button
                      className="btn btnPrimary"
                      onClick={() => {
                        onSelectAlgorithm(result.algoId);
                        onVisualize(result.visualizePayload);
                      }}
                      title="Load into visualizer and animate"
                    >
                      Visualize
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.70)" }}>
                  <b>Input:</b> [{result.inputArray.join(", ")}]
                  {typeof result.target === "number" && (
                    <>
                      {" "}
                      <b style={{ marginLeft: 8 }}>Target:</b> {result.target}
                    </>
                  )}
                </div>

                <div
                  style={{
                    marginTop: 10,
                    whiteSpace: "pre-wrap",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.82)",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    padding: 10,
                    borderRadius: 12,
                  }}
                >
                  {result.finalAnswerText}
                </div>

                <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                  Tip: After visualizing, switch to <b>Challenge</b> tab and try predicting the next steps.
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
