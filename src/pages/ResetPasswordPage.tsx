import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Lock,
  Loader,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../services/api";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    setError("");
    if (!password || !confirm) return setError("Preencha todos os campos.");
    if (password !== confirm) return setError("As senhas não coincidem.");
    if (password.length < 6)
      return setError("A senha deve ter pelo menos 6 caracteres.");
    if (!token) return setError("Token inválido ou expirado.");
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? "Link inválido ou expirado. Solicite um novo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--s0)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* Blob decoration */}
      <div
        style={{
          position: "fixed",
          top: -60,
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(99,102,241,0.12),transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 24,
          overflow: "hidden",
          background: "var(--s100)",
          border: "1px solid var(--border-md)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "28px 28px 20px", textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: "linear-gradient(135deg,#6366f1,#a78bfa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Lock size={26} style={{ color: "#fff" }} />
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "var(--text-hi)",
              marginBottom: 8,
            }}
          >
            Redefinir senha
          </h1>
          <p
            style={{ fontSize: 15, color: "var(--text-mid)", lineHeight: 1.6 }}
          >
            {done
              ? "Tudo certo! Agora pode fazer login com a nova senha."
              : "Crie uma nova senha segura para a sua conta."}
          </p>
        </div>

        <div
          style={{
            padding: "0 28px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {done ? (
            /* ── Success state ── */
            <>
              <div
                style={{
                  borderRadius: 14,
                  padding: "20px",
                  background: "rgba(16,185,129,0.10)",
                  border: "1px solid rgba(16,185,129,0.25)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  textAlign: "center",
                }}
              >
                <CheckCircle2 size={36} style={{ color: "#6ee7b7" }} />
                <p style={{ fontSize: 16, color: "#6ee7b7", fontWeight: 600 }}>
                  Senha redefinida com sucesso!
                </p>
              </div>
              <button
                onClick={() => navigate("/")}
                className="btn btn-pink"
                style={{ fontSize: 17, marginTop: 4 }}
              >
                Ir para o início
              </button>
            </>
          ) : (
            /* ── Form ── */
            <>
              {error && (
                <div
                  style={{
                    borderRadius: 12,
                    padding: "14px 16px",
                    fontSize: 15,
                    background: "rgba(244,63,94,0.10)",
                    border: "1px solid rgba(244,63,94,0.25)",
                    color: "#fca5a5",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Nova senha */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: "var(--s200)",
                  border: "1.5px solid var(--border-md)",
                  borderRadius: 14,
                  padding: "15px 18px",
                }}
              >
                <Lock
                  size={17}
                  style={{ color: "var(--text-lo)", flexShrink: 0 }}
                />
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  style={{
                    background: "transparent",
                    outline: "none",
                    color: "var(--text-hi)",
                    fontSize: 16,
                    width: "100%",
                    flex: 1,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-lo)",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Confirmar senha */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: "var(--s200)",
                  border: "1.5px solid var(--border-md)",
                  borderRadius: 14,
                  padding: "15px 18px",
                }}
              >
                <Lock
                  size={17}
                  style={{ color: "var(--text-lo)", flexShrink: 0 }}
                />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirmar nova senha"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  style={{
                    background: "transparent",
                    outline: "none",
                    color: "var(--text-hi)",
                    fontSize: 16,
                    width: "100%",
                    flex: 1,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-lo)",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 99,
                        background:
                          password.length >= i * 3
                            ? password.length >= 10
                              ? "#6ee7b7"
                              : password.length >= 7
                                ? "#fcd34d"
                                : "#f87171"
                            : "var(--border-md)",
                        transition: "background 0.3s",
                      }}
                    />
                  ))}
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text-lo)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {password.length < 6
                      ? "Muito curta"
                      : password.length < 8
                        ? "Fraca"
                        : password.length < 10
                          ? "Média"
                          : "Forte"}
                  </span>
                </div>
              )}

              <button
                onClick={submit}
                disabled={loading}
                className="btn btn-pink"
                style={{ marginTop: 4, fontSize: 17 }}
              >
                {loading ? (
                  <Loader size={18} className="spin" />
                ) : (
                  "Redefinir senha"
                )}
              </button>

              <button
                onClick={() => navigate("/")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  color: "var(--text-lo)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  marginTop: 4,
                }}
              >
                <ArrowLeft size={14} /> Voltar ao início
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
