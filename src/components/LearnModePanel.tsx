import type { ReactNode, CSSProperties } from "react";

type LearnModePanelProps = {
  title?: string;
  children?: ReactNode;
};

export default function LearnModePanel({ title = "Learn Mode", children }: LearnModePanelProps) {
  return (
    <div style={wrap}>
      <div style={titleStyle}>{title}</div>
      <div style={{ color: "rgba(255,255,255,0.78)", fontSize: 13, lineHeight: 1.45 }}>
        {children ?? "Tips, examples, and quizzes can live here."}
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

const titleStyle: CSSProperties = {
  fontWeight: 900,
  marginBottom: 10,
  color: "rgba(255,255,255,0.90)",
};
