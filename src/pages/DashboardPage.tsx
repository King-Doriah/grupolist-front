import { useState, useEffect, useCallback } from "react";
import { Plus, LogOut, Globe, Lock, KeyRound, Crown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  type ListItem,
  type ListStatus,
  type MeData,
  safe,
  initial,
  fmtDate,
  isPlanExpired,
} from "../types";
import ListCard from "../components/ListCard";
import CreateListModal from "../components/CreateListModal";
import EditListModal from "../components/EditListModal";
import ChangePasswordModal from "../components/ChangePasswordModal";

const FILTERS: { label: string; value: ListStatus | "ALL" }[] = [
  { label: "Todas", value: "ALL" },
  { label: "Abertas", value: "OPEN" },
  { label: "Compradas", value: "PURCHASED" },
  { label: "No Processo", value: "ON_PROCESS" },
  { label: "Encerradas", value: "FINISHED" },
];

function PlanBadge({ meData }: { meData: MeData }) {
  const plan = meData.plan ?? "FREE";
  const expires = meData.planExpires;
  const expired = isPlanExpired(expires);

  if (plan === "FREE") return <span className="plan-badge-free">FREE</span>;
  if (expired)
    return (
      <span
        className="plan-badge-expired"
        title={`Expirou em ${fmtDate(expires ?? "")}`}
      >
        PRO · Expirado
      </span>
    );
  return (
    <span
      className="plan-badge-pro"
      title={`Expira em ${fmtDate(expires ?? "")}`}
    >
      <Crown size={10} style={{ display: "inline" }} /> PRO ·{" "}
      {fmtDate(expires ?? "")}
    </span>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [lists, setLists] = useState<ListItem[]>([]);
  const [meData, setMeData] = useState<MeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ListStatus | "ALL">("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<ListItem | null>(null);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [userName, setUserName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/lists");
      setLists(Array.isArray(data?.data) ? data.data : []);
    } catch {
      setLists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  useEffect(() => {
    api
      .get("/users/me")
      .then(({ data }) => {
        const d = data?.data;
        if (d) {
          setMeData(d as MeData);
          const n = d.nome;
          if (typeof n === "string" && n) setUserName(n.split(" ")[0] ?? n);
        }
      })
      .catch(() => {});
  }, []);

  const count = (s: ListStatus | "ALL") =>
    s === "ALL" ? lists.length : lists.filter((l) => l.status === s).length;

  const filtered =
    filter === "ALL" ? lists : lists.filter((l) => l.status === filter);
  const pubCount = lists.filter((l) => l.disponivel).length;
  const privCount = lists.filter((l) => !l.disponivel).length;
  const name = userName || safe(user?.nome, "Usuário");
  const avatar = initial(name);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  // Plan warning banner
  const plan = meData?.plan ?? "FREE";
  const planExpired = isPlanExpired(meData?.planExpires);
  const showFreeLimit = plan === "FREE" && lists.length >= 8;
  const showExpiredBanner = plan === "PRO" && planExpired;

  return (
    <div style={{ minHeight: "100vh", background: "var(--s0)" }}>
      <style>{`
        .list-grid { display:grid; grid-template-columns:1fr; gap:16px; }
        @media(min-width:600px) { .list-grid { grid-template-columns:repeat(2,1fr); } }
        @media(min-width:960px) { .list-grid { grid-template-columns:repeat(3,1fr); } }
      `}</style>

      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "rgba(6,9,20,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          padding: "0 16px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "linear-gradient(135deg,#6366f1,#a78bfa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              style={{ width: 17, height: 17, color: "#fff" }}
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
          <div>
            <p style={{ fontSize: 12, color: "var(--text-lo)", lineHeight: 1 }}>
              {greeting()},
            </p>
            <p
              className="font-display"
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--text-hi)",
                lineHeight: 1.3,
              }}
            >
              {name}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setShowCreate(true)}
            className="btn btn-pink"
            style={{
              padding: "10px 16px",
              fontSize: 14,
              minHeight: 42,
              gap: 6,
            }}
          >
            <Plus size={16} />
            <span>Nova lista</span>
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "linear-gradient(135deg,#6366f1,#a78bfa)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {avatar}
          </button>
        </div>
      </header>

      {/* Dropdown menu */}
      {menuOpen && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 25 }}
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="anim-scale-in"
            style={{
              position: "fixed",
              top: 68,
              right: 16,
              zIndex: 26,
              width: 260,
              borderRadius: 18,
              overflow: "hidden",
              background: "var(--s100)",
              border: "1px solid var(--border-md)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
            }}
          >
            {/* User info + plan */}
            <div
              style={{
                padding: "18px 18px 14px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--text-hi)",
                  marginBottom: 6,
                }}
              >
                {name}
              </p>
              {/* Plan badge */}
              {meData && (
                <div style={{ marginBottom: 8 }}>
                  <PlanBadge meData={meData} />
                  {meData.plan === "PRO" && meData.planExpires && (
                    <p
                      style={{
                        fontSize: 11,
                        marginTop: 4,
                        color: planExpired ? "#f87171" : "#6ee7b7",
                      }}
                    >
                      {planExpired
                        ? `⚠ Expirou: ${fmtDate(meData.planExpires)}`
                        : `✓ Válido até: ${fmtDate(meData.planExpires)}`}
                    </p>
                  )}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 600,
                    background: "rgba(20,184,166,0.10)",
                    border: "1px solid rgba(20,184,166,0.22)",
                    color: "#5eead4",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Globe size={11} />
                  {pubCount} públicas
                </span>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 600,
                    background: "var(--s200)",
                    border: "1px solid var(--border)",
                    color: "var(--text-lo)",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Lock size={11} />
                  {privCount} privadas
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setMenuOpen(false);
                setShowChangePwd(true);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 18px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 15,
                color: "var(--text-mid)",
                textAlign: "left",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <KeyRound size={17} /> Trocar senha
            </button>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 18px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 15,
                color: "#fca5a5",
                textAlign: "left",
              }}
            >
              <LogOut size={17} /> Sair da conta
            </button>
          </div>
        </>
      )}

      {/* Content */}
      <div style={{ padding: "20px 16px", maxWidth: 900, margin: "0 auto" }}>
        {/* Plan warning banners */}
        {showFreeLimit && (
          <div
            style={{
              borderRadius: 14,
              padding: "14px 18px",
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.22)",
              color: "#fcd34d",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
              fontSize: 14,
            }}
          >
            <Crown size={16} />
            <span>
              {lists.length >= 10
                ? "Limite do plano FREE atingido (10 listas). Contacte o administrador para atualizar para PRO."
                : `Aproximando do limite: ${lists.length}/10 listas no plano FREE.`}
            </span>
          </div>
        )}

        {showExpiredBanner && (
          <div
            style={{
              borderRadius: 14,
              padding: "14px 18px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.22)",
              color: "#fca5a5",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
              fontSize: 14,
            }}
          >
            <Crown size={16} />
            <span>
              O seu plano PRO expirou em {fmtDate(meData?.planExpires ?? "")}.
              Contacte o administrador para renovar.
            </span>
          </div>
        )}

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {[
            {
              label: "Total",
              value: count("ALL"),
              c: "#a5b4fc",
              bg: "rgba(99,102,241,0.10)",
              br: "rgba(99,102,241,0.20)",
            },
            {
              label: "Abertas",
              value: count("OPEN"),
              c: "#93c5fd",
              bg: "rgba(59,130,246,0.08)",
              br: "rgba(59,130,246,0.18)",
            },
            {
              label: "No Processo",
              value: count("ON_PROCESS"),
              c: "#c4b5fd",
              bg: "rgba(139,92,246,0.08)",
              br: "rgba(139,92,246,0.18)",
            },
            {
              label: "Encerradas",
              value: count("FINISHED"),
              c: "#6ee7b7",
              bg: "rgba(16,185,129,0.08)",
              br: "rgba(16,185,129,0.18)",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                borderRadius: 16,
                padding: "18px 16px",
                background: s.bg,
                border: `1px solid ${s.br}`,
              }}
            >
              <p
                className="font-display"
                style={{
                  fontSize: 34,
                  fontWeight: 900,
                  color: s.c,
                  lineHeight: 1,
                  marginBottom: 6,
                }}
              >
                {s.value}
              </p>
              <p style={{ fontSize: 14, color: "var(--text-lo)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter chips */}
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 4,
            marginBottom: 20,
          }}
          className="no-scroll"
        >
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                flexShrink: 0,
                padding: "10px 18px",
                borderRadius: 99,
                fontSize: 15,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "all 0.18s",
                minHeight: 44,
                background:
                  filter === f.value
                    ? "linear-gradient(135deg,#6366f1,#4f46e5)"
                    : "var(--s100)",
                color: filter === f.value ? "#fff" : "var(--text-lo)",
                boxShadow:
                  filter === f.value
                    ? "0 4px 16px rgba(99,102,241,0.30)"
                    : "none",
                outline:
                  filter === f.value ? "none" : "1px solid var(--border)",
              }}
            >
              {f.label}
              {f.value !== "ALL" && (
                <span style={{ marginLeft: 6, opacity: 0.65 }}>
                  {count(f.value as ListStatus)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Count label */}
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--text-lo)",
            marginBottom: 14,
          }}
        >
          {filtered.length} lista{filtered.length !== 1 ? "s" : ""}
          {filter !== "ALL"
            ? ` — ${FILTERS.find((f) => f.value === filter)?.label}`
            : ""}
        </p>

        {/* Cards */}
        {loading ? (
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
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "3px solid var(--border-md)",
                borderTopColor: "#6366f1",
              }}
              className="spin"
            />
            <p style={{ fontSize: 16, color: "var(--text-lo)" }}>
              Carregando suas listas…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            isFiltered={filter !== "ALL"}
            onAdd={() => setShowCreate(true)}
          />
        ) : (
          <div className="list-grid">
            {filtered.map((item) => (
              <ListCard
                key={item.id}
                item={item}
                onEdit={() => setEditItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 20,
          width: 62,
          height: 62,
          borderRadius: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20,
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(135deg,#6366f1,#4f46e5)",
          boxShadow: "0 8px 32px rgba(99,102,241,0.50)",
        }}
      >
        <Plus size={28} style={{ color: "#fff" }} />
      </button>

      {showCreate && (
        <CreateListModal
          onClose={() => setShowCreate(false)}
          onDone={fetchLists}
        />
      )}
      {editItem && (
        <EditListModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onDone={fetchLists}
        />
      )}
      {showChangePwd && (
        <ChangePasswordModal onClose={() => setShowChangePwd(false)} />
      )}
    </div>
  );
}

function EmptyState({
  isFiltered,
  onAdd,
}: {
  isFiltered: boolean;
  onAdd: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "72px 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          fontSize: 36,
          background: "var(--s100)",
          border: "1px solid var(--border)",
        }}
      >
        {isFiltered ? "🔍" : "📋"}
      </div>
      <p
        className="font-display"
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "var(--text-mid)",
          marginBottom: 10,
        }}
      >
        {isFiltered ? "Nenhuma lista aqui" : "Ainda sem listas"}
      </p>
      <p
        style={{
          fontSize: 16,
          color: "var(--text-lo)",
          maxWidth: 300,
          lineHeight: 1.65,
          marginBottom: 28,
        }}
      >
        {isFiltered
          ? "Tente outro filtro ou crie uma nova lista."
          : "Crie sua primeira lista e compartilhe o token no grupo do WhatsApp."}
      </p>
      {!isFiltered && (
        <button
          onClick={onAdd}
          className="btn btn-pink"
          style={{ fontSize: 17 }}
        >
          <Plus size={18} /> Criar primeira lista
        </button>
      )}
    </div>
  );
}
