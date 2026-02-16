import type { CSSProperties } from "react";

type SolvePanelProps = {
  title?: string;
  prompt?: string;
  onSolve?: (text: string) => void;
};

export default function SolvePanel({
  title = "Solve",
  prompt = "Paste a question here (future feature) and get a solution.",
  onSolve,
}: SolvePanelProps) {
  return (
    <div style={wrap}>
      <div style={titleStyle}>{title}</div>
      <div style={promptStyle}>{prompt}</div>

      <button style={btn} onClick={() => onSolve?.("")}>
        Solve (placeholder)
      </button>
    </div>
  );
}

const wrap: CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
  padding: 14,
};

const titleStyle: CSSProperties = {
  fontWeight: 900,
  marginBottom: 10,
  color: "rgba(255,255,255,0.90)",
};

const promptStyle: CSSProperties = {
  color: "rgba(255,255,255,0.75)",
  fontSize: 13,
  marginBottom: 12,
  lineHeight: 1.45,
};

const btn: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(106,169,255,0.35)",
  background: "rgba(106,169,255,0.18)",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};
