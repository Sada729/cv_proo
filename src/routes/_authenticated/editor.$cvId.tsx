import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { motion } from "motion/react";
import { Save, Download, ArrowLeft, Upload, Plus, Trash2, Lock, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CVPreview } from "@/components/cv-templates/CVPreview";
import { emptyCV, TEMPLATES, type CVData, type TemplateId, type CVExperience, type CVEducation } from "@/lib/cv-types";

export const Route = createFileRoute("/_authenticated/editor/$cvId")({
  component: Editor,
});

function uid() { return Math.random().toString(36).slice(2, 10); }

function Editor() {
  const { cvId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const printRef = useRef<HTMLDivElement>(null);
  const [template, setTemplate] = useState<TemplateId>("executive");
  const [title, setTitle] = useState("Mon CV");
  const [data, setData] = useState<CVData>(emptyCV);
  const [initialized, setInitialized] = useState(false);

  const cvQuery = useQuery({
    queryKey: ["cv", cvId],
    queryFn: async () => {
      const { data, error } = await supabase.from("cvs").select("*").eq("id", cvId).maybeSingle();
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

  useEffect(() => {
    if (cvQuery.data && !initialized) {
      setTemplate((cvQuery.data.template_id as TemplateId) ?? "executive");
      setTitle(cvQuery.data.title ?? "Mon CV");
      const d = cvQuery.data.data as Partial<CVData> | null;
      setData({ ...emptyCV, ...(d ?? {}) });
      setInitialized(true);
    }
  }, [cvQuery.data, initialized]);

  const saveMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("cvs").update({ title, template_id: template, data }).eq("id", cvId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cvs"] }),
  });

  // Debounced auto-save
  useEffect(() => {
    if (!initialized) return;
    const h = setTimeout(() => saveMut.mutate(), 900);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, template, title, initialized]);

  const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: title });

  async function handleDownload() {
    const credits = profileQuery.data?.credits ?? 0;
    if (credits < 1 && !cvQuery.data?.is_paid) {
      toast.error("Il vous faut un crédit. Rendez-vous sur la page Tarifs.");
      navigate({ to: "/pricing" });
      return;
    }
    // decrement credit + mark cv paid (idempotent for this cv)
    if (!cvQuery.data?.is_paid) {
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from("profiles").update({ credits: credits - 1 }).eq("id", userData.user!.id);
      await supabase.from("cvs").update({ is_paid: true }).eq("id", cvId);
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["cv", cvId] });
    }
    handlePrint();
  }

  async function handleAvatar(file: File) {
    const { data: userData } = await supabase.auth.getUser();
    const path = `${userData.user!.id}/avatar-${Date.now()}.jpg`;
    // resize to 400x400
    const bmp = await createImageBitmap(file);
    const size = Math.min(bmp.width, bmp.height);
    const canvas = document.createElement("canvas");
    canvas.width = 400; canvas.height = 400;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bmp, (bmp.width - size) / 2, (bmp.height - size) / 2, size, size, 0, 0, 400, 400);
    const blob: Blob = await new Promise(res => canvas.toBlob(b => res(b!), "image/jpeg", 0.85)!);
    const { error } = await supabase.storage.from("avatars").upload(path, blob, { upsert: true, contentType: "image/jpeg" });
    if (error) { toast.error(error.message); return; }
    const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365);
    setData(d => ({ ...d, avatarUrl: signed?.signedUrl }));
    toast.success("Photo mise à jour");
  }

  const canDownload = useMemo(() => cvQuery.data?.is_paid || (profileQuery.data?.credits ?? 0) > 0, [cvQuery.data, profileQuery.data]);

  if (cvQuery.isLoading) return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto max-w-[1600px] px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/dashboard" className="p-2 rounded-lg hover:bg-muted"><ArrowLeft className="h-4 w-4" /></Link>
            <input value={title} onChange={e => setTitle(e.target.value)} className="font-semibold bg-transparent outline-none focus:bg-muted rounded-lg px-2 py-1 min-w-0" />
            {saveMut.isPending && <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Enregistrement…</span>}
            {!saveMut.isPending && initialized && <span className="text-xs text-green-600">✓ Enregistré</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => saveMut.mutate()} className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:bg-muted"><Save className="h-4 w-4" /> Sauver</button>
            <button onClick={handleDownload} className="inline-flex items-center gap-2 rounded-xl gradient-primary text-white font-semibold px-4 py-2 shadow-elegant hover:scale-[1.02] transition-transform">
              {canDownload ? <><Download className="h-4 w-4" /> Télécharger PDF</> : <><Lock className="h-4 w-4" /> Débloquer 1 000 FCFA</>}
            </button>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[420px_1fr] gap-6 p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* FORM */}
        <div className="space-y-4">
          {/* Template picker */}
          <Panel title="Template">
            <div className="grid grid-cols-4 gap-2">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setTemplate(t.id)} className={`rounded-xl p-2 border-2 text-xs transition-all ${template === t.id ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted"}`}>
                  <div className={`aspect-[3/4] rounded-md ${previewSwatch(t.id)}`} />
                  <div className="mt-1 font-medium">{t.name}</div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Infos personnelles">
            <div className="flex items-center gap-3">
              <label className="cursor-pointer group">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-muted grid place-items-center border-2 border-dashed border-border group-hover:border-primary">
                  {data.avatarUrl ? <img src={data.avatarUrl} alt="" className="h-full w-full object-cover" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleAvatar(e.target.files[0])} />
              </label>
              <div className="text-xs text-muted-foreground">Cliquez pour ajouter une photo (optionnel).<br />Recadrée automatiquement.</div>
            </div>
            <Field label="Nom complet" value={data.fullName} onChange={v => setData(d => ({ ...d, fullName: v }))} />
            <Field label="Titre / Poste visé" value={data.title} onChange={v => setData(d => ({ ...d, title: v }))} />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Email" value={data.email} onChange={v => setData(d => ({ ...d, email: v }))} />
              <Field label="Téléphone" value={data.phone} onChange={v => setData(d => ({ ...d, phone: v }))} />
            </div>
            <Field label="Ville" value={data.location} onChange={v => setData(d => ({ ...d, location: v }))} />
          </Panel>

          <Panel title="Résumé professionnel">
            <textarea rows={4} value={data.summary} onChange={e => setData(d => ({ ...d, summary: e.target.value }))} className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="En quelques lignes, présentez votre profil…" />
          </Panel>

          <Panel title="Expériences">
            {data.experiences.map((exp, i) => (
              <div key={exp.id} className="rounded-xl border border-border p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-muted-foreground">EXPÉRIENCE {i + 1}</span>
                  <button onClick={() => setData(d => ({ ...d, experiences: d.experiences.filter(x => x.id !== exp.id) }))} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <Field label="Poste" value={exp.role} onChange={v => updateItem(setData, "experiences", exp.id, { role: v })} />
                <Field label="Entreprise" value={exp.company} onChange={v => updateItem(setData, "experiences", exp.id, { company: v })} />
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Début" value={exp.start} onChange={v => updateItem(setData, "experiences", exp.id, { start: v })} placeholder="Jan 2023" />
                  <Field label="Fin" value={exp.end} onChange={v => updateItem(setData, "experiences", exp.id, { end: v })} placeholder="Actuel" />
                </div>
                <textarea rows={3} value={exp.description} onChange={e => updateItem(setData, "experiences", exp.id, { description: e.target.value })} className="w-full rounded-lg border border-input bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="Réalisations principales…" />
              </div>
            ))}
            <button onClick={() => setData(d => ({ ...d, experiences: [...d.experiences, { id: uid(), role: "", company: "", start: "", end: "", description: "" } as CVExperience] }))} className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium hover:bg-muted"><Plus className="h-4 w-4" /> Ajouter une expérience</button>
          </Panel>

          <Panel title="Formations">
            {data.educations.map((ed, i) => (
              <div key={ed.id} className="rounded-xl border border-border p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-muted-foreground">FORMATION {i + 1}</span>
                  <button onClick={() => setData(d => ({ ...d, educations: d.educations.filter(x => x.id !== ed.id) }))} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <Field label="Diplôme" value={ed.degree} onChange={v => updateItem(setData, "educations", ed.id, { degree: v })} />
                <Field label="École" value={ed.school} onChange={v => updateItem(setData, "educations", ed.id, { school: v })} />
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Début" value={ed.start} onChange={v => updateItem(setData, "educations", ed.id, { start: v })} />
                  <Field label="Fin" value={ed.end} onChange={v => updateItem(setData, "educations", ed.id, { end: v })} />
                </div>
              </div>
            ))}
            <button onClick={() => setData(d => ({ ...d, educations: [...d.educations, { id: uid(), school: "", degree: "", start: "", end: "" } as CVEducation] }))} className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium hover:bg-muted"><Plus className="h-4 w-4" /> Ajouter une formation</button>
          </Panel>

          <Panel title="Compétences">
            <TagInput values={data.skills} onChange={v => setData(d => ({ ...d, skills: v }))} placeholder="React, Node.js, gestion de projet…" />
          </Panel>

          <Panel title="Langues">
            {data.languages.map((l, i) => (
              <div key={i} className="flex gap-2">
                <input value={l.name} onChange={e => setData(d => ({ ...d, languages: d.languages.map((x, j) => j === i ? { ...x, name: e.target.value } : x) }))} className="flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-sm" placeholder="Français" />
                <input value={l.level} onChange={e => setData(d => ({ ...d, languages: d.languages.map((x, j) => j === i ? { ...x, level: e.target.value } : x) }))} className="flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-sm" placeholder="Courant" />
                <button onClick={() => setData(d => ({ ...d, languages: d.languages.filter((_, j) => j !== i) }))} className="p-1.5 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
            <button onClick={() => setData(d => ({ ...d, languages: [...d.languages, { name: "", level: "" }] }))} className="w-full text-sm rounded-lg border border-dashed border-border py-2 hover:bg-muted"><Plus className="h-3.5 w-3.5 inline" /> Ajouter une langue</button>
          </Panel>

          <Panel title="🎯 Adapter à une offre (bientôt IA)">
            <p className="text-xs text-muted-foreground">Collez la fiche de poste pour que l'IA reformule votre CV. Fonctionnalité IA — disponible dès l'ajout des tarifs Pro+.</p>
            <textarea rows={3} className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="Collez la fiche de poste…" />
            <button className="w-full rounded-xl bg-muted text-muted-foreground py-2.5 text-sm font-medium cursor-not-allowed inline-flex items-center justify-center gap-2"><Sparkles className="h-4 w-4" /> Optimiser avec l'IA (Pro)</button>
          </Panel>
        </div>

        {/* PREVIEW */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-muted/40 p-6 overflow-auto max-h-[calc(100vh-6rem)] sticky top-20">
          <div ref={printRef} className="mx-auto shadow-2xl origin-top" style={{ transform: "scale(0.75)", transformOrigin: "top center" }}>
            <CVPreview data={data} template={template} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function previewSwatch(id: string) {
  switch (id) {
    case "executive": return "bg-gradient-to-br from-indigo-100 to-indigo-300";
    case "minimal": return "bg-gradient-to-br from-slate-100 to-slate-300";
    case "gold": return "bg-gradient-to-br from-slate-800 to-black";
    case "creative": return "bg-gradient-to-br from-purple-400 to-indigo-600";
    default: return "bg-muted";
  }
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm space-y-3">
      <h3 className="font-semibold text-sm">{title}</h3>
      {children}
    </motion.div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
    </div>
  );
}

function TagInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  function add() {
    const v = input.trim();
    if (!v) return;
    onChange([...values, v]);
    setInput("");
  }
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map(v => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
            {v} <button onClick={() => onChange(values.filter(x => x !== v))} className="hover:text-destructive">×</button>
          </span>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }} onBlur={add} placeholder={placeholder} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function updateItem(setData: React.Dispatch<React.SetStateAction<CVData>>, key: "experiences" | "educations", id: string, patch: any) {
  setData(d => ({ ...d, [key]: (d[key] as any[]).map(x => x.id === id ? { ...x, ...patch } : x) }));
}