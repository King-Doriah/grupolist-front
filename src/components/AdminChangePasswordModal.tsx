import { useState } from "react";
import { X, Lock, Loader, ShieldCheck, EyeOff, Eye } from "lucide-react";
import api from "../services/api";

interface Props {
  onClose: () => void;
}

export default function AdminChangePasswordModal({ onClose }: Props) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const submit = async () => {
    setError("");
    setOk("");
    if (!current || !next || !confirm)
      return setError("Preencha todos os campos.");
    if (next !== confirm) return setError("As senhas novas não coincidem.");
    if (next.length < 6)
      return setError("A nova senha deve ter pelo menos 6 caracteres.");
    setLoading(true);
    try {
      await api.put("/users/me/changePassword", {
        password: current,
        newPassword: next,
      });
      setOk("Senha alterada com sucesso!");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? "Erro ao alterar senha. Verifique a senha actual.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      label: "Senha actual",
      val: current,
      set: setCurrent,
      show: showCurrent,
      toggle: () => setShowCurrent((v) => !v),
    },
    {
      label: "Nova senha",
      val: next,
      set: setNext,
      show: showNext,
      toggle: () => setShowNext((v) => !v),
    },
    {
      label: "Confirmar nova",
      val: confirm,
      set: setConfirm,
      show: showConfirm,
      toggle: () => setShowConfirm((v) => !v),
    },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(6,9,20,0.88)",
        backdropFilter: "blur(14px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <style>{`@media(min-width:640px){.acp-inner{align-self:center !important;border-radius:24px !important;}}`}</style>
      <div
        className="acp-inner anim-slide-up"
        style={{
          width: "100%",
          maxWidth: 440,
          alignSelf: "flex-end",
          borderRadius: "28px 28px 0 0",
          overflow: "hidden",
          background: "var(--s100)",
          border: "1px solid var(--border-md)",
          boxShadow: "0 -8px 60px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 24px 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "rgba(245,158,11,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Lock size={17} style={{ color: "#fcd34d" }} />
            </div>
            <span
              className="font-display"
              style={{ fontSize: 19, fontWeight: 800, color: "var(--text-hi)" }}
            >
              Trocar senha (Admin)
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--s200)",
              border: "none",
              cursor: "pointer",
              color: "var(--text-lo)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            padding: "0 24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {error && <Chip type="error" msg={error} />}
          {ok && (
            <div
              style={{
                borderRadius: 12,
                padding: "14px 16px",
                fontSize: 15,
                background: "rgba(16,185,129,0.10)",
                border: "1px solid rgba(16,185,129,0.25)",
                color: "#6ee7b7",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <ShieldCheck size={18} />
              {ok}
            </div>
          )}

          {fields.map(({ label, val, set, show, toggle }) => (
            <div
              key={label}
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
                type={show ? "text" : "password"}
                placeholder={label}
                value={val}
                onChange={(e) => set(e.target.value)}
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
                onClick={toggle}
                tabIndex={-1}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-lo)",
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          ))}

          <button
            onClick={submit}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "14px",
              borderRadius: 14,
              fontSize: 17,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg,#f59e0b,#ef4444)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(245,158,11,0.30)",
              marginTop: 4,
            }}
          >
            {loading ? (
              <Loader size={18} className="spin" />
            ) : (
              "Salvar nova senha"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Chip({ type, msg }: { type: "error" | "success"; msg: string }) {
  const s =
    type === "error"
      ? {
          bg: "rgba(244,63,94,0.10)",
          border: "rgba(244,63,94,0.25)",
          color: "#fca5a5",
        }
      : {
          bg: "rgba(16,185,129,0.10)",
          border: "rgba(16,185,129,0.25)",
          color: "#6ee7b7",
        };
  return (
    <div
      style={{
        borderRadius: 12,
        padding: "14px 16px",
        fontSize: 15,
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
      }}
    >
      {msg}
    </div>
  );
}
