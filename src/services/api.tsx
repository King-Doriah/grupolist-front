import axios, { type AxiosRequestConfig } from "axios";

export const BASE = "https://grupolist-api.onrender.com"; //"http://localhost:5000";

const api = axios.create({ baseURL: BASE, timeout: 15000 });

// ── Inject token ─────────────────────────────────────────────────────────────
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) {
    cfg.headers.Authorization = `Bearer ${t}`;
  }
  return cfg;
});

// ── Auto-refresh on 401 ───────────────────────────────────────────────────────
let refreshing = false;
let pending: Array<{ ok: (t: string) => void; fail: (e: unknown) => void }> =
  [];

const flush = (err: unknown, tok?: string) => {
  pending.forEach((p) => (err ? p.fail(err) : p.ok(tok!)));
  pending = [];
};

const forceLogout = () => {
  localStorage.clear();
  window.dispatchEvent(new Event("gl:logout"));
};

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const cfg: AxiosRequestConfig & { _retry?: boolean } = err.config ?? {};
    const status: number = err.response?.status ?? 0;

    if (status !== 401 || cfg._retry || cfg.url?.includes("/auth")) {
      return Promise.reject(err);
    }

    cfg._retry = true;

    if (refreshing) {
      return new Promise<string>((ok, fail) => pending.push({ ok, fail })).then(
        (tok) => {
          cfg.headers = { ...cfg.headers, Authorization: `Bearer ${tok}` };
          return api(cfg);
        },
      );
    }

    refreshing = true;
    const ref = localStorage.getItem("refresh");
    if (!ref) {
      forceLogout();
      return Promise.reject(err);
    }

    try {
      const { data } = await axios.post(`${BASE}/auth/refresh`, {
        refresh: ref,
      });
      const newTok: string = data?.data?.token ?? "";
      if (!newTok) throw new Error("no token");
      localStorage.setItem("token", newTok);
      api.defaults.headers.common["Authorization"] = `Bearer ${newTok}`;
      flush(null, newTok);
      cfg.headers = { ...cfg.headers, Authorization: `Bearer ${newTok}` };
      return api(cfg);
    } catch (e) {
      flush(e);
      forceLogout();
      return Promise.reject(e);
    } finally {
      refreshing = false;
    }
  },
);

export default api;

//export const imgUrl = (foto: string | null | undefined): string | null =>
//foto ? `${BASE}/uploads/${foto}` : null;

export const imgUrl = (foto: string | null | undefined): string | null =>
  foto ?? null;
