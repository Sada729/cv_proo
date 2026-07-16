import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import api, { TOKEN_KEY } from "@/api/axios";

export type Admin = {
  id: number;
  name: string;
  email: string;
};

type AdminAuthContextValue = {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    try {
      const { data } = await api.get<Admin>("/admin/me");
      setAdmin(data);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY)) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post("/admin/login", { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setAdmin(data.admin);
  }

  async function logout() {
    try {
      await api.post("/admin/logout");
    } catch {
      /* ignore — clear locally anyway */
    }
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
  }

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return ctx;
}
