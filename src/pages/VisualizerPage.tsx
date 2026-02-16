import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { ArrayRenderer } from "../renderers/ArrayRenderer";
import type { ArrayState } from "../algorithms/types";

import { bubbleSortSteps } from "../algorithms/array/bubble";
import { insertionSortSteps } from "../algorithms/array/insertion";
import { selectionSortSteps } from "../algorithms/array/selection";

type AlgoKey = "bubble" | "insertion" | "selection";
type RightTab = "teaching" | "complexity";

const ALGO_META: Record<
  AlgoKey,
  {
    name: string;
    fn: (a: number[]) => ArrayState[];
    bigO: { time: string; space: string };
    invariant: string;
  }
> = {
  bubble: {
    name: "Bubble Sort",
    fn: bubbleSortSteps,
    bigO: { time: "O(n²)", space: "O(1)" },
    invariant:
      "After each pass, the largest remaining element is fixed at the end. The sorted region grows from the right.",
  },
  insertion: {
    name: "Insertion Sort",
    fn: insertionSortSteps,
    bigO: { time: "O(n²) worst, O(n) best", space: "O(1)" },
    invariant:
      "At any time, the left part (0..i) is sorted. We insert the key into the correct position by shifting bigger elements right.",
  },
  selection: {
    name: "Selection Sort",
    fn: selectionSortSteps,
    bigO: { time: "O(n²)", space: "O(1)" },
    invariant:
      "The prefix (0..i) is sorted. Each pass selects the minimum from the unsorted region and swaps it into position i.",
  },
};

function estimateWorstComparisons(algo: AlgoKey, n: number) {
  const nn = Math.max(n, 0);
  const worst = (nn * (nn - 1)) / 2;
  const best = algo === "insertion" ? Math.max(nn - 1, 0) : worst;
  return { best, worst };
}

