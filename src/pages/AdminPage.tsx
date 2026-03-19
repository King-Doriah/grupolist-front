import { useState, useEffect, useCallback } from "react";
import {
  LogOut,
  Users,
  BarChart3,
  Shield,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Loader,
  KeyRound,
  UserPlus,
  Crown,
} from "lucide-react";
import { toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  type AdminReport,
  type AdminUser,
  safe,
  initial,
  fmtDate,
  isPlanExpired,
} from "../types";
import AdminChangePasswordModal from "../components/AdminChangePasswordModal";
import RegisterAdminModal from "../components/RegisterAdminModal";
import UpdatePlanModal from "../components/UpdatePlanModal";

type Section = "overview" | "users";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("overview");
  const [report, setReport] = useState<AdminReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showChgPwd, setShowChgPwd] = useState(false);
  const [showRegAdm, setShowRegAdm] = useState(false);
  const [planTarget, setPlanTarget] = useState<
    import("../types").AdminUser | null
  >(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/__admin302/relatorios");
      setReport(data?.data ?? null);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? "Erro ao carregar relatórios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const toggleUserStatus = async (u: AdminUser) => {
    // Nível 1 (Super Admin) nunca pode ser desativado — nem por nível 2
    if (u.nivel === 1) {
      toast.error("Não é possível desativar um Super Administrador.", {
        autoClose: 1200,
        transition: Slide,
      });
      return;
    }
    setToggling(u.id);
    try {
      await api.patch(`/__admin302/accstatus/${u.id}`, {
        status: String(!u.ativo),
      });
      await fetchReport();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? "Erro ao alterar status da conta.", {
        autoClose: 1200,
        transition: Slide,
      });
    } finally {
      setToggling(null);
    }
  };

  const handleLogout = async () => {
    try {
      await api.get("/auth/logout");
    } catch (e) {}
    logout();
    navigate("/", { replace: true });
  };

  const name = safe(user?.nome, "Admin");
  const avatar = initial(name);

  const STAT_CARDS = report
    ? [
        {
          label: "Total utilizadores",
          value: report.totalUsers,
          icon: "👥",
          c: "#a5b4fc",
          bg: "rgba(99,102,241,0.10)",
          br: "rgba(99,102,241,0.22)",
        },
        {
          label: "Activos",
          value: report.totalActives,
          icon: "✅",
          c: "#6ee7b7",
          bg: "rgba(16,185,129,0.08)",
          br: "rgba(16,185,129,0.20)",
        },
        {
          label: "Desactivados",
          value: report.totalDesactived,
          icon: "🚫",
          c: "#fca5a5",
          bg: "rgba(244,63,94,0.08)",
          br: "rgba(244,63,94,0.20)",
        },
        {
          label: "Total de listas",
          value: report.totalLists,
          icon: "📋",
          c: "#fcd34d",
          bg: "rgba(245,158,11,0.08)",
          br: "rgba(245,158,11,0.20)",
        },
        {
          label: "Listas Abertas",
          value: report.totalOpen,
          icon: "🔵",
          c: "#93c5fd",
          bg: "rgba(59,130,246,0.08)",
          br: "rgba(59,130,246,0.18)",
        },
        {
          label: "Compras Feitas",
          value: report.totalPurchased,
          icon: "🛒",
          c: "#fdba74",
          bg: "rgba(249,115,22,0.08)",
          br: "rgba(249,115,22,0.18)",
        },
        {
          label: "No Processo",
          value: report.totalOnProcess,
          icon: "📦",
          c: "#c4b5fd",
          bg: "rgba(139,92,246,0.08)",
          br: "rgba(139,92,246,0.18)",
        },
        {
          label: "Encerradas",
          value: report.totalFinished,
          icon: "✅",
          c: "#6ee7b7",
          bg: "rgba(16,185,129,0.08)",
          br: "rgba(16,185,129,0.18)",
        },
      ]
    : [];

  const adminBtnStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 18px",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600 as const,
    border: "none",
    cursor: "pointer" as const,
    transition: "all 0.18s",
    background: "linear-gradient(135deg,#f59e0b,#ef4444)",
    color: "#fff",
    boxShadow: "0 4px 16px rgba(245,158,11,0.25)",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--s0)" }}>
      <style>{`
        .admin-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
        @media(min-width:600px){ .admin-grid { grid-template-columns:repeat(3,1fr); } }
        @media(min-width:900px){ .admin-grid { grid-template-columns:repeat(4,1fr); } }
        .user-list  { display:flex; flex-direction:column; gap:10px; }
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
              background: "linear-gradient(135deg,#f59e0b,#ef4444)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Shield size={17} style={{ color: "#fff" }} />
          </div>
          <div>
            <p
              style={{
                fontSize: 11,
                color: "#fcd34d",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              Área Admin
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
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "linear-gradient(135deg,#f59e0b,#ef4444)",
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
      </header>

      {/* Avatar menu */}
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
              width: 220,
              borderRadius: 18,
              overflow: "hidden",
              background: "var(--s100)",
              border: "1px solid var(--border-md)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
            }}
          >
            <div
              style={{
                padding: "16px 18px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--text-hi)",
                }}
              >
                {name}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#fcd34d",
                  marginTop: 4,
                  fontWeight: 600,
                }}
              >
                Administrador
              </p>
            </div>
            <button
              onClick={() => {
                setMenuOpen(false);
                setShowChgPwd(true);
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
              <LogOut size={17} /> Sair
            </button>
          </div>
        </>
      )}

      {/* Nav */}
      <div style={{ padding: "16px 16px 0", maxWidth: 960, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          {(
            [
              {
                key: "overview",
                label: "Visão Geral",
                icon: <BarChart3 size={16} />,
              },
              {
                key: "users",
                label: "Utilizadores",
                icon: <Users size={16} />,
              },
            ] as { key: Section; label: string; icon: React.ReactNode }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setSection(t.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 18px",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "all 0.18s",
                background:
                  section === t.key
                    ? "linear-gradient(135deg,#f59e0b,#ef4444)"
                    : "var(--s100)",
                color: section === t.key ? "#fff" : "var(--text-lo)",
                boxShadow:
                  section === t.key
                    ? "0 4px 16px rgba(245,158,11,0.30)"
                    : "none",
                outline: section === t.key ? "none" : "1px solid var(--border)",
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}

          <button
            onClick={() => setShowRegAdm(true)}
            style={{ ...adminBtnStyle, marginLeft: "auto" }}
          >
            <UserPlus size={16} /> Novo Admin
          </button>

          <button
            onClick={fetchReport}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--s100)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              color: "var(--text-lo)",
            }}
            title="Atualizar"
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
          </button>
        </div>

        {error && (
          <div
            style={{
              borderRadius: 14,
              padding: "16px 18px",
              fontSize: 15,
              background: "rgba(244,63,94,0.10)",
              border: "1px solid rgba(244,63,94,0.25)",
              color: "#fca5a5",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
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
                borderTopColor: "#f59e0b",
              }}
              className="spin"
            />
            <p style={{ fontSize: 16, color: "var(--text-lo)" }}>
              Carregando dados…
            </p>
          </div>
        )}

        {/* Overview */}
        {!loading && section === "overview" && report && (
          <div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "var(--text-lo)",
                marginBottom: 16,
              }}
            >
              Métricas do sistema
            </p>
            <div className="admin-grid" style={{ marginBottom: 32 }}>
              {STAT_CARDS.map((s) => (
                <div
                  key={s.label}
                  style={{
                    borderRadius: 16,
                    padding: "18px 16px",
                    background: s.bg,
                    border: `1px solid ${s.br}`,
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <p
                    className="font-display"
                    style={{
                      fontSize: 32,
                      fontWeight: 900,
                      color: s.c,
                      lineHeight: 1,
                      marginBottom: 6,
                    }}
                  >
                    {s.value}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-lo)",
                      lineHeight: 1.4,
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

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
              Utilizadores recentes
            </p>
            <div className="user-list">
              {(report.users ?? []).slice(0, 5).map((u) => (
                <UserRow
                  key={u.id}
                  u={u}
                  toggling={toggling}
                  onToggle={toggleUserStatus}
                  onPlan={(u) => setPlanTarget(u)}
                />
              ))}
            </div>
            {(report.users ?? []).length > 5 && (
              <button
                onClick={() => setSection("users")}
                style={{
                  marginTop: 14,
                  fontSize: 14,
                  color: "#a5b4fc",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Ver todos os {report.totalUsers} utilizadores →
              </button>
            )}
          </div>
        )}

        {/* Users */}
        {!loading && section === "users" && report && (
          <div>
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
              {report.totalUsers} utilizador
              {report.totalUsers !== 1 ? "es" : ""}
            </p>
            <div className="user-list">
              {(report.users ?? []).map((u) => (
                <UserRow
                  key={u.id}
                  u={u}
                  toggling={toggling}
                  onToggle={toggleUserStatus}
                  onPlan={(u) => setPlanTarget(u)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {showChgPwd && (
        <AdminChangePasswordModal onClose={() => setShowChgPwd(false)} />
      )}
      {showRegAdm && (
        <RegisterAdminModal
          onClose={() => setShowRegAdm(false)}
          onDone={fetchReport}
        />
      )}
      {planTarget && (
        <UpdatePlanModal
          user={planTarget}
          onClose={() => setPlanTarget(null)}
          onUpdated={fetchReport}
        />
      )}
    </div>
  );
}

function UserRow({
  u,
  toggling,
  onToggle,
  onPlan,
}: {
  u: AdminUser;
  toggling: string | null;
  onToggle: (u: AdminUser) => void;
  onPlan: (u: AdminUser) => void;
}) {
  const isToggling = toggling === u.id;
  const isSuperAdmin = u.role === "ADMIN" && u.nivel === 1; // nivel 1: cannot be deactivated
  //const isLevel2Admin = u.role === "ADMIN" && u.nivel === 2; // nivel 2: admin normal, has shield
  const isAdmin = u.role === "ADMIN";
  const isOwner = u.role === "OWNER";
  const expired = isOwner ? isPlanExpired(u.planExpires) : false;

  return (
    <div
      style={{
        borderRadius: 16,
        padding: "16px 18px",
        background: "var(--s50)",
        border: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 17,
          fontWeight: 700,
          color: "#fff",
          background: isAdmin
            ? "linear-gradient(135deg,#f59e0b,#ef4444)"
            : "linear-gradient(135deg,#6366f1,#a78bfa)",
          opacity: u.ativo ? 1 : 0.45,
        }}
      >
        {initial(u.nome)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: u.ativo ? "var(--text-hi)" : "var(--text-lo)",
              margin: 0,
            }}
          >
            {safe(u.nome, "—")}
          </p>
          {isAdmin && (
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700,
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.28)",
                color: "#fcd34d",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Shield size={10} /> {isSuperAdmin ? "Super Admin" : "Admin"}
            </span>
          )}
          {!u.ativo && (
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700,
                background: "rgba(244,63,94,0.10)",
                border: "1px solid rgba(244,63,94,0.25)",
                color: "#fca5a5",
              }}
            >
              Desactivado
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: "var(--text-lo)", marginTop: 2 }}>
          {safe(u.email, "—")} · {safe(String(u.telefone ?? ""), "—")}
        </p>
        {/* Plan info for owners */}
        {isOwner && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 4,
              flexWrap: "wrap",
            }}
          >
            {(u.plan ?? "FREE") === "FREE" ? (
              <span className="plan-badge-free">FREE</span>
            ) : expired ? (
              <span className="plan-badge-expired">PRO · Expirado</span>
            ) : (
              <span className="plan-badge-pro">
                <Crown size={9} style={{ display: "inline" }} /> PRO
              </span>
            )}
            {u.plan === "PRO" && u.planExpires && (
              <span
                style={{ fontSize: 11, color: expired ? "#f87171" : "#6ee7b7" }}
              >
                {expired
                  ? `⚠ Expirou: ${fmtDate(u.planExpires)}`
                  : `✓ Até: ${fmtDate(u.planExpires)}`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Plan button — only for OWNERs */}
      {isOwner && (
        <button
          onClick={() => onPlan(u)}
          title="Atualizar plano PRO"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
            transition: "all 0.2s",
            background: "rgba(99,102,241,0.10)",
            color: "#a5b4fc",
          }}
        >
          <Crown size={18} />
        </button>
      )}

      {/* Toggle / Shield */}
      {isSuperAdmin ? (
        // nivel 1: show shield icon only, NO toggle button
        <div
          title="Super admin protegido — não pode ser desactivado"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(245,158,11,0.08)",
            flexShrink: 0,
          }}
        >
          <Shield size={16} style={{ color: "#fcd34d" }} />
        </div>
      ) : (
        // nivel 2 admins and all owners: toggleable
        <button
          onClick={() => onToggle(u)}
          disabled={isToggling}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
            transition: "all 0.2s",
            background: u.ativo
              ? "rgba(244,63,94,0.10)"
              : "rgba(16,185,129,0.10)",
            color: u.ativo ? "#fca5a5" : "#6ee7b7",
          }}
          title={u.ativo ? "Desactivar conta" : "Activar conta"}
        >
          {isToggling ? (
            <Loader size={18} className="spin" />
          ) : u.ativo ? (
            <ToggleRight size={22} />
          ) : (
            <ToggleLeft size={22} />
          )}
        </button>
      )}
    </div>
  );
}
