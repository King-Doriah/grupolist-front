import { useState, useEffect } from "react";
import {
  Search,
  ArrowRight,
  Zap,
  Users,
  Shield,
  Copy,
  Check,
  Loader,
} from "lucide-react";
import Navbar from "../components/Navbar";
import AuthModal from "../components/AuthModal";
import StatusBadge from "../components/StatusBadge";
import ProgressBar from "../components/ProgressBar";
import {
  type ListWithUser,
  type FaqItem,
  safe,
  fmtDate,
  initial,
} from "../types";
import api, { imgUrl } from "../services/api";

/* ── Fallback FAQs if API unavailable ────────────────────────────────────── */
const FALLBACK_FAQS: FaqItem[] = [
  {
    id: "1",
    pergunta: "Quem é o criador desse sistema?",
    resposta:
      "Esse sistema foi criado por Miraldino Paulo Dória, um programador de 23 anos e fundador da Startup LaurinSoft Tecnologies.",
  },
  {
    id: "2",
    pergunta: "O que é o Minha Lista?",
    resposta:
      "É uma plataforma para acompanhar compras em grupo em tempo real. O dono cria uma lista, compartilha um token único no WhatsApp ou outro canal e todos acompanham cada etapa — sem perguntar no off.",
  },
  {
    id: "3",
    pergunta: "Como funciona o token?",
    resposta:
      "Ao criar uma lista, um código único é gerado automaticamente (ex: ABBA7E28). Copie e cole no grupo. Qualquer pessoa com o token pode acompanhar, se a lista for pública.",
  },
  {
    id: "4",
    pergunta: "Preciso de conta para acompanhar?",
    resposta:
      "Não! Participantes não precisam de conta. Apenas o dono da lista precisa de conta gratuita para criar e atualizar.",
  },
  {
    id: "5",
    pergunta: "O que significa cada status?",
    resposta:
      "ABERTA: lista disponível. COMPRA FEITA: produto comprado. NO PROCESSO: produto está disponível para retirada do processo. ENCERRADA: todos já pagaram e retiraram.",
  },
  {
    id: "6",
    pergunta: "Posso ter listas privadas?",
    resposta:
      'Sim. Ao criar ou editar, use o switch "Lista pública" para controlar a visibilidade. Você pode mudar quando quiser.',
  },
  {
    id: "7",
    pergunta: "Quantas listas posso criar?",
    resposta: "No plano FREE tens 10 listas. No PRO é ilimitado.",
  },
  {
    id: "8",
    pergunta: "Como recupero a minha senha?",
    resposta:
      'Clica em "Esqueci a senha" no login e segue as instruções por email.',
  },
  {
    id: "9",
    pergunta: "Como compartilho minha lista?",
    resposta:
      "Após criar, copie o token com um toque e envie no grupo do WhatsApp.",
  },
];

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ListWithUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  /* Load FAQs from API */
  useEffect(() => {
    api
      .get("/faqs")
      .then(({ data }) => {
        const items: FaqItem[] = Array.isArray(data?.data) ? data.data : [];
        setFaqs(items.length > 0 ? items : FALLBACK_FAQS);
      })
      .catch(() => setFaqs(FALLBACK_FAQS));
  }, []);

  const search = async () => {
    const q = query.trim().toUpperCase();
    if (!q) return;
    setError("");
    setResult(null);
    setSearched(true);
    setLoading(true);
    try {
      const { data } = await api.get(`/lists/${q}`);
      const d = data?.data;
      if (!d || typeof d !== "object") throw new Error("Resposta inválida");
      setResult(d as ListWithUser);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? "Nenhuma lista encontrada.");
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    if (!result?.token) return;
    const link = `${window.location.origin}/search/${result.token}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const photo = result ? imgUrl(result.foto) : null;
  const date = result
    ? fmtDate(result.createdAt || result.created_at || "")
    : "";

  return (
    <div style={{ background: "var(--s0)", minHeight: "100vh" }}>
      <Navbar onOpenAuth={() => setShowAuth(true)} />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          paddingTop: 96,
          paddingBottom: 72,
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        <div
          className="blob-brand"
          style={{
            width: 600,
            height: 400,
            top: -80,
            left: "50%",
            transform: "translateX(-50%)",
            opacity: 0.65,
          }}
        />
        <div
          className="blob-purple"
          style={{
            width: 320,
            height: 320,
            top: 80,
            right: -60,
            opacity: 0.45,
          }}
        />

        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Badge */}
          <div
            className="anim-fade-up delay-1"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 18px",
              borderRadius: 99,
              marginBottom: 28,
              background: "rgba(99,102,241,0.10)",
              border: "1px solid rgba(99,102,241,0.25)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#818cf8",
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#a5b4fc" }}>
              Rastreamento de compras em grupo
            </span>
          </div>

          <h1
            className="anim-fade-up delay-2 font-display"
            style={{
              fontSize: "clamp(2.2rem, 8vw, 4rem)",
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              marginBottom: 20,
              color: "var(--text-hi)",
            }}
          >
            Chega de receber perguntas como...
            <br />
            <span className="grad-full">"A compra já foi feita?"</span>
          </h1>

          <p
            className="anim-fade-up delay-2"
            style={{
              fontSize: "clamp(1rem, 3vw, 1.2rem)",
              color: "var(--text-mid)",
              lineHeight: 1.7,
              maxWidth: 520,
              margin: "0 auto 36px",
            }}
          >
            Crie uma lista de compra em grupo, gere um token único e cole no
            WhatsApp. Todos acompanham — sem direct, sem confusão.
          </p>

          {/* Search */}
          <div
            className="anim-fade-up delay-3"
            style={{ maxWidth: 560, margin: "0 auto" }}
          >
            <div
              style={{
                display: "flex",
                gap: 10,
                padding: 8,
                borderRadius: 18,
                background: "var(--s100)",
                border: "1.5px solid var(--border-md)",
                boxShadow: "0 0 48px rgba(99,102,241,0.08)",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  paddingLeft: 14,
                }}
              >
                <Search
                  size={18}
                  style={{ color: "var(--text-lo)", flexShrink: 0 }}
                />
                <input
                  type="text"
                  placeholder="Cole o token — ex: ABBA7E28"
                  value={query}
                  onChange={(e) => setQuery(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && search()}
                  className="font-mono"
                  style={{
                    background: "transparent",
                    outline: "none",
                    color: "var(--text-hi)",
                    fontSize: 16,
                    width: "100%",
                    letterSpacing: "0.04em",
                  }}
                />
              </div>
              <button
                onClick={search}
                disabled={loading || !query.trim()}
                className="btn btn-pink"
                style={{
                  padding: "14px 20px",
                  borderRadius: 12,
                  minHeight: 52,
                }}
              >
                {loading ? (
                  <Loader size={18} className="spin" />
                ) : (
                  <ArrowRight size={18} />
                )}
              </button>
            </div>

            {searched && !loading && (
              <div
                className="anim-fade-in"
                style={{ marginTop: 16, textAlign: "left" }}
              >
                {error ? (
                  <div
                    style={{
                      borderRadius: 20,
                      padding: "28px 20px",
                      textAlign: "center",
                      background: "var(--s100)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
                    <p style={{ color: "var(--text-mid)", fontSize: 16 }}>
                      {error}
                    </p>
                  </div>
                ) : result ? (
                  <SearchResultCard
                    result={result}
                    date={date}
                    photo={photo}
                    copied={copied}
                    onCopy={copyToken}
                  />
                ) : null}
              </div>
            )}
          </div>

          <div
            className="anim-fade-up delay-4"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginTop: 28,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setShowAuth(true)}
              className="btn btn-outline"
            >
              Já tenho conta
            </button>
            <button onClick={() => setShowAuth(true)} className="btn btn-pink">
              Criar conta grátis <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section
        style={{ padding: "72px 20px", borderTop: "1px solid var(--border)" }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
                fontWeight: 800,
                color: "var(--text-hi)",
                marginBottom: 10,
              }}
            >
              Como funciona
            </h2>
            <p style={{ fontSize: 17, color: "var(--text-mid)" }}>
              Simples como mandar zap
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                n: "1",
                icon: "📋",
                title: "Cria a lista",
                desc: "Você abre uma lista com nome e foto. Define se é pública ou privada.",
              },
              {
                n: "2",
                icon: "📲",
                title: "Compartilha o token",
                desc: "Um token único é gerado. Cole no grupo do WhatsApp.",
              },
              {
                n: "3",
                icon: "✅",
                title: "Todos acompanham",
                desc: "Atualize o status. Todos veem em tempo real — sem perguntas.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="card"
                style={{
                  padding: "32px 28px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 24,
                    fontSize: 64,
                    fontWeight: 900,
                    color: "var(--border)",
                    lineHeight: 1,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    userSelect: "none",
                  }}
                >
                  {s.n}
                </div>
                <div style={{ fontSize: 40, marginBottom: 20 }}>{s.icon}</div>
                <h3
                  className="font-display"
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--text-hi)",
                    marginBottom: 10,
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: 16,
                    color: "var(--text-mid)",
                    lineHeight: 1.65,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section style={{ padding: "0 20px 72px" }}>
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {[
            {
              icon: <Zap size={24} style={{ color: "#818cf8" }} />,
              bg: "rgba(99,102,241,0.09)",
              title: "Token instantâneo",
              desc: "Código gerado automaticamente. Copie com um toque e cole onde quiser.",
            },
            {
              icon: <Users size={24} style={{ color: "#34d399" }} />,
              bg: "rgba(16,185,129,0.09)",
              title: "Sem conta pra ver",
              desc: "Participantes não precisam de conta para acompanhar listas públicas.",
            },
            {
              icon: <Shield size={24} style={{ color: "#a78bfa" }} />,
              bg: "rgba(139,92,246,0.09)",
              title: "Você controla",
              desc: "Defina se a lista é pública ou privada a qualquer momento.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="card"
              style={{
                padding: "28px 24px",
                display: "flex",
                alignItems: "flex-start",
                gap: 18,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: f.bg,
                  flexShrink: 0,
                }}
              >
                {f.icon}
              </div>
              <div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--text-hi)",
                    marginBottom: 8,
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: 16,
                    color: "var(--text-mid)",
                    lineHeight: 1.65,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ SECTION ──────────────────────────────────────────────── */}
      <section
        id="faq"
        style={{ padding: "72px 20px", borderTop: "1px solid var(--border)" }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 99,
                marginBottom: 16,
                background: "rgba(20,184,166,0.10)",
                border: "1px solid rgba(20,184,166,0.22)",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#2dd4bf",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#5eead4" }}>
                Perguntas frequentes
              </span>
            </div>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(1.7rem, 4vw, 2.4rem)",
                fontWeight: 800,
                color: "var(--text-hi)",
                lineHeight: 1.2,
                marginBottom: 12,
              }}
            >
              Tudo que você precisa saber
            </h2>
            <p style={{ fontSize: 17, color: "var(--text-mid)" }}>
              Se ainda tiver dúvidas, fale connosco pelo WhatsApp.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {faqs.map((f) => {
              const isOpen = openFaq === f.id;
              return (
                <div
                  key={f.id}
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    border: `1px solid ${isOpen ? "rgba(20,184,166,0.30)" : "var(--border)"}`,
                    background: isOpen ? "rgba(20,184,166,0.05)" : "var(--s50)",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : f.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      padding: "20px 22px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 17,
                        fontWeight: 600,
                        color: isOpen ? "#5eead4" : "var(--text-hi)",
                        lineHeight: 1.4,
                        flex: 1,
                      }}
                    >
                      {safe(f.pergunta, "—")}
                    </span>
                    <span
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 9,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: 22,
                        fontWeight: 300,
                        background: isOpen
                          ? "rgba(20,184,166,0.15)"
                          : "var(--s200)",
                        color: isOpen ? "#2dd4bf" : "var(--text-lo)",
                        transition: "all 0.2s",
                      }}
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      className="anim-fade-in"
                      style={{
                        padding: "0 22px 22px",
                        fontSize: 16,
                        color: "var(--text-mid)",
                        lineHeight: 1.75,
                      }}
                    >
                      {safe(f.resposta, "—")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CREATOR SECTION ──────────────────────────────────────────── */}
      <section style={{ padding: "0 20px 80px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div
            style={{
              borderRadius: 24,
              overflow: "hidden",
              position: "relative",
              background: "var(--s100)",
              border: "1px solid var(--border-md)",
            }}
          >
            <div
              style={{
                height: 4,
                background: "linear-gradient(90deg, #6366f1, #2dd4bf, #f59e0b)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 260,
                height: 260,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,rgba(99,102,241,0.12),transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -30,
                left: -30,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,rgba(20,184,166,0.10),transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                padding: "36px 32px",
                position: "relative",
                display: "flex",
                alignItems: "flex-start",
                gap: 28,
                flexWrap: "wrap",
              }}
            >
              {/* Avatar */}
              <div style={{ flexShrink: 0 }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 22,
                    background: "linear-gradient(135deg,#6366f1,#2dd4bf)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 34,
                    fontWeight: 900,
                    color: "#fff",
                    boxShadow: "0 8px 28px rgba(99,102,241,0.38)",
                    userSelect: "none",
                  }}
                >
                  M
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 220 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "5px 13px",
                    borderRadius: 99,
                    marginBottom: 14,
                    background: "rgba(245,158,11,0.10)",
                    border: "1px solid rgba(245,158,11,0.25)",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#fbbf24",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#fcd34d",
                      letterSpacing: "0.05em",
                    }}
                  >
                    CRIADOR DO SISTEMA
                  </span>
                </div>

                <h3
                  className="font-display"
                  style={{
                    fontSize: "clamp(1.3rem, 4vw, 1.9rem)",
                    fontWeight: 800,
                    color: "var(--text-hi)",
                    lineHeight: 1.25,
                    marginBottom: 12,
                  }}
                >
                  Miraldino Paulo Dória
                </h3>

                <p
                  style={{
                    fontSize: 16,
                    color: "var(--text-mid)",
                    lineHeight: 1.75,
                    marginBottom: 20,
                  }}
                >
                  Este sistema foi criado por{" "}
                  <strong style={{ color: "var(--text-hi)" }}>
                    Miraldino Paulo Dória
                  </strong>
                  , programador de 23 anos e fundador da startup{" "}
                  <strong
                    style={{
                      background: "linear-gradient(135deg,#6366f1,#2dd4bf)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    LaurinSoft Tecnologies
                  </strong>
                  .
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {[
                    "Programador",
                    "23 anos",
                    "Fundador · LaurinSoft",
                    "Angola 🇦🇴",
                  ].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 99,
                        fontSize: 13,
                        fontWeight: 600,
                        background: "var(--s200)",
                        border: "1px solid var(--border-md)",
                        color: "var(--text-mid)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 20px 80px" }}>
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            borderRadius: 28,
            padding: "56px 32px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            background: "var(--s100)",
            border: "1px solid var(--border-md)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at top,rgba(99,102,241,0.10) 0%,transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2.1rem)",
              fontWeight: 800,
              color: "var(--text-hi)",
              marginBottom: 12,
            }}
          >
            Organiza suas compras hoje
          </h2>
          <p
            style={{ fontSize: 17, color: "var(--text-mid)", marginBottom: 32 }}
          >
            Gratuito. Simples. Feito para grupos de WhatsApp.
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="btn btn-pink"
            style={{ fontSize: 17, padding: "16px 36px" }}
          >
            Começar agora <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer
        style={{
          padding: "32px 20px",
          textAlign: "center",
          borderTop: "1px solid var(--border)",
        }}
      >
        <p style={{ fontSize: 14, color: "var(--text-lo)" }}>
          © 2026 Minha Lista · Feito para grupos de compras · LaurinSoft
          Tecnologies
        </p>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}

/* ── Search result card ─────────────────────────────────────────────────── */
function SearchResultCard({
  result,
  date,
  photo,
  copied,
  onCopy,
}: {
  result: ListWithUser;
  date: string;
  photo: string | null;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div
      style={{
        borderRadius: 20,
        overflow: "hidden",
        background: "var(--s100)",
        border: "1px solid var(--border-md)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{ position: "relative", height: 180, background: "var(--s200)" }}
      >
        {photo ? (
          <img
            src={photo}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            alt={safe(result.produto)}
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
              fontSize: 48,
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
              "linear-gradient(to top,var(--s100) 0%,transparent 55%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <h3
            className="font-display"
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text-hi)",
              lineHeight: 1.3,
            }}
          >
            {safe(result.produto, "Produto sem nome")}
          </h3>
          <StatusBadge status={result.status} />
        </div>
      </div>
      <div
        style={{
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <button onClick={onCopy} className="token">
            {copied ? (
              <Check size={13} style={{ color: "#34d399" }} />
            ) : (
              <Copy size={13} />
            )}
            {safe(result.token, "—")}
          </button>
          <span style={{ fontSize: 14, color: "var(--text-lo)" }}>{date}</span>
        </div>
        {result.user && (
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
                width: 44,
                height: 44,
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
              {initial(result.user.nome)}
            </div>
            <div>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--text-hi)",
                }}
              >
                {safe(result.user.nome, "Usuário")}
              </p>
              <p
                style={{ fontSize: 14, color: "var(--text-lo)", marginTop: 2 }}
              >
                {safe(String(result.user.telefone ?? ""), "—")}
              </p>
            </div>
          </div>
        )}
        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--text-lo)",
              marginBottom: 12,
            }}
          >
            Progresso
          </p>
          <ProgressBar current={result.status} />
        </div>
      </div>
    </div>
  );
}
