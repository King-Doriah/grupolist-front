import { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Loader,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";

interface Props {
  onClose: () => void;
  onDone: () => void;
}

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

export default function RegisterAdminModal({ onClose, onDone }: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const submit = async () => {
    setError("");
    setOk("");
    if (!nome || !email || !telefone || !senha)
      return setError("Preencha todos os campos.");
    if (senha.length < 6)
      return setError("A senha deve ter pelo menos 6 caracteres.");
    setLoading(true);
    try {
      // POST /__admin302/register  — creates a new admin account
      await api.post("/__admin302/register", {
        nome,
        email,
        telefone: Number(telefone),
        senha,
        role: "ADMIN",
      });
      setOk(`Admin "${nome}" criado com sucesso!`);
      setNome("");
      setEmail("");
      setTelefone("");
      setSenha("");
      setTimeout(() => {
        onDone();
        onClose();
      }, 1500);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? "Erro ao criar admin. Verifique os dados.");
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
      <style>{`@media(min-width:640px){.ra-inner{align-self:center !important;border-radius:24px !important;}}`}</style>
      <div
        className="ra-inner anim-slide-up"
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
              <Shield size={17} style={{ color: "#fcd34d" }} />
            </div>
            <div>
              <span
                className="font-display"
                style={{
                  fontSize: 19,
                  fontWeight: 800,
                  color: "var(--text-hi)",
                }}
              >
                Novo Administrador
              </span>
              <p
                style={{ fontSize: 13, color: "var(--text-lo)", marginTop: 1 }}
              >
                Registrar nova conta de admin
              </p>
            </div>
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
              <CheckCircle2 size={18} />
              {ok}
            </div>
          )}

          <Field
            icon={<User size={17} />}
            placeholder="Nome completo"
            value={nome}
            onChange={setNome}
          />
          <Field
            icon={<Mail size={17} />}
            placeholder="E-mail"
            type="email"
            value={email}
            onChange={setEmail}
          />
          <Field
            icon={<Phone size={17} />}
            placeholder="Telefone  9XXXXXXXX"
            type="tel"
            value={telefone}
            onChange={setTelefone}
          />
          <Field
            icon={<Lock size={17} />}
            placeholder="Senha (mín. 6 caracteres)"
            type="password"
            value={senha}
            onChange={setSenha}
            onEnter={submit}
          />

          {/* Info note */}
          <div
            style={{
              borderRadius: 12,
              padding: "12px 14px",
              fontSize: 14,
              background: "rgba(245,158,11,0.07)",
              border: "1px solid rgba(245,158,11,0.18)",
              color: "var(--text-mid)",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <Shield
              size={15}
              style={{ color: "#fcd34d", flexShrink: 0, marginTop: 1 }}
            />
            <span>
              A nova conta terá acesso à área administrativa. Partilhe as
              credenciais de forma segura.
            </span>
          </div>

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
              <>
                <Shield size={17} />
                Criar administrador
              </>
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
