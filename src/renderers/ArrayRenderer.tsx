import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ArrayState } from "../algorithms/types";

type RenderStyle = "bars" | "spheres" | "cards";

type SwapAnim = {
  i: number;
  j: number;
  prime: boolean;
  dx: number;
  key: string;
};

export function ArrayRenderer({
  state,
  showValues = true,
  showIndices = false,
  renderStyle = "bars",
}: {
  state: ArrayState;
  showValues?: boolean;
  showIndices?: boolean;
  renderStyle?: RenderStyle;
}) {
  const arr = state?.array ?? [];
  const max = Math.max(...arr, 1);

  const sortedSet = new Set(state?.sorted ?? []);
  const highlight = (state?.highlight ?? []).filter((x) => typeof x === "number") as number[];
  const highlightSet = new Set(highlight);
  const swap = state?.swap ?? null;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const GAP = 8;
  const [pitch, setPitch] = useState<number>(0);

  const n = Math.max(arr.length, 1);
  const gridCols = `repeat(${n}, 1fr)`;
  const dense = arr.length > 22;
  const valueFont = dense ? 10 : 12;
  const indexFont = dense ? 9 : 11;

  // ---------- stable rounding helpers ----------
  const round1 = (x: number) => Math.round(x * 10) / 10;
  const approxEq = (a: number, b: number, eps = 0.6) => Math.abs(a - b) <= eps;

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const w = el.getBoundingClientRect().width;
      const cellW = (w - GAP * (n - 1)) / n;
      const nextPitch = cellW + GAP;

      // only update pitch if it actually changed
      setPitch((prev) => (approxEq(prev, nextPitch, 0.2) ? prev : nextPitch));
    };

    compute();

    const RO = (window as any).ResizeObserver;
    if (RO) {
      const ro = new RO(() => compute());
      ro.observe(el);
      return () => ro.disconnect();
    } else {
      window.addEventListener("resize", compute);
      return () => window.removeEventListener("resize", compute);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const setItemRef = (idx: number) => (el: HTMLDivElement | null) => {
    itemRefs.current[idx] = el;
  };

  const [compareUI, setCompareUI] = useState<{
    show: boolean;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    labelX: number;
    labelY: number;
    a: number;
    b: number;
    va: number;
    vb: number;
    ok: boolean; // va <= vb
  }>({
    show: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    labelX: 0,
    labelY: 0,
    a: 0,
    b: 0,
    va: 0,
    vb: 0,
    ok: true,
  });

  const highlightPair = useMemo(() => {
    const uniq = Array.from(new Set(highlight)).filter((i) => i >= 0 && i < arr.length);
    if (uniq.length >= 2) return [uniq[0], uniq[1]] as const;
    return null;
  }, [highlight, arr.length]);

  // ✅ IMPORTANT FIX: guard state updates to stop infinite loops
  useLayoutEffect(() => {
    if (!highlightPair) {
      setCompareUI((prev) => (prev.show ? { ...prev, show: false } : prev));
      return;
    }

    const [a, b] = highlightPair;
    const elA = itemRefs.current[a];
    const elB = itemRefs.current[b];
    const overlay = overlayRef.current;

    if (!elA || !elB || !overlay) {
      setCompareUI((prev) => (prev.show ? { ...prev, show: false } : prev));
      return;
    }

    const rA = elA.getBoundingClientRect();
    const rB = elB.getBoundingClientRect();
    const rO = overlay.getBoundingClientRect();

    const x1 = round1((rA.left + rA.right) / 2 - rO.left);
    const x2 = round1((rB.left + rB.right) / 2 - rO.left);

    const yA = (rA.top + rA.bottom) / 2 - rO.top;
    const yB = (rB.top + rB.bottom) / 2 - rO.top;

    const lineOffset = 18;
    const y1 = round1(yA - lineOffset);
    const y2 = round1(yB - lineOffset);

    const labelX = round1((x1 + x2) / 2);
    const labelY = round1(Math.min(y1, y2) - 16);

    const va = arr[a] ?? 0;
    const vb = arr[b] ?? 0;
    const ok = va <= vb;

    const next = {
      show: true,
      x1,
      y1,
      x2,
      y2,
      labelX,
      labelY,
      a,
      b,
      va,
      vb,
      ok,
    };

    setCompareUI((prev) => {
      // if effectively same, DON'T update (prevents update-depth loop)
      if (
        prev.show === next.show &&
        prev.a === next.a &&
        prev.b === next.b &&
        prev.va === next.va &&
        prev.vb === next.vb &&
        prev.ok === next.ok &&
        approxEq(prev.x1, next.x1) &&
        approxEq(prev.y1, next.y1) &&
        approxEq(prev.x2, next.x2) &&
        approxEq(prev.y2, next.y2) &&
        approxEq(prev.labelX, next.labelX) &&
        approxEq(prev.labelY, next.labelY)
      ) {
        return prev;
      }
      return next;
    });
  }, [highlightPair, arr]); // keep deps tight: only what changes positions/values

  const prevArrRef = useRef<number[] | null>(null);
  const [swapAnim, setSwapAnim] = useState<SwapAnim | null>(null);

  const swapKey = useMemo(() => {
    if (!swap) return "";
    const a = Number(swap[0]);
    const b = Number(swap[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return "";
    return `${a}-${b}`;
  }, [swap]);

  const [bounce, setBounce] = useState<{ key: string; indices: Set<number> } | null>(null);
  const bounceTriggeredRef = useRef<string>("");

  function isSwapIndex(idx: number) {
    return !!(swap && (swap[0] === idx || swap[1] === idx));
  }

  function palette(i: number) {
    const sorted = sortedSet.has(i);
    const highlighted = highlightSet.has(i);
    const swapping = isSwapIndex(i);

    const baseBg = "rgba(255,255,255,0.06)";
    const sortedBg = "rgba(74,222,128,0.22)";
    const highlightBg = "rgba(106,169,255,0.22)";
    const swapBg = "rgba(255,106,122,0.22)";

    const borderBase = "1px solid rgba(255,255,255,0.10)";
    const borderSorted = "1px solid rgba(74,222,128,0.35)";
    const borderHighlight = "1px solid rgba(106,169,255,0.35)";
    const borderSwap = "1px solid rgba(255,106,122,0.35)";

    let bg = baseBg;
    let border = borderBase;

    if (sorted) {
      bg = sortedBg;
      border = borderSorted;
    }
    if (highlighted) {
      bg = highlightBg;
      border = borderHighlight;
    }
    if (swapping) {
      bg = swapBg;
      border = borderSwap;
    }

    const pulse =
      highlighted && !swapping
        ? "pulse 700ms ease-in-out infinite"
        : swapping
        ? "pulseStrong 520ms ease-in-out infinite"
        : "none";

    return { bg, border, pulse };
  }

  function shouldBounceIndex(idx: number) {
    return !!bounce?.indices?.has(idx);
  }

  function composeAnim(pulse: string, doBounce: boolean) {
    const parts: string[] = [];
    if (pulse && pulse !== "none") parts.push(pulse);
    if (doBounce) parts.push("bounce 240ms cubic-bezier(.2,.9,.2,1) 1");
    return parts.length ? parts.join(", ") : "none";
  }

  function primeTransformForIndex(idx: number): { transform?: string; transition?: string } {
    if (!swapAnim) return {};
    if (!swapAnim.prime) return {};
    const { i, j, dx } = swapAnim;
    if (idx !== i && idx !== j) return {};
    const from = idx === i ? dx : -dx;
    return { transform: `translateX(${from}px) translateY(0px)`, transition: "none" };
  }

  function runSwapArcAnimation(anim: SwapAnim) {
    const { i, j, dx, key } = anim;
    const elI = itemRefs.current[i];
    const elJ = itemRefs.current[j];
    if (!elI || !elJ) return;

    if (bounceTriggeredRef.current === key) return;
    bounceTriggeredRef.current = key;

    const ARC = dense ? 7 : 9;

    const fromI = dx;
    const fromJ = -dx;

    const timing: KeyframeAnimationOptions = {
      duration: 260,
      easing: "cubic-bezier(.2,.9,.2,1)",
      fill: "both",
    };

    elI.style.transform = `translateX(${fromI}px) translateY(0px)`;
    elJ.style.transform = `translateX(${fromJ}px) translateY(0px)`;

    const a1 = elI.animate(
      [
        { transform: `translateX(${fromI}px) translateY(0px)` },
        { transform: `translateX(${fromI * 0.5}px) translateY(${-ARC}px)` },
        { transform: `translateX(0px) translateY(0px)` },
      ],
      timing
    );

    const a2 = elJ.animate(
      [
        { transform: `translateX(${fromJ}px) translateY(0px)` },
        { transform: `translateX(${fromJ * 0.5}px) translateY(${ARC}px)` },
        { transform: `translateX(0px) translateY(0px)` },
      ],
      timing
    );

    let finished = 0;
    const onFinish = () => {
      finished += 1;
      if (finished < 2) return;

      elI.style.transform = "translateX(0px) translateY(0px)";
      elJ.style.transform = "translateX(0px) translateY(0px)";

      setBounce({ key, indices: new Set([i, j]) });
      window.setTimeout(() => {
        setBounce((b) => (b && b.key === key ? null : b));
      }, 280);

      setSwapAnim(null);
    };

    a1.onfinish = onFinish;
    a2.onfinish = onFinish;
  }

  useEffect(() => {
    const prev = prevArrRef.current;
    prevArrRef.current = arr;

    if (!(renderStyle === "spheres" || renderStyle === "cards")) return;
    if (!swap || !swapKey) return;
    if (!prev || prev.length !== arr.length) return;
    if (!pitch || pitch <= 0) return;

    const i = swap[0];
    const j = swap[1];
    if (typeof i !== "number" || typeof j !== "number") return;
    if (i < 0 || j < 0 || i >= arr.length || j >= arr.length) return;
    if (i === j) return;

    const didSwap = prev[i] === arr[j] && prev[j] === arr[i];
    if (!didSwap) return;

    const dx = (j - i) * pitch;
    const key = `${swapKey}|${arr.join(",")}`;

    bounceTriggeredRef.current = "";
    setSwapAnim({ i, j, prime: true, dx, key });

    const raf1 = requestAnimationFrame(() => {
      setSwapAnim((s) => (s && s.key === key ? { ...s, prime: false } : s));
      const raf2 = requestAnimationFrame(() => {
        runSwapArcAnimation({ i, j, prime: false, dx, key });
      });
      return () => cancelAnimationFrame(raf2);
    });

    return () => cancelAnimationFrame(raf1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arr, swap, swapKey, pitch, renderStyle]);

  const compareColor = compareUI.ok ? "rgba(74,222,128,0.92)" : "rgba(255,106,122,0.92)";
  const compareBorder = compareUI.ok ? "rgba(74,222,128,0.28)" : "rgba(255,106,122,0.28)";
  const compareGlow = compareUI.ok ? "rgba(74,222,128,0.18)" : "rgba(255,106,122,0.18)";
  const compareTextSub = compareUI.ok ? "rgba(219,255,233,0.72)" : "rgba(255,223,226,0.72)";

  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
        padding: 14,
      }}
    >
      <style>
        {`
          @keyframes pulse {
            0%   { transform: translateZ(0) scale(1);    filter: brightness(1); }
            50%  { transform: translateZ(0) scale(1.04); filter: brightness(1.12); }
            100% { transform: translateZ(0) scale(1);    filter: brightness(1); }
          }
          @keyframes pulseStrong {
            0%   { transform: translateZ(0) scale(1);    filter: brightness(1); }
            50%  { transform: translateZ(0) scale(1.08); filter: brightness(1.20); }
            100% { transform: translateZ(0) scale(1);    filter: brightness(1); }
          }
          @keyframes bounce {
            0%   { transform: translateY(0) scale(1); }
            45%  { transform: translateY(-6px) scale(1.06); }
            100% { transform: translateY(0) scale(1); }
          }
        `}
      </style>

      {showValues && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: gridCols,
            gap: GAP,
            alignItems: "end",
            marginBottom: 8,
          }}
        >
          {arr.map((v, i) => {
            const p = palette(i);
            return (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  fontSize: valueFont,
                  color: "rgba(255,255,255,0.82)",
                  padding: "2px 0",
                  borderRadius: 8,
                  background: p.bg,
                }}
              >
                {v}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ position: "relative" }} ref={overlayRef}>
        {compareUI.show && (
          <div
            style={{
              position: "absolute",
              left: compareUI.labelX,
              top: compareUI.labelY,
              transform: "translateX(-50%)",
              zIndex: 4,
              pointerEvents: "none",
              padding: "6px 10px",
              borderRadius: 999,
              border: `1px solid ${compareBorder}`,
              background: "rgba(10,14,20,0.76)",
              boxShadow: `0 12px 34px rgba(0,0,0,0.25), 0 0 0 6px ${compareGlow}`,
              color: compareColor,
              fontSize: 12,
              fontWeight: 900,
              whiteSpace: "nowrap",
            }}
          >
            Compare {compareUI.a} ↔ {compareUI.b}
            <span style={{ marginLeft: 8, fontWeight: 800, color: compareTextSub }}>
              ({compareUI.va} vs {compareUI.vb}) • {compareUI.ok ? "OK" : "Swap needed"}
            </span>
          </div>
        )}

        <svg
          width="100%"
          height="260"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 3,
            overflow: "visible",
          }}
        >
          {compareUI.show && (
            <>
              <line
                x1={compareUI.x1}
                y1={compareUI.y1}
                x2={compareUI.x2}
                y2={compareUI.y2}
                stroke={compareUI.ok ? "rgba(74,222,128,0.20)" : "rgba(255,106,122,0.20)"}
                strokeWidth={6}
                strokeLinecap="round"
              />
              <line
                x1={compareUI.x1}
                y1={compareUI.y1}
                x2={compareUI.x2}
                y2={compareUI.y2}
                stroke={compareUI.ok ? "rgba(74,222,128,0.70)" : "rgba(255,106,122,0.70)"}
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="4 4"
              />
              <circle cx={compareUI.x1} cy={compareUI.y1} r={4} fill={compareColor} />
              <circle cx={compareUI.x2} cy={compareUI.y2} r={4} fill={compareColor} />
            </>
          )}
        </svg>

        <div ref={containerRef}>
          {renderStyle === "bars" && (
            <div
              style={{
                height: 260,
                display: "grid",
                gridTemplateColumns: gridCols,
                gap: GAP,
                alignItems: "end",
                position: "relative",
                zIndex: 1,
              }}
            >
              {arr.map((v, i) => {
                const heightPct = Math.max(4, Math.round((v / max) * 100));
                const p = palette(i);

                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div
                      ref={setItemRef(i)}
                      style={{
                        height: `${heightPct}%`,
                        minHeight: 10,
                        borderRadius: 12,
                        background: p.bg,
                        border: p.border,
                        transition: "height 180ms ease, background 180ms ease, border-color 180ms ease",
                        animation: p.pulse,
                      }}
                    />
                    {showIndices && (
                      <div style={{ textAlign: "center", fontSize: indexFont, color: "rgba(255,255,255,0.55)" }}>
                        {i}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {renderStyle === "spheres" && (
            <div
              style={{
                height: 260,
                display: "grid",
                gridTemplateColumns: gridCols,
                gap: GAP,
                alignItems: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              {arr.map((v, i) => {
                const p = palette(i);
                const prime = primeTransformForIndex(i);
                const doBounce = shouldBounceIndex(i);

                return (
                  <div
                    key={i}
                    ref={setItemRef(i)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      ...prime,
                      willChange: "transform",
                    }}
                  >
                    <div
                      style={{
                        width: dense ? 18 : 22,
                        height: dense ? 18 : 22,
                        borderRadius: 999,
                        background: p.bg,
                        border: p.border,
                        animation: composeAnim(p.pulse, doBounce),
                        transition: "background 180ms ease, border-color 180ms ease",
                        willChange: "transform",
                      }}
                    />
                    {showIndices && (
                      <div style={{ fontSize: indexFont, color: "rgba(255,255,255,0.55)" }}>{i}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {renderStyle === "cards" && (
            <div
              style={{
                height: 260,
                display: "grid",
                gridTemplateColumns: gridCols,
                gap: GAP,
                alignItems: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              {arr.map((v, i) => {
                const p = palette(i);
                const prime = primeTransformForIndex(i);
                const doBounce = shouldBounceIndex(i);

                return (
                  <div
                    key={i}
                    ref={setItemRef(i)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      ...prime,
                      willChange: "transform",
                    }}
                  >
                    <div
                      style={{
                        height: dense ? 46 : 56,
                        borderRadius: 14,
                        background: p.bg,
                        border: p.border,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        color: "rgba(255,255,255,0.88)",
                        fontSize: dense ? 12 : 14,
                        animation: composeAnim(p.pulse, doBounce),
                        transition: "background 180ms ease, border-color 180ms ease",
                        willChange: "transform",
                      }}
                    >
                      {showValues ? v : ""}
                    </div>

                    {showIndices && (
                      <div style={{ textAlign: "center", fontSize: indexFont, color: "rgba(255,255,255,0.55)" }}>
                        {i}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.60)", lineHeight: 1.4 }}>
        Legend: <b style={{ color: "rgba(74,222,128,0.95)" }}>sorted</b> •{" "}
        <b style={{ color: "rgba(106,169,255,0.95)" }}>active compare</b> •{" "}
        <b style={{ color: "rgba(255,106,122,0.95)" }}>swap</b>
      </div>
    </div>
  );
}
