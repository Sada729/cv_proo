import { useEffect, useState } from "react";
import { Search, Trash2, Plus, Loader2, ShieldCheck, ShieldOff, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  cvs_count: number;
  created_at: string;
};

type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
};

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  async function load(p = page, q = search) {
    setLoading(true);
    try {
      const { data } = await api.get<Paginated<AdminUser>>("/admin/users", { params: { page: p, search: q || undefined } });
      setUsers(data.data);
      setLastPage(data.last_page);
      setTotal(data.total);
    } catch {
      toast.error("Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function toggleRole(u: AdminUser) {
    const role = u.role === "admin" ? "user" : "admin";
    try {
      await api.put(`/admin/users/${u.id}`, { role });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role } : x));
      toast.success(`${u.name} est désormais ${role}.`);
    } catch {
      toast.error("Modification impossible.");
    }
  }

  async function remove(u: AdminUser) {
    if (!confirm(`Supprimer ${u.name} ? Cette action est irréversible.`)) return;
    try {
      await api.delete(`/admin/users/${u.id}`);
      toast.success("Utilisateur supprimé.");
      load(page);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Suppression impossible.";
      toast.error(msg);
    }
  }

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">{total} compte{total > 1 ? "s" : ""} au total.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-xl gradient-primary text-white font-semibold px-4 py-2.5 shadow-elegant hover:scale-[1.02] transition-transform">
          <Plus className="h-4 w-4" /> Nouvel utilisateur
        </button>
      </div>

      <form
        onSubmit={e => { e.preventDefault(); setPage(1); load(1, search); }}
        className="mt-6 relative max-w-sm"
      >
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email…"
          className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </form>

      <div className="mt-6 rounded-2xl bg-card border border-border/60 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left font-semibold px-5 py-3">Utilisateur</th>
                <th className="text-left font-semibold px-5 py-3 hidden sm:table-cell">Rôle</th>
                <th className="text-left font-semibold px-5 py-3 hidden md:table-cell">CV</th>
                <th className="text-left font-semibold px-5 py-3 hidden lg:table-cell">Inscrit</th>
                <th className="text-right font-semibold px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Aucun utilisateur.</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full gradient-primary grid place-items-center text-white text-xs font-bold">{u.name?.[0]?.toUpperCase() ?? "U"}</div>
                      <div>
                        <div className="font-medium">{u.name} {me?.id === u.id && <span className="text-[10px] text-muted-foreground">(vous)</span>}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${u.role === "admin" ? "bg-green-500/15 text-green-600" : "bg-muted text-muted-foreground"}`}>{u.role}</span>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">{u.cvs_count}</td>
                  <td className="px-5 py-3 hidden lg:table-cell text-muted-foreground">{new Date(u.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleRole(u)} title={u.role === "admin" ? "Rétrograder en user" : "Promouvoir admin"} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                        {u.role === "admin" ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      </button>
                      {me?.id !== u.id && (
                        <button onClick={() => remove(u)} title="Supprimer" className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {lastPage > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted">Précédent</button>
          <span className="text-sm text-muted-foreground">Page {page} / {lastPage}</span>
          <button disabled={page >= lastPage} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted">Suivant</button>
        </div>
      )}

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); setPage(1); load(1, search); }}
        />
      )}
    </div>
  );
}

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/users", { name, email, password, password_confirmation: password, role });
      toast.success("Utilisateur créé.");
      onCreated();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Création impossible.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-elegant p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Nouvel utilisateur</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <Field label="Nom complet" value={name} onChange={setName} />
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <Field label="Mot de passe (min. 8)" type="password" value={password} onChange={setPassword} />
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Rôle</label>
            <select value={role} onChange={e => setRole(e.target.value as "user" | "admin")} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <button disabled={saving} type="submit" className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl gradient-primary text-white font-semibold px-4 py-2.5 shadow-elegant hover:opacity-90 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer le compte"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required minLength={type === "password" ? 8 : undefined} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
    </div>
  );
}
