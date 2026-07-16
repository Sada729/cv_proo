import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import api, { TOKEN_KEY } from "@/api/axios";

export type User = {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  applyToken: (token: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    try {
      const { data } = await api.get<User>("/user");
      setUser(data);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY)) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post("/login", { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
  }

  async function register(name: string, email: string, password: string, passwordConfirmation: string) {
    const { data } = await api.post("/register", {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
  }

  async function logout() {
    try {
      await api.post("/logout");
    } catch {
      /* token already invalid — clear locally anyway */
    }
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  async function applyToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    setLoading(true);
    await fetchUser();
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, applyToken }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
