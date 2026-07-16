import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Shield, LayoutDashboard, Users, ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/auth");
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive ? "gradient-primary text-white shadow-elegant" : "text-muted-foreground hover:bg-muted"
    }`;

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-[1400px] grid md:grid-cols-[240px_1fr] gap-0 min-h-screen">
        {/* Sidebar */}
        <aside className="border-r border-border/60 bg-background p-4 flex flex-col">
          <div className="flex items-center gap-2 font-bold text-lg px-2 py-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl gradient-primary text-white"><Shield className="h-4 w-4" /></span>
            Admin
          </div>
          <nav className="mt-6 space-y-1">
            <NavLink to="/admin" end className={linkClass}><LayoutDashboard className="h-4 w-4" /> Tableau de bord</NavLink>
            <NavLink to="/admin/users" className={linkClass}><Users className="h-4 w-4" /> Utilisateurs</NavLink>
          </nav>
          <div className="mt-auto space-y-1 pt-6">
            <Link to="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
              <ArrowLeft className="h-4 w-4" /> Retour à l'app
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="h-4 w-4" /> Déconnexion
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-muted-foreground">Connecté en tant que <b className="text-foreground">{user?.name}</b></div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
