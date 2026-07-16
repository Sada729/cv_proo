import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Shield, LayoutDashboard, Users, UserCog, LogOut } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive ? "gradient-primary text-white shadow-elegant" : "text-muted-foreground hover:bg-muted"
    }`;

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-[1400px] grid md:grid-cols-[240px_1fr] min-h-screen">
        {/* Sidebar */}
        <aside className="border-r border-border/60 bg-background p-4 flex flex-col">
          <div className="flex items-center gap-2 font-bold text-lg px-2 py-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl gradient-primary text-white"><Shield className="h-4 w-4" /></span>
            CV PRO <span className="text-muted-foreground font-normal text-sm">Admin</span>
          </div>
          <nav className="mt-6 space-y-1">
            <NavLink to="/" end className={linkClass}><LayoutDashboard className="h-4 w-4" /> Tableau de bord</NavLink>
            <NavLink to="/users" className={linkClass}><Users className="h-4 w-4" /> Utilisateurs</NavLink>
            <NavLink to="/admins" className={linkClass}><UserCog className="h-4 w-4" /> Administrateurs</NavLink>
          </nav>
          <div className="mt-auto pt-6">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="h-4 w-4" /> Déconnexion
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="p-6 md:p-8">
          <div className="flex items-center justify-end mb-6">
            <div className="text-sm text-muted-foreground">Connecté : <b className="text-foreground">{admin?.name}</b></div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
