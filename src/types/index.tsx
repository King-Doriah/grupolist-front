export type ListStatus = "OPEN" | "PURCHASED" | "ON_PROCESS" | "FINISHED";
export type UserRole = "OWNER" | "ADMIN" | "MANAGER";
export type UserPlan = "FREE" | "PRO";

export interface ListItem {
  id: string;
  produto: string;
  foto: string | null;
  status: ListStatus;
  disponivel: boolean;
  token: string;
  createdAt: string;
  created_at?: string;
  userId: string;
}

export interface ListWithUser extends ListItem {
  user: { id: string; nome: string; telefone: number };
}

export interface AuthUser {
  id: string;
  nome: string;
  role?: UserRole;
}

export interface FaqItem {
  id: string;
  pergunta: string;
  resposta: string;
}

export interface AdminUser {
  id: string;
  nome: string;
  email: string;
  telefone: number;
  role: UserRole;
  nivel?: number;
  ativo: boolean;
  plan?: UserPlan | null;
  planExpires?: string | null;
}

export interface AdminReport {
  users: AdminUser[];
  totalUsers: number;
  totalActives: number;
  totalDesactived: number;
  totalLists: number;
  totalOpen: number;
  totalFinished: number;
  totalPurchased: number;
  totalOnProcess: number;
}

export interface MeData {
  id: string;
  nome: string;
  email: string;
  telefone: number;
  role: UserRole;
  ativo: boolean;
  createdAt?: string;
  created_at?: string;
  plan?: UserPlan | null;
  planExpires?: string | null;
  lists: ListItem[];
}

export const STATUS_LABEL: Record<ListStatus, string> = {
  OPEN: "Aberta",
  PURCHASED: "Compra Feita",
  ON_PROCESS: "No Processo",
  FINISHED: "Encerrada",
};
export const STATUS_DESC: Record<ListStatus, string> = {
  OPEN: "Lista aberta, participantes podem entrar",
  PURCHASED: "Produto comprado com sucesso",
  ON_PROCESS: "Produto disponível para retirada",
  FINISHED: "Lista encerrada, todos já pagaram",
};
export const STATUS_EMOJI: Record<ListStatus, string> = {
  OPEN: "🔵",
  PURCHASED: "🛒",
  ON_PROCESS: "📦",
  FINISHED: "✅",
};
export const STATUS_PILL: Record<ListStatus, string> = {
  OPEN: "pill pill-open",
  PURCHASED: "pill pill-purchased",
  ON_PROCESS: "pill pill-on_process",
  FINISHED: "pill pill-finished",
};
export const STATUS_DOT: Record<ListStatus, string> = {
  OPEN: "bg-blue-400",
  PURCHASED: "bg-amber-400",
  ON_PROCESS: "bg-purple-400",
  FINISHED: "bg-emerald-400",
};
export const STATUS_FLOW: ListStatus[] = [
  "OPEN",
  "PURCHASED",
  "ON_PROCESS",
  "FINISHED",
];

export const safe = (v: unknown, fallback = ""): string =>
  v !== undefined && v !== null && v !== "" ? String(v) : fallback;

export const initial = (name: unknown): string =>
  typeof name === "string" && name.length > 0 ? name[0].toUpperCase() : "?";

export const fmtDate = (iso: unknown): string => {
  if (!iso || typeof iso !== "string") return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

export const isPlanExpired = (
  planExpires: string | null | undefined,
): boolean => {
  if (!planExpires) return false;
  return new Date(planExpires) < new Date();
};

export const getCreatedAt = (item: ListItem): string =>
  item.createdAt || item.created_at || "";
