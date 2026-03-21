import { useState } from "react";
import {
  X,
  Phone,
  Lock,
  User,
  Mail,
  ArrowRight,
  Loader,
  KeyRound,
  ChevronLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

interface Props {
  onClose: () => void;
}
type Tab = "login" | "register" | "forgot";

// Regular text/tel/email field
function Field({
  icon,
  placeholder,
  type = "text",
  value,
  onChange,
  onEnter,
}: {
  icon: React.ReactNode;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
}) {
  return (
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
      <span style={{ color: "var(--text-lo)", flexShrink: 0 }}>{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        style={{
          background: "transparent",
          outline: "none",
          color: "var(--text-hi)",
          fontSize: 16,
          width: "100%",
        }}
      />
    </div>
  );
}

// Password field with show/hide toggle
function PasswordField({
  placeholder,
  value,
  onChange,
  onEnter,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
}) {
  const [show, setShow] = useState(false);
  return (
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
      <span style={{ color: "var(--text-lo)", flexShrink: 0 }}>
        <Lock size={18} />
      </span>
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
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
        onClick={() => setShow((v) => !v)}
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
        tabIndex={-1}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default function AuthModal({ onClose }: Props) {
  const { login } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [lPhone, setLPhone] = useState("");
  const [lPass, setLPass] = useState("");
  const [rNome, setRNome] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPhone, setRPhone] = useState("");
  const [rPass, setRPass] = useState("");
  const [fEmail, setFEmail] = useState("");

  const reset = () => {
    setError("");
    setOk("");
  };

  const doLogin = async () => {
    reset();
    setLoading(true);
    try {
      const { data } = await api.post("/auth", {
        telefone: Number(lPhone),
        senha: lPass,
      });
      const tok = data?.data?.token ?? "";
      const ref = data?.data?.refresh ?? "";
      const u = data?.data?.user ?? {};
      // level comes from login response: user.level
      const userLevel: number = Number(u.level ?? 3);

      // Decode role from JWT
      let role: UserRole = "OWNER";
      try {
        const p = JSON.parse(atob(tok.split(".")[1]));
        if (p?.role === "ADMIN") role = "ADMIN";
      } catch {
        /* keep */
      }

      if (!tok) throw new Error("Token inválido");
      login(
        tok,
        ref,
        { id: String(u.id ?? ""), nome: String(u.nome ?? "") },
        role,
        userLevel,
      );
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? "Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  };

  const doRegister = async () => {
    reset();
    setLoading(true);
    try {
      await api.post("/users", {
        nome: rNome,
        email: rEmail,
        telefone: Number(rPhone),
        senha: rPass,
      });
      setOk("Conta criada! Faça login agora.");
      setTab("login");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  const doForgot = async () => {
    reset();
    if (!fEmail.trim()) return setError("Informe o e-mail cadastrado.");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: fEmail.trim() });
      setOk(
        `Se o e-mail existir, enviaremos um link de recuperação para ${fEmail}. Verifique também o spam.`,
      );
      setFEmail("");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      if (msg?.toLowerCase().includes("suspensa")) {
        setError(msg);
      } else {
        setOk(
          msg ??
            `Se o e-mail existir, enviaremos um link de recuperação para ${fEmail}.`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

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
      <style>{`@media(min-width:640px){.auth-inner{align-self:center !important;border-radius:24px !important;}}`}</style>
      <div
        className="auth-inner anim-slide-up"
        style={{
          width: "100%",
          maxWidth: 480,
          alignSelf: "flex-end",
          borderRadius: "28px 28px 0 0",
          overflow: "hidden",
          background: "var(--s100)",
          border: "1px solid var(--border-md)",
          boxShadow: "0 -8px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 24px 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {tab === "forgot" && (
              <button
                onClick={() => {
                  setTab("login");
                  reset();
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--s200)",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-lo)",
                  marginRight: 4,
                }}
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "linear-gradient(135deg,#6366f1,#a78bfa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                style={{ width: 18, height: 18, color: "#fff" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span
              className="font-display"
              style={{ fontSize: 20, fontWeight: 800, color: "var(--text-hi)" }}
            >
              {tab === "forgot" ? "Recuperar senha" : "Minha Lista"}
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

        {/* Tabs */}
        {tab !== "forgot" && (
          <div style={{ padding: "0 24px 16px" }}>
            <div
              style={{
                display: "flex",
                gap: 6,
                padding: 5,
                borderRadius: 14,
                background: "var(--s200)",
              }}
            >
              {(["login", "register"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    reset();
                  }}
                  style={{
                    flex: 1,
                    padding: "12px 0",
                    fontSize: 16,
                    fontWeight: 700,
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background:
                      tab === t
                        ? "linear-gradient(135deg,#6366f1,#4f46e5)"
                        : "transparent",
                    color: tab === t ? "#fff" : "var(--text-lo)",
                    boxShadow:
                      tab === t ? "0 4px 16px rgba(99,102,241,0.3)" : "none",
                  }}
                >
                  {t === "login" ? "Entrar" : "Criar conta"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Body */}
        <div
          style={{
            padding: "0 24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {error && <Chip type="error" msg={error} />}
          {ok && <Chip type="success" msg={ok} />}

          {/* ── LOGIN ── */}
          {tab === "login" && (
            <>
              <Field
                icon={<Phone size={18} />}
                placeholder="Telefone  9XXXXXXXX"
                type="tel"
                value={lPhone}
                onChange={setLPhone}
              />
              <PasswordField
                placeholder="Senha"
                value={lPass}
                onChange={setLPass}
                onEnter={doLogin}
              />
              <button
                onClick={() => {
                  setTab("forgot");
                  reset();
                }}
                style={{
                  alignSelf: "flex-end",
                  fontSize: 14,
                  color: "var(--text-lo)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                  marginTop: -4,
                }}
              >
                Esqueci a senha
              </button>
              <button
                onClick={doLogin}
                disabled={loading}
                className="btn btn-pink"
                style={{ marginTop: 4, fontSize: 17 }}
              >
                {loading ? (
                  <Loader size={18} className="spin" />
                ) : (
                  <>
                    <span>Entrar na conta</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </>
          )}

          {/* ── REGISTER ── */}
          {tab === "register" && (
            <>
              <Field
                icon={<User size={18} />}
                placeholder="Nome completo"
                value={rNome}
                onChange={setRNome}
              />
              <Field
                icon={<Mail size={18} />}
                placeholder="E-mail"
                type="email"
                value={rEmail}
                onChange={setREmail}
              />
              <Field
                icon={<Phone size={18} />}
                placeholder="Telefone  9XXXXXXXX"
                type="tel"
                value={rPhone}
                onChange={setRPhone}
              />
              <PasswordField
                placeholder="Senha (mín. 6 caracteres)"
                value={rPass}
                onChange={setRPass}
                onEnter={doRegister}
              />
              <button
                onClick={doRegister}
                disabled={loading}
                className="btn btn-pink"
                style={{ marginTop: 4, fontSize: 17 }}
              >
                {loading ? (
                  <Loader size={18} className="spin" />
                ) : (
                  <>
                    <span>Criar minha conta</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </>
          )}

          {/* ── FORGOT ── */}
          {tab === "forgot" && (
            <>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--text-mid)",
                  lineHeight: 1.65,
                }}
              >
                Informe o e-mail da sua conta. Se ele existir no sistema,
                enviaremos um link para redefinir a sua senha.
              </p>
              <Field
                icon={<Mail size={18} />}
                placeholder="Seu e-mail cadastrado"
                type="email"
                value={fEmail}
                onChange={setFEmail}
                onEnter={doForgot}
              />
              <button
                onClick={doForgot}
                disabled={loading}
                className="btn btn-pink"
                style={{ marginTop: 4, fontSize: 17 }}
              >
                {loading ? (
                  <Loader size={18} className="spin" />
                ) : (
                  <>
                    <KeyRound size={17} />
                    <span>Enviar link de recuperação</span>
                  </>
                )}
              </button>
            </>
          )}
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