function fmt(n: number) {
  if (!Number.isFinite(n)) return "—";
  if (n < 1_000) return String(Math.round(n));
  if (n < 1_000_000) return `${(n / 1_000).toFixed(1)}k`;
  if (n < 1_000_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  return `${(n / 1_000_000_000).toFixed(2)}B`;
}

/* ---------------- Quiz Engine ---------------- */

type Quiz = {
  stepIndex: number;
  prompt: string;
  options: string[];
  correct: number; // option index
  explanation: string;
  answered?: number; // option index
  isCorrect?: boolean;
};

function isCompareStep(s: ArrayState | undefined) {
  if (!s) return false;
  const msg = (s.message ?? "").toLowerCase();
  const hasPair = (s.highlight?.length ?? 0) >= 2;
  return hasPair && msg.includes("compare");
}

function buildArrayCompareQuiz(step: ArrayState, stepIndex: number): Quiz | null {
  const h = (step.highlight ?? []).filter((x) => typeof x === "number") as number[];
  const uniq = Array.from(new Set(h));
  if (uniq.length < 2) return null;

  const i = uniq[0];
  const j = uniq[1];
  const a = step.array?.[i];
  const b = step.array?.[j];
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;

  const ok = a <= b;

  return {
    stepIndex,
    prompt: `Will the algorithm do a swap/shift here?`,
    options: ["In order ✅ (no swap/shift)", "Out of order ❌ (swap/shift)"],
    correct: ok ? 0 : 1,
    explanation: `We compare a[${i}] = ${a} and a[${j}] = ${b}. Since ${a} ${ok ? "≤" : ">"} ${b}, it is ${
      ok ? "already in order (no swap/shift needed)" : "out of order (swap/shift needed)"
    }.`,
  };
}

function buildInsertionCompareQuiz(step: ArrayState, stepIndex: number): Quiz | null {
  const msg = step.message ?? "";
  const m = msg.match(/Compare key\s+(-?\d+)\s+with a\[(\d+)\]\s*=\s*(-?\d+)/i);
  if (!m) return null;

  const key = Number(m[1]);
  const j = Number(m[2]);
  const aj = Number(m[3]);
  if (!Number.isFinite(key) || !Number.isFinite(j) || !Number.isFinite(aj)) return null;

  const ok = aj <= key;

  return {
    stepIndex,
    prompt: `Will insertion sort shift this element to the right?`,
    options: ["No ✅ (stop shifting)", "Yes ❌ (shift right)"],
    correct: ok ? 0 : 1,
    explanation: `Insertion compares key = ${key} with a[${j}] = ${aj}. Since ${aj} ${ok ? "≤" : ">"} ${key}, we ${
      ok ? "stop shifting (correct position found)" : "shift a[j] right to make space for the key"
    }.`,
  };
}

export default function VisualizerPage() {
  const [algo, setAlgo] = useState<AlgoKey>("bubble");
  const [input, setInput] = useState("5,3,8,4,2");
  const [steps, setSteps] = useState<ArrayState[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const [speed, setSpeed] = useState(450);

  const [teachingMode, setTeachingMode] = useState(true);
  const [quizMode, setQuizMode] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const [tab, setTab] = useState<RightTab>("teaching");
  const [growthN, setGrowthN] = useState<10 | 100 | 1000>(100);

  const indexRef = useRef(index);
  const stepsRef = useRef(steps);
  const askedQuizStepsRef = useRef<Set<number>>(new Set());

  useEffect(() => void (indexRef.current = index), [index]);
  useEffect(() => void (stepsRef.current = steps), [steps]);

  const algoName = ALGO_META[algo].name;
  const invariant = ALGO_META[algo].invariant;
  const bigO = ALGO_META[algo].bigO;

  const parsedInput = useMemo(() => {
    const nums = input
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((x) => Number.isFinite(x));
    return nums;
  }, [input]);

  const current = steps[index];
  const arrayLen = current?.array?.length ?? parsedInput.length ?? 0;

  function load() {
    const fn = ALGO_META[algo].fn;
    const result = fn(parsedInput);
    setSteps(result);
    setIndex(0);
    setPlaying(false);
    setQuiz(null);
    askedQuizStepsRef.current = new Set();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effectiveSpeed = useMemo(() => {
    if (!teachingMode) return speed;
    if (!current) return speed;

    const msg = (current.message ?? "").toLowerCase();
    const isSwap = !!current.swap || msg.includes("swap");
    const isCompare = isCompareStep(current);

    if (isSwap) return Math.max(speed, 800);
    if (isCompare) return Math.max(speed, 550);
    return speed;
  }, [teachingMode, speed, current]);

  useEffect(() => {
    if (!playing) return;
    if (quiz) return;
    if (index >= steps.length - 1) return;

    const id = window.setTimeout(() => {
      setIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }, effectiveSpeed);

    return () => window.clearTimeout(id);
  }, [playing, quiz, index, steps.length, effectiveSpeed]);

  // auto-pause at pass end + completion
  useEffect(() => {
    if (!teachingMode) return;
    if (!playing) return;
    if (quiz) return;
    if (!current?.message) return;

    const msg = current.message.toLowerCase();
    const isPassEnd = msg.includes("pass") && msg.includes("complete");
    const isDone = msg.includes("sorted successfully") || msg.includes("array sorted");
    if (isPassEnd || isDone) setPlaying(false);
  }, [teachingMode, playing, quiz, current]);

  // quiz trigger
  useEffect(() => {
    if (!quizMode) return;
    if (!teachingMode) return;
    if (!current) return;
    if (quiz) return;
    if (!isCompareStep(current)) return;

    const comps = current.comparisons ?? 0;
    const shouldAskThisCompare = comps > 0 && comps % 6 === 0;

    if (!shouldAskThisCompare) return;
    if (askedQuizStepsRef.current.has(index)) return;

    let q: Quiz | null = null;

    if (algo === "insertion") {
      q = buildInsertionCompareQuiz(current, index);
      if (!q) q = buildArrayCompareQuiz(current, index);
    } else {
      q = buildArrayCompareQuiz(current, index);
    }

    if (!q) return;

    askedQuizStepsRef.current.add(index);
    setPlaying(false);
    setTab("teaching");
    setQuiz(q);
  }, [algo, quizMode, teachingMode, current, index, quiz]);

  function answerQuiz(optionIdx: number) {
    if (!quiz) return;
    const correct = quiz.correct === optionIdx;
    setQuiz({ ...quiz, answered: optionIdx, isCorrect: correct });
  }

  function closeQuiz() {
    setQuiz(null);
  }

  // keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || (e.target as HTMLElement | null)?.isContentEditable) return;

      const total = stepsRef.current.length;
      const cur = indexRef.current;

      if (quiz) {
        if (e.key === "1") {
          e.preventDefault();
          answerQuiz(0);
          return;
        }
        if (e.key === "2") {
          e.preventDefault();
          answerQuiz(1);
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          if (quiz.answered !== undefined) closeQuiz();
          return;
        }
      }

      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setPlaying(false);
        setIndex(Math.min(cur + 1, Math.max(total - 1, 0)));
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPlaying(false);
        setIndex(Math.max(cur - 1, 0));
        return;
      }
      if (e.key === "Home") {
        e.preventDefault();
        setPlaying(false);
        setIndex(0);
        return;
      }
      if (e.key === "End") {
        e.preventDefault();
        setPlaying(false);
        setIndex(Math.max(total - 1, 0));
        return;
      }
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        load();
        return;
      }
      if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        setTeachingMode((t) => !t);
        return;
      }
      if (e.key.toLowerCase() === "q") {
        e.preventDefault();
        setQuizMode((q) => !q);
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algo, input, quiz]);

  // complexity stats
  const est = useMemo(() => estimateWorstComparisons(algo, arrayLen), [algo, arrayLen]);
  const liveComparisons = current?.comparisons ?? 0;
  const liveSwaps = current?.swaps ?? 0;
  const livePasses = current?.passes ?? 0;
  const liveWrites = current?.writes ?? 0;

  const growthRows = useMemo(() => {
    const sizes: (10 | 100 | 1000)[] = [10, 100, 1000];
    return sizes.map((n) => {
      const { best, worst } = estimateWorstComparisons(algo, n);
      return { n, best, worst };
    });
  }, [algo]);

  const growthMaxWorst = Math.max(...growthRows.map((r) => r.worst), 1);

  return (
    <div style={{ padding: 26, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>Algo Animate — Student Edition</div>
          <div style={{ color: "rgba(255,255,255,0.65)", marginTop: 4 }}>
            {algoName} • Space Play/Pause • ←/→ Step • R Reload • T Teaching • Q Quiz
          </div>
        </div>
      </div>

      {/* Controls row */}
      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          alignItems: "end",
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.70)", marginBottom: 6 }}>Algorithm</div>
          <select
            value={algo}
            onChange={(e) => {
              setAlgo(e.target.value as AlgoKey);
              setPlaying(false);
              setTimeout(load, 0);
            }}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
              color: "white",
              outline: "none",
            }}
          >
            {Object.entries(ALGO_META).map(([k, v]) => (
              <option key={k} value={k}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.70)", marginBottom: 6 }}>
            Array input (comma-separated)
          </div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={() => load()}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
              color: "white",
              outline: "none",
            }}
          />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.70)" }}>Speed</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.70)" }}>
              {speed} ms/step {teachingMode ? "(Teaching adjusts)" : ""}
            </div>
          </div>
          <input
            type="range"
            min={60}
            max={1200}
            step={10}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: "100%" }}
          />

          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <ToggleButton on={teachingMode} label="Teaching" onClick={() => setTeachingMode((t) => !t)} />
            <ToggleButton on={quizMode} label="Quiz" onClick={() => setQuizMode((q) => !q)} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={load} style={btn()}>
          Load
        </button>

        <button onClick={() => setPlaying((p) => !p)} style={btnPrimary()}>
          {playing ? "Pause" : "Play"}
        </button>

        <button
          onClick={() => {
            setPlaying(false);
            setIndex((i) => Math.max(i - 1, 0));
          }}
          style={btn()}
        >
          Step Back
        </button>

        <button
          onClick={() => {
            setPlaying(false);
            setIndex((i) => Math.min(i + 1, steps.length - 1));
          }}
          style={btn()}
        >
          Step Forward
        </button>
      </div>

      {steps.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <input
            type="range"
            min={0}
            max={steps.length - 1}
            value={index}
            onChange={(e) => {
              setPlaying(false);
              setIndex(Number(e.target.value));
            }}
            style={{ width: "100%" }}
          />
          <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.70)", marginTop: 6 }}>
            Step {index + 1} / {steps.length}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginTop: 18 }}>
        <div style={{ minWidth: 0 }}>
          {current ? <ArrayRenderer state={current} /> : <div style={{ opacity: 0.7 }}>Load an array to start.</div>}
        </div>

        <div
          style={{
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.03)",
            padding: 16,
          }}
        >
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <button onClick={() => setTab("teaching")} style={tabBtn(tab === "teaching")}>
              Teaching
            </button>
            <button onClick={() => setTab("complexity")} style={tabBtn(tab === "complexity")}>
              Complexity
            </button>
          </div>

          {tab === "teaching" && (
            <>
              <div style={{ fontWeight: 900, fontSize: 14 }}>Invariants (Always true)</div>
              <div style={box()}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.86)", lineHeight: 1.35 }}>{invariant}</div>
              </div>

              {quizMode && quiz && quiz.stepIndex === index && (
                <div
                  style={{
                    marginTop: 14,
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid rgba(106,169,255,0.25)",
                    background: "rgba(106,169,255,0.10)",
                  }}
                >
                  <div style={{ fontWeight: 900, color: "rgba(255,255,255,0.92)" }}>Quiz time 🧠</div>
                  <div style={{ marginTop: 8, color: "rgba(255,255,255,0.86)", lineHeight: 1.35 }}>
                    {quiz.prompt}
                  </div>

                  <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                    {quiz.options.map((opt, idx) => {
                      const answered = quiz.answered !== undefined;
                      const isChosen = quiz.answered === idx;
                      const isCorrect = quiz.correct === idx;

                      let bg = "rgba(255,255,255,0.05)";
                      let border = "1px solid rgba(255,255,255,0.10)";

                      if (answered && isCorrect) {
                        bg = "rgba(74,222,128,0.18)";
                        border = "1px solid rgba(74,222,128,0.30)";
                      } else if (answered && isChosen && !isCorrect) {
                        bg = "rgba(255,106,122,0.16)";
                        border = "1px solid rgba(255,106,122,0.30)";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={answered}
                          onClick={() => answerQuiz(idx)}
                          style={{
                            padding: "10px 10px",
                            borderRadius: 12,
                            border,
                            background: bg,
                            color: "white",
                            cursor: answered ? "default" : "pointer",
                            fontWeight: 900,
                            textAlign: "left",
                          }}
                        >
                          <span style={{ opacity: 0.8, marginRight: 8 }}>{idx === 0 ? "1)" : "2)"}</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quiz.answered !== undefined && (
                    <div style={{ marginTop: 10 }}>
                      <div
                        style={{
                          fontWeight: 900,
                          color: quiz.isCorrect ? "rgba(74,222,128,0.95)" : "rgba(255,106,122,0.95)",
                        }}
                      >
                        {quiz.isCorrect ? "Correct ✅" : "Not quite ❌"}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.80)", lineHeight: 1.35 }}>
                        {quiz.explanation}
                      </div>

                      <button onClick={closeQuiz} style={{ ...btnPrimary(), marginTop: 10, width: "100%" }}>
                        Continue (Enter)
                      </button>
                    </div>
                  )}

                  <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.70)" }}>
                    Shortcuts: press <b>1</b> or <b>2</b> to answer • <b>Enter</b> to continue
                  </div>
                </div>
              )}

              <div style={{ marginTop: 14, fontWeight: 900, fontSize: 14 }}>Step Explanation</div>
              <div style={box({ minHeight: 86 })}>{current?.message ?? "—"}</div>

              <div style={{ marginTop: 14, fontWeight: 900, fontSize: 14 }}>Operations (live)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                <Metric label="Comparisons" value={liveComparisons} />
                <Metric label="Swaps" value={liveSwaps} />
                <Metric label="Passes" value={livePasses} />
                <Metric label="Writes" value={liveWrites} />
              </div>
            </>
          )}

          {tab === "complexity" && (
            <>
              <div style={{ fontWeight: 900, fontSize: 14 }}>Big-O summary</div>
              <div style={box()}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ color: "rgba(255,255,255,0.88)", fontWeight: 900 }}>{algoName}</div>
                  <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 12 }}>n = {arrayLen || "—"}</div>
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.82)", lineHeight: 1.5 }}>
                  <div>
                    <b>Time:</b> {bigO.time}
                  </div>
                  <div>
                    <b>Space:</b> {bigO.space}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 14, fontWeight: 900, fontSize: 14 }}>Live vs estimated work</div>
              <div style={box()}>
                <Row label="Live comparisons" value={fmt(liveComparisons)} />
                <Row label="Worst-case comparisons (≈ n(n-1)/2)" value={fmt(est.worst)} />
                <Row label="Best-case comparisons" value={fmt(est.best)} />
              </div>

              <div style={{ marginTop: 14, fontWeight: 900, fontSize: 14 }}>Complexity growth demo</div>
              <div style={box()}>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  {[10, 100, 1000].map((n) => (
                    <button
                      key={n}
                      onClick={() => setGrowthN(n as 10 | 100 | 1000)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: growthN === n ? "rgba(106,169,255,0.20)" : "rgba(255,255,255,0.05)",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: 900,
                        fontSize: 12,
                      }}
                    >
                      n = {n}
                    </button>
                  ))}
                </div>

                {[10, 100, 1000].map((n) => {
                  const { best, worst } = estimateWorstComparisons(algo, n);
                  const isFocus = n === growthN;
                  const pct = Math.min(worst / growthMaxWorst, 1);

                  return (
                    <div
                      key={n}
                      style={{
                        padding: 10,
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: isFocus ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ fontWeight: 900, color: "rgba(255,255,255,0.88)" }}>n = {n}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.70)" }}>worst ≈ {fmt(worst)}</div>
                      </div>

                      <div
                        style={{
                          height: 10,
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.10)",
                          overflow: "hidden",
                          marginTop: 8,
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct * 100}%`,
                            background: isFocus ? "rgba(106,169,255,0.55)" : "rgba(255,255,255,0.25)",
                            transition: "width 200ms ease",
                          }}
                        />
                      </div>

                      <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.72)" }}>
                        Best ≈ {fmt(best)} • Worst ≈ {fmt(worst)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */

function btn(): CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    cursor: "pointer",
    fontWeight: 800,
  };
}

function btnPrimary(): CSSProperties {
  return {
    ...btn(),
    background: "rgba(106,169,255,0.22)",
    border: "1px solid rgba(106,169,255,0.35)",
  };
}

function tabBtn(active: boolean): CSSProperties {
  return {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: active ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
    color: "white",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 12,
    flex: 1,
  };
}

function box(extra?: CSSProperties): CSSProperties {
  return {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    lineHeight: 1.35,
    color: "rgba(255,255,255,0.88)",
    ...extra,
  };
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.035)",
        padding: 12,
      }}
    >
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 18, fontWeight: 900, color: "rgba(255,255,255,0.90)" }}>{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 6 }}>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.70)" }}>{label}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.88)", fontWeight: 900 }}>{value}</div>
    </div>
  );
}

function ToggleButton({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.12)",
        background: on ? "rgba(74,222,128,0.18)" : "rgba(255,255,255,0.05)",
        color: "white",
        cursor: "pointer",
        fontWeight: 900,
        fontSize: 12,
      }}
    >
      {label}: {on ? "ON" : "OFF"}
    </button>
  );
}
