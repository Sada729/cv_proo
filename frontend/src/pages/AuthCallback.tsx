import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

/**
 * Landing spot after Google OAuth. Laravel redirects here with ?token=...
 * (or ?error=...). We store the token, hydrate the user, then go to the app.
 */
export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { applyToken } = useAuth();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const token = params.get("token");
    const error = params.get("error");

    if (error || !token) {
      toast.error("Connexion Google échouée. Réessayez.");
      navigate("/auth", { replace: true });
      return;
    }

    applyToken(token)
      .then(() => {
        toast.success("Connecté avec Google !");
        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        toast.error("Session invalide. Réessayez.");
        navigate("/auth", { replace: true });
      });
  }, [params, applyToken, navigate]);

  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <div className="text-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
        <p className="mt-3 text-sm text-muted-foreground">Connexion en cours…</p>
      </div>
    </div>
  );
}
