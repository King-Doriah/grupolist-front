import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { AuthUser, UserRole } from "../types";

interface AuthCtx {
  token: string | null;
  user: AuthUser | null;
  role: UserRole | null;
  level: number | null; // 1 = super admin, 2 = admin, 3 = owner
  login: (
    token: string,
    refresh: string,
    user: AuthUser,
    role?: UserRole,
    level?: number,
  ) => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({
  token: null,
  user: null,
  role: null,
  level: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [role, setRole] = useState<UserRole | null>(
    () => (localStorage.getItem("gl_role") as UserRole | null) ?? null,
  );
  const [level, setLevel] = useState<number | null>(() => {
    const l = localStorage.getItem("gl_level");
    return l ? Number(l) : null;
  });
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem("gl_user");
      if (!raw) return null;
      const p = JSON.parse(raw);
      if (p && typeof p.id === "string" && typeof p.nome === "string") return p;
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const h = () => {
      setToken(null);
      setUser(null);
      setRole(null);
      setLevel(null);
    };
    window.addEventListener("gl:logout", h);
    return () => window.removeEventListener("gl:logout", h);
  }, []);

  const login = (
    tok: string,
    ref: string,
    u: AuthUser,
    r?: UserRole,
    lv?: number,
  ) => {
    // Decode JWT to get role if not provided
    let resolvedRole: UserRole = r ?? u.role ?? "OWNER";
    let resolvedLevel: number = lv ?? 3;
    try {
      const p = JSON.parse(atob(tok.split(".")[1]));
      if (p?.role === "ADMIN") resolvedRole = "ADMIN";
    } catch {
      /* keep */
    }
    localStorage.setItem("token", tok);
    localStorage.setItem("refresh", ref);
    localStorage.setItem("gl_user", JSON.stringify(u));
    localStorage.setItem("gl_role", resolvedRole);
    localStorage.setItem("gl_level", String(resolvedLevel));
    setToken(tok);
    setUser(u);
    setRole(resolvedRole);
    setLevel(resolvedLevel);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setRole(null);
    setLevel(null);
  };

  return (
    <Ctx.Provider value={{ token, user, role, level, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
