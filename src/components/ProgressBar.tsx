import {
  type ListStatus,
  STATUS_FLOW,
  STATUS_LABEL,
  STATUS_EMOJI,
} from "../types";

export default function ProgressBar({ current }: { current: ListStatus }) {
  const idx = STATUS_FLOW.indexOf(current);
  const pct = idx < 0 ? 0 : (idx / (STATUS_FLOW.length - 1)) * 100;

  return (
    <div style={{ position: "relative" }}>
      {/* Track */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          right: 14,
          height: 2,
          background: "var(--border-md)",
          borderRadius: 99,
        }}
      />
      {/* Fill */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          height: 2,
          borderRadius: 99,
          background: "linear-gradient(90deg,#6366f1,#a78bfa,#34d399)",
          transition: "width 0.7s ease",
          width: `calc(${pct}% * (100% - 28px) / 100)`,
        }}
      />
      {/* Steps */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        {STATUS_FLOW.map((s, i) => {
          const done = i <= idx;
          return (
            <div
              key={s}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  transition: "all 0.3s",
                  background: done
                    ? "linear-gradient(135deg,#6366f1,#a78bfa)"
                    : "var(--s300)",
                  border: done ? "none" : "2px solid var(--border-md)",
                  color: done ? "#fff" : "var(--text-dim)",
                  boxShadow: done ? "0 0 12px rgba(99,102,241,0.4)" : "none",
                }}
              >
                {done ? STATUS_EMOJI[s] : i + 1}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textAlign: "center",
                  lineHeight: 1.3,
                  maxWidth: 56,
                  color: done ? "var(--text-mid)" : "var(--text-lo)",
                }}
              >
                {STATUS_LABEL[s]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
