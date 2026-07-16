import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Users, ShieldCheck, FileText, TrendingUp, Loader2 } from "lucide-react";
import api from "@/api/axios";

type DashboardData = {
  stats: { users: number; admins: number; cvs: number; new_users_7d: number };
  recent_users: { id: number; name: string; email: string; role: string; created_at: string }[];
};

const CARDS = [
  { key: "users", label: "Utilisateurs", icon: Users, color: "text-primary bg-primary/10" },
  { key: "admins", label: "Administrateurs", icon: ShieldCheck, color: "text-green-600 bg-green-500/10" },
  { key: "cvs", label: "CV créés", icon: FileText, color: "text-cyan-600 bg-cyan-500/10" },
  { key: "new_users_7d", label: "Nouveaux (7j)", icon: TrendingUp, color: "text-amber-600 bg-amber-500/10" },
] as const;

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardData>("/admin/dashboard")
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!data) return <p className="text-muted-foreground">Impossible de charger les statistiques.</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold">Tableau de bord</h1>
      <p className="text-muted-foreground mt-1">Vue d'ensemble de la plateforme.</p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map((c, i) => (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl bg-card border border-border/60 p-5 shadow-card"
          >
            <div className={`grid h-11 w-11 place-items-center rounded-xl ${c.color}`}><c.icon className="h-5 w-5" /></div>
            <div className="mt-4 text-3xl font-black">{data.stats[c.key]}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-card border border-border/60 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border/60 font-semibold">Derniers inscrits</div>
        <div className="divide-y divide-border/60">
          {data.recent_users.map(u => (
            <div key={u.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full gradient-primary grid place-items-center text-white text-xs font-bold">{u.name?.[0]?.toUpperCase() ?? "U"}</div>
                <div>
                  <div className="font-medium text-sm">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RoleBadge role={u.role} />
                <span className="text-xs text-muted-foreground hidden sm:block">{new Date(u.created_at).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const admin = role === "admin";
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${admin ? "bg-green-500/15 text-green-600" : "bg-muted text-muted-foreground"}`}>
      {role}
    </span>
  );
}
