import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Shield, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { admin, loading: authLoading, login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && admin) navigate("/", { replace: true });
  }, [authLoading, admin, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Bienvenue dans l'administration.");
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Identifiants invalides";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center gradient-hero px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-20 h-96 w-96 rounded-full bg-white/15 blur-3xl animate-blob" />
        <div className="absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-3xl bg-card border border-border shadow-elegant p-8"
      >
        <div className="flex items-center gap-2 font-bold text-xl">
          <span className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-white"><Shield className="h-5 w-5" /></span>
          CV PRO <span className="text-muted-foreground font-normal text-base">Administration</span>
        </div>
        <h1 className="mt-6 text-2xl font-bold">Espace administrateur</h1>
        <p className="mt-1 text-sm text-muted-foreground">Connexion réservée aux administrateurs de la plateforme.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary" placeholder="admin@cvpro.test" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Mot de passe</label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary" placeholder="••••••••" />
            </div>
          </div>
          <button disabled={loading} type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl gradient-primary text-white font-semibold px-4 py-3 shadow-elegant hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Se connecter <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
