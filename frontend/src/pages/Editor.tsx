import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { motion } from "motion/react";
import { Save, Download, ArrowLeft, Upload, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";
import { CVPreview } from "@/components/cv-templates/CVPreview";
import {
  emptyCV, TEMPLATES, SAMPLE_CV, ACCENT_COLORS, FONT_FAMILIES,
  type CVData, type TemplateId, type CVExperience, type CVEducation,
} from "@/lib/cv-types";

function uid() { return Math.random().toString(36).slice(2, 10); }

export default function Editor() {
  const { cvId } = useParams();
  const printRef = useRef<HTMLDivElement>(null);
  const [template, setTemplate] = useState<TemplateId>("executive");
  const [title, setTitle] = useState("Mon CV");
  const [data, setData] = useState<CVData>(emptyCV);
  const [initialized, setInitialized] = useState(false);
  const [loadingCv, setLoadingCv] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load the CV
  useEffect(() => {
    let active = true;
    api.get(`/cvs/${cvId}`)
      .then(({ data: cv }) => {
        if (!active) return;
        setTemplate((cv.template_id as TemplateId) ?? "executive");
        setTitle(cv.title ?? "Mon CV");
        setData({ ...emptyCV, ...((cv.data ?? {}) as Partial<CVData>) });
        setInitialized(true);
      })
      .catch(() => toast.error("CV introuvable"))
      .finally(() => active && setLoadingCv(false));
    return () => { active = false; };
  }, [cvId]);

  async function save() {
    setSaving(true);
    try {
      await api.put(`/cvs/${cvId}`, { title, template_id: template, data });
    } catch {
      toast.error("Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  // Debounced auto-save
  useEffect(() => {
    if (!initialized) return;
    const h = setTimeout(() => { save(); }, 900);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, template, title, initialized]);

  const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: title });

  async function handleAvatar(file: File) {
    try {
      const bmp = await createImageBitmap(file);
      const size = Math.min(bmp.width, bmp.height);
      const canvas = document.createElement("canvas");
      canvas.width = 400; canvas.height = 400;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bmp, (bmp.width - size) / 2, (bmp.height - size) / 2, size, size, 0, 0, 400, 400);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setData(d => ({ ...d, avatarUrl: dataUrl }));
      toast.success("Photo mise à jour");
    } catch {
      toast.error("Image invalide");
    }
  }

  if (loadingCv) return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto max-w-[1600px] px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/dashboard" className="p-2 rounded-lg hover:bg-muted"><ArrowLeft className="h-4 w-4" /></Link>
            <input value={title} onChange={e => setTitle(e.target.value)} className="font-semibold bg-transparent outline-none focus:bg-muted rounded-lg px-2 py-1 min-w-0" />
            {saving && <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Enregistrement…</span>}
            {!saving && initialized && <span className="text-xs text-green-600">✓ Enregistré</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={save} className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:bg-muted"><Save className="h-4 w-4" /> Sauver</button>
            <button onClick={handlePrint} className="inline-flex items-center gap-2 rounded-xl gradient-primary text-white font-semibold px-4 py-2 shadow-elegant hover:scale-[1.02] transition-transform">
              <Download className="h-4 w-4" /> Télécharger PDF
            </button>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[420px_1fr] gap-6 p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* FORM */}
        <div className="space-y-4">
          <Panel title="Template">
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map(t => (
                <motion.button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  whileHover={{ y: -3 }}
                  className={`group relative rounded-xl p-1.5 border-2 text-xs transition-all ${template === t.id ? "border-primary bg-primary/5 shadow-elegant" : "border-transparent hover:border-border bg-muted/30"}`}
                >
                  <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-white">
                    <div className="absolute inset-0 origin-top-left" style={{ transform: "scale(0.16)", width: "210mm", height: "297mm" }}>
                      <CVPreview data={{ ...SAMPLE_CV, accent: data.accent, fontFamily: data.fontFamily }} template={t.id} />
                    </div>
                    <div className="absolute top-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-green-500/90 text-white shadow">ATS {t.ats}</div>
                  </div>
                  <div className="mt-1.5 font-semibold truncate">{t.name}</div>
                  <div className="text-[9px] text-muted-foreground truncate">{t.tag}</div>
                </motion.button>
              ))}
            </div>
          </Panel>

          <Panel title="🎨 Style — couleur & police">
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Couleur d'accent</div>
              <div className="flex flex-wrap gap-2">
                {ACCENT_COLORS.map(c => (
                  <button key={c} onClick={() => setData(d => ({ ...d, accent: c }))} title={c}
                    className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${data.accent === c ? "border-foreground scale-110" : "border-white shadow"}`}
                    style={{ background: c }} />
                ))}
                <label className="h-7 w-7 rounded-full border-2 border-dashed border-border grid place-items-center cursor-pointer overflow-hidden">
                  <input type="color" value={data.accent ?? "#4f46e5"} onChange={e => setData(d => ({ ...d, accent: e.target.value }))} className="h-10 w-10 cursor-pointer" />
                </label>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Police</div>
              <select value={data.fontFamily ?? "Inter"} onChange={e => setData(d => ({ ...d, fontFamily: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                {FONT_FAMILIES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setData(d => ({ ...d, [key]: (d[key] as any[]).map(x => x.id === id ? { ...x, ...patch } : x) }));
}
