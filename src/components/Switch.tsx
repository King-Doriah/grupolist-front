interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  sub?: string;
}

export default function Switch({ checked, onChange, label, sub }: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        textAlign: "left",
      }}
    >
      <div>
        <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-hi)" }}>
          {label}
        </p>
        {sub && (
          <p style={{ fontSize: 14, color: "var(--text-lo)", marginTop: 4 }}>
            {sub}
          </p>
        )}
      </div>
      <div className={`switch-track ${checked ? "on" : "off"}`}>
        <div className="switch-thumb" />
      </div>
    </button>
  );
}
