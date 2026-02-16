import type { CSSProperties } from "react";

type AlgorithmInfoCardProps = {
  title?: string;
  description?: string;
  bullets?: string[];
  bigO?: { time: string; space: string };
};

export default function AlgorithmInfoCard({
  title = "Algorithm Info",
  description = "Pick an algorithm to see what it does and why it works.",
  bullets = [],
  bigO,
}: AlgorithmInfoCardProps) {
  return (
    <div style={wrap}>
      <div style={titleStyle}>{title}</div>

      <div style={descStyle}>{description}</div>

      {bigO && (
        <div style={pillRow}>
          <div style={pill}>
            <b>Time:</b> {bigO.time}
          </div>
          <div style={pill}>
            <b>Space:</b> {bigO.space}
          </div>
        </div>
      )}

      {bullets.length > 0 && (
        <ul style={ul}>
          {bullets.map((b, i) => (
            <li key={i} style={{ marginBottom: 6 }}>
              {b}
            </li>
          ))}
        </ul>
      )}
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
  marginBottom: 8,
  color: "rgba(255,255,255,0.92)",
};

const descStyle: CSSProperties = {
  color: "rgba(255,255,255,0.78)",
  fontSize: 13,
  lineHeight: 1.45,
};

const pillRow: CSSProperties = {
  display: "flex",
  gap: 8,
  marginTop: 10,
  flexWrap: "wrap",
};

const pill: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
  color: "rgba(255,255,255,0.86)",
  fontSize: 12,
  fontWeight: 800,
};

const ul: CSSProperties = {
  marginTop: 10,
  paddingLeft: 18,
  color: "rgba(255,255,255,0.78)",
  fontSize: 13,
  lineHeight: 1.45,
};
