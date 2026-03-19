import { useState } from "react";
import { X, Crown, Loader, CheckCircle2 } from "lucide-react";
import api from "../services/api";
import { type AdminUser, fmtDate } from "../types";

interface Props {
  user: AdminUser;
  onClose: () => void;
  onUpdated: () => void;
}

const PRESETS = [
  { label: "7 dias",   dias: 7   },
  { label: "15 dias",  dias: 15  },
  { label: "30 dias",  dias: 30  },
  { label: "60 dias",  dias: 60  },
  { label: "90 dias",  dias: 90  },
  { label: "365 dias", dias: 365 },
];

export default function UpdatePlanModal({ user, onClose, onUpdated }: Props) {
  const [dias,    setDias]    = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [done,    setDone]    = useState(false);
  const [result,  setResult]  = useState<{ plan: string; planExpires: string } | null>(null);

  const submit = async () => {
    setError("");
    const d = Number(dias);
    if (!d || d < 1) return setError("Informe um número de dias válido (mínimo 1).");
    setLoading(true);
    try {
      const res = await api.put(`/users/${user.id}/plan`, { dias: d });
      const data = res.data?.data;
      setResult({ plan: data.plan, planExpires: data.planExpires });
      setDone(true);
      onUpdated();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? "Erro ao atualizar plano.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        background: "rgba(6,9,20,0.88)", backdropFilter: "blur(14px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <style>{`@media(min-width:640px){.plan-inner{align-self:center !important;border-radius:24px !important;}}`}</style>
      <div
        className="plan-inner anim-slide-up"
        style={{
          width: "100%", maxWidth: 440, alignSelf: "flex-end",
          borderRadius: "28px 28px 0 0", overflow: "hidden",
          background: "var(--s100)", border: "1px solid var(--border-md)",
          boxShadow: "0 -8px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 24px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 12,
                background: "rgba(99,102,241,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Crown size={17} style={{ color: "#a5b4fc" }} />
            </div>
            <div>
              <span className="font-display" style={{ fontSize: 17, fontWeight: 800, color: "var(--text-hi)", display: "block" }}>
                Atualizar Plano
              </span>
              <span style={{ fontSize: 13, color: "var(--text-lo)" }}>{user.nome}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "var(--s200)", border: "none", cursor: "pointer", color: "var(--text-lo)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "0 24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

          {done && result ? (
            /* ── Success ── */
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div
                style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.28)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
                <CheckCircle2 size={28} style={{ color: "#a5b4fc" }} />
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-hi)", marginBottom: 6 }}>
                Plano atualizado!
              </p>
              <p style={{ fontSize: 14, color: "var(--text-mid)", marginBottom: 4 }}>
                {user.nome} agora tem o plano{" "}
                <span style={{ fontWeight: 700, color: "#a5b4fc" }}>{result.plan}</span>
              </p>
              <p style={{ fontSize: 13, color: "var(--text-lo)" }}>
                Válido até {fmtDate(result.planExpires)}
              </p>
              <button
                onClick={onClose}
                className="btn btn-pink"
                style={{ marginTop: 20, width: "100%", fontSize: 16 }}
              >
                Fechar
              </button>
            </div>
          ) : (
            <>
              {/* Current plan info */}
              <div
                style={{
                  borderRadius: 12, padding: "12px 14px",
                  background: "var(--s200)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                }}
              >
                <div>
                  <p style={{ fontSize: 12, color: "var(--text-lo)", marginBottom: 2 }}>Plano atual</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-hi)" }}>
                    {user.plan ?? "FREE"}
                    {user.plan === "PRO" && user.planExpires && (
                      <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-lo)", marginLeft: 8 }}>
                        · expira {fmtDate(user.planExpires)}
                      </span>
                    )}
                  </p>
                </div>
                {(user.plan ?? "FREE") === "FREE" ? (
                  <span className="plan-badge-free">FREE</span>
                ) : (
                  <span className="plan-badge-pro"><Crown size={10} style={{ display: "inline" }} /> PRO</span>
                )}
              </div>

              {error && (
                <div
                  style={{
                    borderRadius: 12, padding: "12px 14px", fontSize: 14,
                    background: "rgba(244,63,94,0.10)", border: "1px solid rgba(244,63,94,0.25)",
                    color: "#fca5a5",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Preset chips */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-lo)", marginBottom: 10 }}>
                  Escolha um período
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {PRESETS.map((p) => {
                    const active = dias === p.dias;
                    return (
                      <button
                        key={p.dias}
                        onClick={() => setDias(p.dias)}
                        style={{
                          padding: "8px 16px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                          cursor: "pointer", border: "none", transition: "all 0.15s",
                          background: active ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "var(--s200)",
                          color: active ? "#fff" : "var(--text-mid)",
                          boxShadow: active ? "0 4px 12px rgba(99,102,241,0.35)" : "none",
                          outline: active ? "none" : "1px solid var(--border)",
                        }}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom days input */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-lo)", marginBottom: 8 }}>
                  Ou insira manualmente
                </p>
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    background: "var(--s200)", border: "1.5px solid var(--border-md)",
                    borderRadius: 14, padding: "13px 18px",
                  }}
                >
                  <Crown size={16} style={{ color: "var(--text-lo)", flexShrink: 0 }} />
                  <input
                    type="number"
                    min={1}
                    placeholder="Número de dias (ex: 30)"
                    value={dias}
                    onChange={(e) => setDias(e.target.value === "" ? "" : Number(e.target.value))}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    style={{
                      background: "transparent", outline: "none",
                      color: "var(--text-hi)", fontSize: 16, width: "100%",
                    }}
                  />
                </div>
              </div>

              <button
                onClick={submit}
                disabled={loading || dias === "" || Number(dias) < 1}
                className="btn btn-pink"
                style={{ fontSize: 16 }}
              >
                {loading ? (
                  <Loader size={18} className="spin" />
                ) : (
                  <><Crown size={16} /> Ativar plano PRO</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
