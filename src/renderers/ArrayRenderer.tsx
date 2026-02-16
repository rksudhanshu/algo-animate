import type { CSSProperties } from "react";
import type { ArrayState } from "../algorithms/types";

type Props = {
  state: ArrayState;
};

function toSet(arr?: number[]) {
  return new Set((arr ?? []).filter((x) => Number.isFinite(x)));
}

export function ArrayRenderer({ state }: Props) {
  const a = state.array ?? [];
  const highlight = toSet(state.highlight as number[] | undefined);
  const comparing = toSet(state.comparing as number[] | undefined);
  const swapped = toSet(state.swapped as number[] | undefined);
  const sorted = toSet(state.sortedIndices as number[] | undefined);
  const active = toSet(state.activeIndices as number[] | undefined);

  const maxVal = Math.max(...a.map((n) => Math.abs(n)), 1);

  return (
    <div style={wrap}>
      <div style={chart}>
        {a.map((v, i) => {
          const h = highlight.has(i);
          const c = comparing.has(i);
          const s = swapped.has(i);
          const done = sorted.has(i);
          const act = active.has(i);

          const height = Math.max(8, Math.round((Math.abs(v) / maxVal) * 210));

          return (
            <div key={i} style={barSlot}>
              {/* sorted region shading */}
              <div style={{ ...sortedShade, opacity: done ? 1 : 0 }} />

              <div
                style={{
                  ...bar,
                  height,
                  opacity: done ? 0.92 : 1,
                  transform: s ? "translateY(-6px) scale(1.02)" : "translateY(0px) scale(1)",
                  borderColor: c ? "rgba(106,169,255,0.85)" : h ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.12)",
                  background: done
                    ? "rgba(74,222,128,0.55)"
                    : c
                      ? "rgba(106,169,255,0.40)"
                      : act
                        ? "rgba(255,255,255,0.16)"
                        : "rgba(255,255,255,0.09)",
                }}
                title={`index ${i} = ${v}`}
              />

              <div style={idx}>{i}</div>
            </div>
          );
        })}
      </div>

      <div style={footer}>
        <div style={{ fontWeight: 900, marginBottom: 6, color: "rgba(255,255,255,0.90)" }}>Explanation</div>
        <div style={{ color: "rgba(255,255,255,0.80)", lineHeight: 1.45 }}>{state.message ?? "—"}</div>

        <div style={{ marginTop: 10, display: "flex", gap: 16, flexWrap: "wrap", color: "rgba(255,255,255,0.75)" }}>
          <span>
            <b>comparisons:</b> {state.comparisons ?? 0}
          </span>
          <span>
            <b>swaps:</b> {state.swaps ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}

const wrap: CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
  padding: 14,
};

const chart: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  gap: 10,
  padding: 14,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.02)",
  minHeight: 280,
  overflowX: "auto",
};

const barSlot: CSSProperties = {
  position: "relative",
  width: 26,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
};

const sortedShade: CSSProperties = {
  position: "absolute",
  left: -8,
  right: -8,
  bottom: 20,
  top: 0,
  borderRadius: 12,
  background: "rgba(74,222,128,0.10)",
  border: "1px solid rgba(74,222,128,0.18)",
  pointerEvents: "none",
  transition: "opacity 160ms ease",
};

const bar: CSSProperties = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  transition: "transform 160ms ease, background 160ms ease, border-color 160ms ease, opacity 160ms ease",
};

const idx: CSSProperties = {
  fontSize: 12,
  color: "rgba(255,255,255,0.55)",
};

const footer: CSSProperties = {
  marginTop: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.02)",
  padding: 14,
};
