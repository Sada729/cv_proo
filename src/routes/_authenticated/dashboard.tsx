import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Plus, FileText, Trash2, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const cvsQuery = useQuery({
    queryKey: ["cvs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cvs").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").maybeSingle();
      return data;
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("cvs").insert({ user_id: userData.user!.id, title: "Nouveau CV" }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (cv) => {
      qc.invalidateQueries({ queryKey: ["cvs"] });
      navigate({ to: "/editor/$cvId", params: { cvId: cv.id } });
    },
    onError: (e) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cvs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cvs"] }); toast.success("CV supprimé"); },
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold">Bonjour {profileQuery.data?.full_name ?? "👋"}</h1>
            <p className="text-muted-foreground mt-1">Vos CV, prêts à décrocher un entretien.</p>
            <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium rounded-full bg-primary/10 text-primary px-3 py-1">
              <Sparkles className="h-3 w-3" /> Crédits téléchargement : <b>{profileQuery.data?.credits ?? 0}</b>
            </div>
          </div>
          <button onClick={() => createMut.mutate()} disabled={createMut.isPending} className="inline-flex items-center gap-2 rounded-xl gradient-primary text-white font-semibold px-5 py-3 shadow-elegant hover:scale-[1.02] transition-transform disabled:opacity-50">
            <Plus className="h-4 w-4" /> Nouveau CV
          </button>
        </motion.div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cvsQuery.data?.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full rounded-3xl border-2 border-dashed border-border p-12 text-center bg-card">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
              <h3 className="mt-4 font-bold text-lg">Aucun CV pour le moment</h3>
              <p className="text-muted-foreground text-sm mt-1">Cliquez sur « Nouveau CV » pour commencer.</p>
            </motion.div>
          )}
          {cvsQuery.data?.map((cv, i) => (
            <motion.div key={cv.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }} className="group rounded-2xl bg-card border border-border/60 p-5 shadow-card hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
                <button onClick={() => { if (confirm("Supprimer ce CV ?")) delMut.mutate(cv.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
              <h3 className="mt-4 font-bold">{cv.title}</h3>
              <div className="text-xs text-muted-foreground mt-1">Modifié le {new Date(cv.updated_at).toLocaleDateString("fr-FR")}</div>
              <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 bg-muted uppercase tracking-wider">{cv.template_id}</div>
              <Link to="/editor/$cvId" params={{ cvId: cv.id }} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">Ouvrir <ArrowRight className="h-3.5 w-3.5" /></Link>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}