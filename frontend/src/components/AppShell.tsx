import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/auth");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto max-w-[1200px] px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <span className="grid h-8 w-8 place-items-center rounded-xl gradient-primary text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            CV PRO
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/dashboard" className="hidden sm:inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl hover:bg-muted transition-colors">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            <div className="flex items-center gap-2 pl-2">
              <div className="h-8 w-8 rounded-full gradient-primary grid place-items-center text-white text-xs font-bold overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  user?.name?.[0]?.toUpperCase() ?? "U"
                )}
              </div>
              <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors" title="Déconnexion">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
