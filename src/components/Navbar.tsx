import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, MessageCircle } from "lucide-react";
import api from "../services/api";
import { type FaqItem, safe } from "../types";

interface Props {
  onOpenAuth: () => void;
}

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

export default function Navbar({ onOpenAuth }: Props) {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [showFaqDrop, setShowFaqDrop] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const faqRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    api
      .get("/faqs")
      .then(({ data }) => {
        const a = Array.isArray(data?.data) ? data.data : [];
        setFaqs(a.length ? a : FALLBACK_FAQS);
      })
      .catch(() => setFaqs(FALLBACK_FAQS));
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (faqRef.current && !faqRef.current.contains(e.target as Node))
        setShowFaqDrop(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const navBg = scrolled ? "rgba(11,15,32,0.92)" : "transparent";
  const navBorder = scrolled ? "1px solid var(--border)" : "none";

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          background: navBg,
          borderBottom: navBorder,
          backdropFilter: scrolled ? "blur(20px)" : "none",
          transition: "all 0.3s",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: "0 20px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "var(--text-hi)",
                letterSpacing: "-0.02em",
              }}
            >
              Minha Lista
            </span>
          </div>

          {/* Desktop nav */}
          <div
            style={{ display: "none", alignItems: "center", gap: 4 }}
            className="desktop-nav"
          >
            <div ref={faqRef} style={{ position: "relative" }}>
              <button
                onClick={() => setShowFaqDrop(!showFaqDrop)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 15,
                  color: "var(--text-mid)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                FAQ{" "}
                <ChevronDown
                  size={14}
                  style={{
                    transform: showFaqDrop ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
              {showFaqDrop && (
                <div
                  className="anim-scale-in"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: 8,
                    width: 360,
                    borderRadius: 18,
                    overflow: "hidden",
                    background: "var(--s100)",
                    border: "1px solid var(--border-md)",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
                  }}
                >
                  <div
                    style={{ padding: 8, maxHeight: 340, overflowY: "auto" }}
                  >
                    {faqs.map((f) => (
                      <div
                        key={f.id}
                        style={{
                          borderRadius: 12,
                          overflow: "hidden",
                          marginBottom: 4,
                        }}
                      >
                        <button
                          onClick={() =>
                            setOpenFaq(openFaq === f.id ? null : f.id)
                          }
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            padding: "12px 14px",
                            textAlign: "left",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <span
                            style={{ fontSize: 15, color: "var(--text-hi)" }}
                          >
                            {safe(f.pergunta)}
                          </span>
                          <ChevronDown
                            size={14}
                            style={{
                              color: "var(--text-lo)",
                              flexShrink: 0,
                              transform:
                                openFaq === f.id ? "rotate(180deg)" : "none",
                              transition: "transform 0.2s",
                            }}
                          />
                        </button>
                        {openFaq === f.id && (
                          <div
                            style={{
                              padding: "0 14px 14px",
                              fontSize: 14,
                              color: "var(--text-mid)",
                              lineHeight: 1.6,
                              background: "var(--s200)",
                            }}
                          >
                            {safe(f.resposta)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <a
              href="https://wa.me/244942225275"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 10,
                fontSize: 15,
                color: "var(--text-mid)",
                textDecoration: "none",
              }}
            >
              <MessageCircle size={15} /> Contacto
            </a>
          </div>

          {/* Desktop auth */}
          <div
            style={{ display: "none", alignItems: "center", gap: 8 }}
            className="desktop-nav"
          >
            <button
              onClick={onOpenAuth}
              className="btn btn-outline"
              style={{ padding: "10px 20px", fontSize: 15, minHeight: 44 }}
            >
              Entrar
            </button>
            <button
              onClick={onOpenAuth}
              className="btn btn-pink"
              style={{ padding: "10px 20px", fontSize: 15, minHeight: 44 }}
            >
              Criar conta
            </button>
          </div>

          {/* Mobile: auth btn + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Quick login on mobile */}
            <button
              onClick={onOpenAuth}
              className="btn btn-pink"
              style={{ padding: "10px 18px", fontSize: 15, minHeight: 44 }}
              // hide on desktop via className below
            >
              Entrar
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--s200)",
                border: "1px solid var(--border)",
                color: "var(--text-mid)",
                cursor: "pointer",
              }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu — FAQ lives on the page now, just link to it */}
        {mobileOpen && (
          <div
            className="anim-fade-in"
            style={{
              background: "var(--s100)",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <a
                href="#faq"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 18px",
                  borderRadius: 14,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--text-hi)",
                  background: "var(--s200)",
                  textDecoration: "none",
                  border: "1px solid var(--border)",
                }}
              >
                <span>Perguntas Frequentes (FAQ)</span>
                <ChevronDown
                  size={16}
                  style={{
                    color: "var(--text-lo)",
                    transform: "rotate(-90deg)",
                  }}
                />
              </a>

              <a
                href="https://wa.me/244942225275"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "16px 18px",
                  borderRadius: 14,
                  fontSize: 16,
                  color: "var(--text-mid)",
                  background: "var(--s200)",
                  textDecoration: "none",
                }}
              >
                <MessageCircle size={18} /> Contacto via WhatsApp
              </a>

              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button
                  onClick={() => {
                    onOpenAuth();
                    setMobileOpen(false);
                  }}
                  className="btn btn-outline"
                  style={{ flex: 1, fontSize: 16 }}
                >
                  Entrar
                </button>
                <button
                  onClick={() => {
                    onOpenAuth();
                    setMobileOpen(false);
                  }}
                  className="btn btn-pink"
                  style={{ flex: 1, fontSize: 16 }}
                >
                  Criar conta
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
