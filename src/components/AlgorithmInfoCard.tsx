import React from "react";

export type BigO = {
  best?: string;
  average?: string;
  worst?: string;
  space?: string;
};

export type AlgoInfo = {
  id: string;
  name: string;
  category: "Sorting" | "Searching" | "Other";
  short: string; // 1–2 line explanation
  whenToUse: string[]; // bullet list
  complexity: BigO;
  stable?: boolean;
  inPlace?: boolean;
  notes?: string[];
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.05)",
        fontSize: 12,
        color: "rgba(255,255,255,0.75)",
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "120px 1fr",
        gap: 10,
        padding: "8px 0",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.58)", fontSize: 12, fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ color: "rgba(255,255,255,0.84)", fontSize: 12, fontWeight: 800 }}>
        {value}
      </div>
    </div>
  );
}

export default function AlgorithmInfoCard({ info }: { info: AlgoInfo }) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
        padding: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 950, color: "rgba(255,255,255,0.92)" }}>
            {info.name}
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.62)", lineHeight: 1.4 }}>
            {info.short}
          </div>
        </div>

        <Pill>{info.category}</Pill>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        {typeof info.stable === "boolean" && (
          <Pill>Stable: {info.stable ? "Yes" : "No"}</Pill>
        )}
        {typeof info.inPlace === "boolean" && (
          <Pill>In-place: {info.inPlace ? "Yes" : "No"}</Pill>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <Row label="Best" value={info.complexity.best ?? "—"} />
        <Row label="Average" value={info.complexity.average ?? "—"} />
        <Row label="Worst" value={info.complexity.worst ?? "—"} />
        <Row label="Space" value={info.complexity.space ?? "—"} />
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 900, color: "rgba(255,255,255,0.80)" }}>
          When to use
        </div>
        <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: "rgba(255,255,255,0.72)", fontSize: 12, lineHeight: 1.5 }}>
          {info.whenToUse.map((x, idx) => (
            <li key={idx}>{x}</li>
          ))}
        </ul>
      </div>

      {info.notes?.length ? (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: "rgba(255,255,255,0.80)" }}>
            Notes
          </div>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: "rgba(255,255,255,0.66)", fontSize: 12, lineHeight: 1.5 }}>
            {info.notes.map((x, idx) => (
              <li key={idx}>{x}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
