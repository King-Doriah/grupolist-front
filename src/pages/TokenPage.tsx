import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Copy, Check, ArrowLeft } from "lucide-react";
import api, { imgUrl } from "../services/api";
import { type ListWithUser, safe, fmtDate, initial } from "../types";
import StatusBadge from "../components/StatusBadge";
import ProgressBar from "../components/ProgressBar";

export default function TokenPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ListWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token inválido.");
      setLoading(false);
      return;
    }
    api
      .get(`/lists/${token.toUpperCase()}`)
      .then(({ data: res }) => {
        const d = res?.data;
        if (!d || typeof d !== "object") throw new Error("Resposta inválida");
        setData(d as ListWithUser);
      })
      .catch((e) => {
        const msg = e?.response?.data?.message;
        setError(msg ?? "Lista não encontrada ou token inválido.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const copyLink = () => {
    if (!data?.token) return;
    const link = `${window.location.origin}/search/${data.token}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const photo = data ? imgUrl(data.foto) : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--s0)",
        padding: "0 0 80px",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(6,9,20,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          padding: "0 16px",
          height: 60,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--s200)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            color: "var(--text-mid)",
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: "linear-gradient(135deg,#6366f1,#a78bfa)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            style={{ width: 15, height: 15, color: "#fff" }}
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
          style={{ fontSize: 17, fontWeight: 700, color: "var(--text-hi)" }}
        >
          GrupoList
        </span>
      </header>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px" }}>
        {/* Loading */}
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 0",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "3px solid var(--border-md)",
                borderTopColor: "#6366f1",
              }}
              className="spin"
            />
            <p style={{ fontSize: 16, color: "var(--text-lo)" }}>
              Buscando lista…
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ textAlign: "center", padding: "72px 20px" }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🔍</div>
            <h2
              className="font-display"
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "var(--text-hi)",
                marginBottom: 10,
              }}
            >
              Lista não encontrada
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "var(--text-mid)",
                lineHeight: 1.65,
                marginBottom: 28,
              }}
            >
              {error}
            </p>
            <button
              onClick={() => navigate("/")}
              className="btn btn-pink"
              style={{ fontSize: 16 }}
            >
              <ArrowLeft size={16} /> Voltar ao início
            </button>
          </div>
        )}

        {/* Result */}
        {!loading && data && (
          <div className="anim-fade-in">
            {/* Product card */}
            <div
              style={{
                borderRadius: 20,
                overflow: "hidden",
                background: "var(--s100)",
                border: "1px solid var(--border-md)",
                marginBottom: 16,
              }}
            >
              {/* Photo */}
              <div
                style={{
                  position: "relative",
                  height: 220,
                  background: "var(--s200)",
                }}
              >
                {photo ? (
                  <img
                    src={photo}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    alt={safe(data.produto)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 64,
                    }}
                  >
                    🛍️
                  </div>
                )}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top,var(--s100) 0%,transparent 50%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 18,
                    left: 18,
                    right: 18,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <h1
                    className="font-display"
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "var(--text-hi)",
                      lineHeight: 1.3,
                      flex: 1,
                    }}
                  >
                    {safe(data.produto, "Produto")}
                  </h1>
                  <StatusBadge status={data.status} />
                </div>
              </div>

              {/* Info */}
              <div
                style={{
                  padding: "20px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                {/* Token row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <button onClick={copyLink} className="token">
                    {copied ? (
                      <Check size={13} style={{ color: "#34d399" }} />
                    ) : (
                      <Copy size={13} />
                    )}
                    {safe(data.token, "—")}
                  </button>
                  <span style={{ fontSize: 14, color: "var(--text-lo)" }}>
                    {fmtDate(data.createdAt || data.created_at || "")}
                  </span>
                </div>

                {/* Owner */}
                {data.user && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      borderRadius: 14,
                      padding: "14px 16px",
                      background: "var(--s200)",
                    }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#6366f1,#a78bfa)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {initial(data.user.nome)}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: "var(--text-hi)",
                        }}
                      >
                        {safe(data.user.nome, "Usuário")}
                      </p>
                      <p
                        style={{
                          fontSize: 14,
                          color: "var(--text-lo)",
                          marginTop: 2,
                        }}
                      >
                        {safe(String(data.user.telefone ?? ""), "—")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress card */}
            <div
              style={{
                borderRadius: 20,
                padding: "22px 20px",
                background: "var(--s100)",
                border: "1px solid var(--border-md)",
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "var(--text-lo)",
                  marginBottom: 18,
                }}
              >
                Progresso da lista
              </p>
              <ProgressBar current={data.status} />
            </div>

            {/* Info box */}
            <div
              style={{
                marginTop: 16,
                borderRadius: 16,
                padding: "16px 18px",
                background: "rgba(99,102,241,0.07)",
                border: "1px solid rgba(99,102,241,0.18)",
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-mid)",
                  lineHeight: 1.65,
                }}
              >
                Você está a acompanhar uma lista do{" "}
                <strong style={{ color: "var(--text-hi)" }}>GrupoList</strong>.
                O dono da lista irá actualizar o progresso em cada etapa.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
