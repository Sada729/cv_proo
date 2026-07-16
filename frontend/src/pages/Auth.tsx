import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Sparkles, Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/api/axios";

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading: authLoading, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate("/dashboard", { replace: true });
  }, [authLoading, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        await register(fullName, email, password, passwordConfirm);
        toast.success("Compte créé, bienvenue !");
      } else {
        await login(email, password);
        toast.success("Bienvenue !");
      }
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Erreur d'authentification";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    // Full-page redirect to the Laravel Socialite endpoint.
    window.location.href = `${API_URL}/auth/google/redirect`;
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden gradient-hero">
        <div className="absolute -top-32 -right-20 h-96 w-96 rounded-full bg-white/15 blur-3xl animate-blob" />
        <div className="absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
        <Link to="/" className="relative flex items-center gap-2 font-bold text-xl">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 backdrop-blur"><Sparkles className="h-5 w-5" /></span>
          CV PRO
        </Link>
        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight">Votre CV, réinventé par l'<span className="italic font-serif">IA</span>.</h1>
          <p className="mt-4 text-white/85 max-w-md">Rejoignez des milliers de candidats qui décrochent leurs entretiens grâce à CV PRO.</p>
        </div>
        <div className="relative text-sm text-white/70">© 2026 CV PRO</div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-2 font-bold text-xl">
            <span className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-white"><Sparkles className="h-5 w-5" /></span>
            CV PRO
          </div>
          <h2 className="text-3xl font-bold">{mode === "login" ? "Bon retour !" : "Créer un compte"}</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            {mode === "login" ? "Connectez-vous pour retrouver vos CV." : "Commencez gratuitement en quelques secondes."}
          </p>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="mt-8 w-full inline-flex items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            Continuer avec Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> ou <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-sm font-medium">Nom complet</label>
                <div className="relative mt-1.5">
                  <UserIcon className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary" placeholder="Jean Diop" />
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Email</label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary" placeholder="vous@exemple.com" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Mot de passe</label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary" placeholder="••••••••" />
              </div>
            </div>
            {mode === "signup" && (
              <div>
                <label className="text-sm font-medium">Confirmer le mot de passe</label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required minLength={8} className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary" placeholder="••••••••" />
                </div>
              </div>
            )}
            <button disabled={loading} type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl gradient-primary text-white font-semibold px-4 py-3 shadow-elegant hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{mode === "login" ? "Se connecter" : "Créer mon compte"} <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-muted-foreground">
            {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="font-semibold text-primary hover:underline">
              {mode === "login" ? "Créer un compte" : "Se connecter"}
            </button>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
