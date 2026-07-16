import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Plus, FileText, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/AppShell";

type CvRow = {
  id: number;
  title: string;
  template_id: string;
  updated_at: string;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cvs, setCvs] = useState<CvRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function loadCvs() {
    try {
      const { data } = await api.get<CvRow[]>("/cvs");
      setCvs(data);
    } catch {
      toast.error("Impossible de charger vos CV.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCvs();
  }, []);

  async function createCv() {
    setCreating(true);
    try {
      const { data } = await api.post<CvRow>("/cvs", { title: "Nouveau CV" });
      navigate(`/editor/${data.id}`);
    } catch {
      toast.error("Création impossible.");
      setCreating(false);
    }
  }

  async function deleteCv(id: number) {
    if (!confirm("Supprimer ce CV ?")) return;
    try {
      await api.delete(`/cvs/${id}`);
      setCvs(prev => prev.filter(c => c.id !== id));
      toast.success("CV supprimé");
    } catch {
      toast.error("Suppression impossible.");
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold">Bonjour {user?.name ?? "👋"}</h1>
            <p className="text-muted-foreground mt-1">Vos CV, prêts à décrocher un entretien.</p>
          </div>
          <button onClick={createCv} disabled={creating} className="inline-flex items-center gap-2 rounded-xl gradient-primary text-white font-semibold px-5 py-3 shadow-elegant hover:scale-[1.02] transition-transform disabled:opacity-50">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Nouveau CV
          </button>
        </motion.div>

        {loading ? (
          <div className="mt-16 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cvs.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full rounded-3xl border-2 border-dashed border-border p-12 text-center bg-card">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
                <h3 className="mt-4 font-bold text-lg">Aucun CV pour le moment</h3>
                <p className="text-muted-foreground text-sm mt-1">Cliquez sur « Nouveau CV » pour commencer.</p>
              </motion.div>
            )}
            {cvs.map((cv, i) => (
              <motion.div key={cv.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }} className="group rounded-2xl bg-card border border-border/60 p-5 shadow-card hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
                  <button onClick={() => deleteCv(cv.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
                <h3 className="mt-4 font-bold">{cv.title}</h3>
                <div className="text-xs text-muted-foreground mt-1">Modifié le {new Date(cv.updated_at).toLocaleDateString("fr-FR")}</div>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 bg-muted uppercase tracking-wider">{cv.template_id}</div>
                <Link to={`/editor/${cv.id}`} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">Ouvrir <ArrowRight className="h-3.5 w-3.5" /></Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
