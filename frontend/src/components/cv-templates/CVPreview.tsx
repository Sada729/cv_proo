import type { ReactElement } from "react";
import type { CVData, TemplateId } from "@/lib/cv-types";
import { FONT_FAMILIES } from "@/lib/cv-types";

export function CVPreview({ data, template }: { data: CVData; template: TemplateId }) {
  const Comp = TemplateMap[template] ?? Executive;
  const font = FONT_FAMILIES.find(f => f.id === (data.fontFamily ?? "Inter"))?.css
    ?? "'Inter', system-ui, sans-serif";
  return <div style={{ fontFamily: font }}><Comp data={data} /></div>;
}

function accentOf(data: CVData, fallback = "#4f46e5") { return data.accent || fallback; }

function SectionTitle({ children, color = "#3730a3" }: { children: string; color?: string }) {
  return (
    <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] mt-5 mb-2 pb-1 border-b" style={{ color, borderColor: color + "33" }}>{children}</h2>
  );
}

function Executive({ data }: { data: CVData }) {
  const c = accentOf(data);
  return (
    <div className="bg-white text-slate-900 p-10 min-h-[297mm] w-[210mm] mx-auto text-[11px] leading-relaxed">
      <header className="flex items-center gap-6 pb-5 border-b-2" style={{ borderColor: c }}>
        {data.avatarUrl && <img src={data.avatarUrl} alt="" className="h-24 w-24 rounded-full object-cover border-2" style={{ borderColor: c }} />}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: c }}>{data.fullName || "Votre nom"}</h1>
          <div className="font-medium mt-1" style={{ color: c }}>{data.title || "Votre poste"}</div>
          <div className="mt-2 text-slate-600 text-[10px] flex flex-wrap gap-3">
            {data.email && <span>✉ {data.email}</span>}
            {data.phone && <span>☎ {data.phone}</span>}
            {data.location && <span>📍 {data.location}</span>}
          </div>
        </div>
      </header>

      {data.summary && (<><SectionTitle color={c}>Profil</SectionTitle><p className="text-slate-700">{data.summary}</p></>)}

      {data.experiences.length > 0 && (<>
        <SectionTitle color={c}>Expérience professionnelle</SectionTitle>
        {data.experiences.map(e => (
          <div key={e.id} className="mb-3">
            <div className="flex justify-between font-semibold"><span>{e.role} — {e.company}</span><span className="text-slate-500">{e.start} – {e.end}</span></div>
            <div className="text-slate-600 text-[10px]">{e.location}</div>
            <p className="mt-1 text-slate-700 whitespace-pre-line">{e.description}</p>
          </div>
        ))}
      </>)}

      {data.educations.length > 0 && (<>
        <SectionTitle color={c}>Formation</SectionTitle>
        {data.educations.map(e => (
          <div key={e.id} className="mb-2">
            <div className="flex justify-between font-semibold"><span>{e.degree} — {e.school}</span><span className="text-slate-500">{e.start} – {e.end}</span></div>
            {e.description && <p className="text-slate-700 mt-1">{e.description}</p>}
          </div>
        ))}
      </>)}

      {data.skills.length > 0 && (<>
        <SectionTitle color={c}>Compétences</SectionTitle>
        <div className="flex flex-wrap gap-1.5">{data.skills.map(s => <span key={s} className="px-2 py-0.5 rounded text-[10px]" style={{ background: c + "15", color: c }}>{s}</span>)}</div>
      </>)}

      {data.languages.length > 0 && (<>
        <SectionTitle color={c}>Langues</SectionTitle>
        <div className="flex flex-wrap gap-3">{data.languages.map(l => <span key={l.name} className="text-slate-700"><b>{l.name}</b> — {l.level}</span>)}</div>
      </>)}
    </div>
  );
}

function Minimal({ data }: { data: CVData }) {
  const c = accentOf(data, "#0f172a");
  return (
    <div className="bg-white text-slate-900 p-12 min-h-[297mm] w-[210mm] mx-auto text-[11px] leading-relaxed">
      <h1 className="text-4xl font-light tracking-tight" style={{ color: c }}>{data.fullName || "Votre nom"}</h1>
      <div className="text-slate-500 mt-1">{data.title}</div>
      <div className="mt-2 text-slate-500 text-[10px]">{[data.email, data.phone, data.location].filter(Boolean).join("  •  ")}</div>
      {data.summary && (<><SectionTitle color={c}>Résumé</SectionTitle><p>{data.summary}</p></>)}
      {data.experiences.length > 0 && (<><SectionTitle color={c}>Expérience</SectionTitle>
        {data.experiences.map(e => (
          <div key={e.id} className="mb-3">
            <div className="flex justify-between"><span className="font-semibold">{e.role}</span><span className="text-slate-500">{e.start} – {e.end}</span></div>
            <div className="italic text-slate-600">{e.company}{e.location ? ` • ${e.location}` : ""}</div>
            <p className="mt-1 whitespace-pre-line">{e.description}</p>
          </div>))}</>)}
      {data.educations.length > 0 && (<><SectionTitle color={c}>Formation</SectionTitle>
        {data.educations.map(e => (
          <div key={e.id} className="mb-2"><div className="flex justify-between"><span className="font-semibold">{e.degree}</span><span className="text-slate-500">{e.start} – {e.end}</span></div><div className="italic text-slate-600">{e.school}</div></div>))}</>)}
      {data.skills.length > 0 && (<><SectionTitle color={c}>Compétences</SectionTitle><p>{data.skills.join(" · ")}</p></>)}
      {data.languages.length > 0 && (<><SectionTitle color={c}>Langues</SectionTitle><p>{data.languages.map(l => `${l.name} (${l.level})`).join(" · ")}</p></>)}
    </div>
  );
}

function Gold({ data }: { data: CVData }) {
  const c = accentOf(data, "#C9A961");
  return (
    <div className="bg-slate-900 text-slate-100 p-10 min-h-[297mm] w-[210mm] mx-auto text-[11px] leading-relaxed">
      <header className="pb-4 border-b" style={{ borderColor: c }}>
        <h1 className="text-4xl font-bold" style={{ color: c }}>{data.fullName || "Votre nom"}</h1>
        <div className="mt-1 text-slate-300">{data.title}</div>
        <div className="mt-2 text-slate-400 text-[10px]">{[data.email, data.phone, data.location].filter(Boolean).join("  •  ")}</div>
      </header>
      {data.summary && (<><SectionTitle color={c}>Profil</SectionTitle><p className="text-slate-200">{data.summary}</p></>)}
      {data.experiences.length > 0 && (<><SectionTitle color={c}>Expérience</SectionTitle>
        {data.experiences.map(e => (
          <div key={e.id} className="mb-3">
            <div className="flex justify-between"><span className="font-semibold">{e.role} — {e.company}</span><span style={{ color: c }}>{e.start} – {e.end}</span></div>
            <p className="mt-1 text-slate-200 whitespace-pre-line">{e.description}</p>
          </div>))}</>)}
      {data.educations.length > 0 && (<><SectionTitle color={c}>Formation</SectionTitle>
        {data.educations.map(e => <div key={e.id} className="mb-2"><div className="flex justify-between"><b>{e.degree} — {e.school}</b><span style={{ color: c }}>{e.start} – {e.end}</span></div></div>)}</>)}
      {data.skills.length > 0 && (<><SectionTitle color={c}>Compétences</SectionTitle><div className="flex flex-wrap gap-1.5">{data.skills.map(s => <span key={s} className="px-2 py-0.5 rounded border text-[10px]" style={{ borderColor: c, color: c }}>{s}</span>)}</div></>)}
    </div>
  );
}

function Creative({ data }: { data: CVData }) {
  const c = accentOf(data);
  return (
    <div className="bg-white min-h-[297mm] w-[210mm] mx-auto grid grid-cols-[35%_65%] text-[11px]">
      <aside className="text-white p-6" style={{ background: `linear-gradient(180deg, ${c}, ${c}cc)` }}>
        {data.avatarUrl && <img src={data.avatarUrl} alt="" className="h-28 w-28 rounded-full object-cover border-4 border-white mx-auto" />}
        <h1 className="mt-4 text-2xl font-bold text-center">{data.fullName || "Votre nom"}</h1>
        <div className="text-center text-white/85 text-[10px] mt-1">{data.title}</div>
        <div className="mt-6 space-y-1.5 text-[10px]">
          {data.email && <div>✉ {data.email}</div>}
          {data.phone && <div>☎ {data.phone}</div>}
          {data.location && <div>📍 {data.location}</div>}
        </div>
        {data.skills.length > 0 && (<div className="mt-6"><div className="text-[10px] font-bold uppercase tracking-widest mb-2">Compétences</div><div className="space-y-1">{data.skills.map(s => <div key={s} className="text-[10px]">• {s}</div>)}</div></div>)}
        {data.languages.length > 0 && (<div className="mt-6"><div className="text-[10px] font-bold uppercase tracking-widest mb-2">Langues</div>{data.languages.map(l => <div key={l.name} className="text-[10px]">{l.name} — {l.level}</div>)}</div>)}
      </aside>
      <section className="p-8 text-slate-900">
        {data.summary && (<><SectionTitle color={c}>Profil</SectionTitle><p>{data.summary}</p></>)}
        {data.experiences.length > 0 && (<><SectionTitle color={c}>Expérience</SectionTitle>
          {data.experiences.map(e => (
            <div key={e.id} className="mb-3">
              <div className="font-semibold" style={{ color: c }}>{e.role}</div>
              <div className="flex justify-between text-slate-600 text-[10px]"><span>{e.company}</span><span>{e.start} – {e.end}</span></div>
              <p className="mt-1 whitespace-pre-line">{e.description}</p>
            </div>))}</>)}
        {data.educations.length > 0 && (<><SectionTitle color={c}>Formation</SectionTitle>
          {data.educations.map(e => <div key={e.id} className="mb-2"><b>{e.degree}</b> — {e.school} <span className="text-slate-500">({e.start} – {e.end})</span></div>)}</>)}
      </section>
    </div>
  );
}

function Classic({ data }: { data: CVData }) {
  const c = accentOf(data, "#1f2937");
  return (
    <div className="bg-white text-slate-900 p-12 min-h-[297mm] w-[210mm] mx-auto text-[11px] leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
      <header className="text-center pb-4 border-b-2 border-slate-800">
        <h1 className="text-4xl font-bold tracking-wide" style={{ color: c }}>{data.fullName || "Votre nom"}</h1>
        <div className="mt-1 text-slate-600 italic">{data.title}</div>
        <div className="mt-2 text-slate-500 text-[10px]">{[data.email, data.phone, data.location].filter(Boolean).join("  |  ")}</div>
      </header>
      {data.summary && (<><SectionTitle color={c}>Objectif</SectionTitle><p>{data.summary}</p></>)}
      {data.experiences.length > 0 && (<><SectionTitle color={c}>Expérience professionnelle</SectionTitle>
        {data.experiences.map(e => (
          <div key={e.id} className="mb-3">
            <div className="flex justify-between"><b>{e.role}, {e.company}</b><span>{e.start} – {e.end}</span></div>
            <p className="mt-1 whitespace-pre-line">{e.description}</p>
          </div>))}</>)}
      {data.educations.length > 0 && (<><SectionTitle color={c}>Formation</SectionTitle>
        {data.educations.map(e => <div key={e.id} className="mb-1 flex justify-between"><span><b>{e.degree}</b>, {e.school}</span><span>{e.start} – {e.end}</span></div>)}</>)}
      {data.skills.length > 0 && (<><SectionTitle color={c}>Compétences</SectionTitle><p>{data.skills.join(", ")}</p></>)}
      {data.languages.length > 0 && (<><SectionTitle color={c}>Langues</SectionTitle><p>{data.languages.map(l => `${l.name} (${l.level})`).join(", ")}</p></>)}
    </div>
  );
}

function Modern({ data }: { data: CVData }) {
  const c = accentOf(data);
  return (
    <div className="bg-white min-h-[297mm] w-[210mm] mx-auto grid grid-cols-[38%_62%] text-[11px]">
      <aside className="bg-slate-50 p-8 border-r border-slate-200">
        {data.avatarUrl && <img src={data.avatarUrl} alt="" className="h-24 w-24 rounded-2xl object-cover" />}
        <h1 className="mt-4 text-2xl font-bold text-slate-900">{data.fullName || "Votre nom"}</h1>
        <div className="text-sm mt-1" style={{ color: c }}>{data.title}</div>
        <div className="mt-5 space-y-1 text-[10px] text-slate-600">
          {data.email && <div>✉ {data.email}</div>}
          {data.phone && <div>☎ {data.phone}</div>}
          {data.location && <div>📍 {data.location}</div>}
        </div>
        {data.skills.length > 0 && (<><div className="mt-6 text-[10px] font-bold uppercase tracking-widest" style={{ color: c }}>Compétences</div>
          <div className="mt-2 flex flex-wrap gap-1.5">{data.skills.map(s => <span key={s} className="px-2 py-0.5 rounded-full text-[10px] bg-white border border-slate-200">{s}</span>)}</div></>)}
        {data.languages.length > 0 && (<><div className="mt-6 text-[10px] font-bold uppercase tracking-widest" style={{ color: c }}>Langues</div>
          {data.languages.map(l => <div key={l.name} className="text-[10px] mt-1 flex justify-between"><span>{l.name}</span><span className="text-slate-500">{l.level}</span></div>)}</>)}
      </aside>
      <section className="p-8">
        {data.summary && (<><SectionTitle color={c}>Profil</SectionTitle><p>{data.summary}</p></>)}
        {data.experiences.length > 0 && (<><SectionTitle color={c}>Expérience</SectionTitle>
          {data.experiences.map(e => (
            <div key={e.id} className="mb-3 pl-3 border-l-2" style={{ borderColor: c }}>
              <div className="font-semibold">{e.role}</div>
              <div className="flex justify-between text-[10px] text-slate-600"><span>{e.company} · {e.location}</span><span>{e.start} – {e.end}</span></div>
              <p className="mt-1 whitespace-pre-line">{e.description}</p>
            </div>))}</>)}
        {data.educations.length > 0 && (<><SectionTitle color={c}>Formation</SectionTitle>
          {data.educations.map(e => <div key={e.id} className="mb-1"><b>{e.degree}</b> — {e.school} <span className="text-slate-500 text-[10px]">({e.start} – {e.end})</span></div>)}</>)}
      </section>
    </div>
  );
}

function Elegant({ data }: { data: CVData }) {
  const c = accentOf(data, "#7c3aed");
  return (
    <div className="bg-white text-slate-900 p-14 min-h-[297mm] w-[210mm] mx-auto text-[11px] leading-relaxed">
      <header className="text-center">
        <div className="mx-auto h-px w-16" style={{ background: c }} />
        <h1 className="mt-4 text-5xl font-light tracking-widest uppercase" style={{ color: c }}>{data.fullName || "Votre nom"}</h1>
        <div className="mt-2 tracking-[0.4em] text-[10px] text-slate-500 uppercase">{data.title}</div>
        <div className="mx-auto mt-4 h-px w-16" style={{ background: c }} />
        <div className="mt-3 text-[10px] text-slate-500">{[data.email, data.phone, data.location].filter(Boolean).join("  ·  ")}</div>
      </header>
      {data.summary && (<><SectionTitle color={c}>À propos</SectionTitle><p className="text-center italic">{data.summary}</p></>)}
      {data.experiences.length > 0 && (<><SectionTitle color={c}>Parcours</SectionTitle>
        {data.experiences.map(e => (
          <div key={e.id} className="mb-3 text-center">
            <div className="font-semibold" style={{ color: c }}>{e.role}</div>
            <div className="text-[10px] text-slate-600">{e.company} · {e.start} – {e.end}</div>
            <p className="mt-1 whitespace-pre-line">{e.description}</p>
          </div>))}</>)}
      {data.educations.length > 0 && (<><SectionTitle color={c}>Formation</SectionTitle>
        <div className="text-center">{data.educations.map(e => <div key={e.id}><b>{e.degree}</b> — {e.school} ({e.start} – {e.end})</div>)}</div></>)}
      {data.skills.length > 0 && (<><SectionTitle color={c}>Compétences</SectionTitle><p className="text-center">{data.skills.join(" · ")}</p></>)}
    </div>
  );
}

function Tech({ data }: { data: CVData }) {
  const c = accentOf(data, "#059669");
  return (
    <div className="bg-white text-slate-900 p-10 min-h-[297mm] w-[210mm] mx-auto text-[11px] leading-relaxed" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <header>
        <div className="text-[10px]" style={{ color: c }}>$ whoami</div>
        <h1 className="text-3xl font-bold">{data.fullName || "votre-nom"}</h1>
        <div className="text-slate-600 mt-1">// {data.title}</div>
        <div className="mt-3 text-[10px] text-slate-500">{[data.email, data.phone, data.location].filter(Boolean).join("  ·  ")}</div>
      </header>
      {data.summary && (<><SectionTitle color={c}>## Résumé</SectionTitle><p>{data.summary}</p></>)}
      {data.experiences.length > 0 && (<><SectionTitle color={c}>## Expérience</SectionTitle>
        {data.experiences.map(e => (
          <div key={e.id} className="mb-3">
            <div><span style={{ color: c }}>▸</span> <b>{e.role}</b> @ {e.company} <span className="text-slate-500">[{e.start}—{e.end}]</span></div>
            <p className="mt-1 whitespace-pre-line pl-4">{e.description}</p>
          </div>))}</>)}
      {data.educations.length > 0 && (<><SectionTitle color={c}>## Formation</SectionTitle>
        {data.educations.map(e => <div key={e.id}><span style={{ color: c }}>▸</span> {e.degree} — {e.school} <span className="text-slate-500">[{e.start}—{e.end}]</span></div>)}</>)}
      {data.skills.length > 0 && (<><SectionTitle color={c}>## Stack</SectionTitle>
        <div className="flex flex-wrap gap-1.5">{data.skills.map(s => <span key={s} className="px-2 py-0.5 rounded text-[10px]" style={{ background: c + "15", color: c }}>{s}</span>)}</div></>)}
      {data.languages.length > 0 && (<><SectionTitle color={c}>## Langues</SectionTitle><p>{data.languages.map(l => `${l.name}=${l.level}`).join("  ")}</p></>)}
    </div>
  );
}

function Compact({ data }: { data: CVData }) {
  const c = accentOf(data, "#0ea5e9");
  return (
    <div className="bg-white text-slate-900 p-8 min-h-[297mm] w-[210mm] mx-auto text-[10.5px] leading-snug">
      <header className="flex items-baseline justify-between border-b pb-2" style={{ borderColor: c }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: c }}>{data.fullName || "Votre nom"}</h1>
          <div className="text-slate-600 text-xs">{data.title}</div>
        </div>
        <div className="text-[9.5px] text-right text-slate-500">
          {data.email && <div>{data.email}</div>}
          {data.phone && <div>{data.phone}</div>}
          {data.location && <div>{data.location}</div>}
        </div>
      </header>
      {data.summary && (<p className="mt-3">{data.summary}</p>)}
      {data.experiences.length > 0 && (<><h2 className="mt-4 text-[10px] font-bold uppercase tracking-widest" style={{ color: c }}>Expérience</h2>
        {data.experiences.map(e => (
          <div key={e.id} className="mt-1.5">
            <div className="flex justify-between"><span><b>{e.role}</b>, {e.company}</span><span className="text-slate-500">{e.start}–{e.end}</span></div>
            <p className="whitespace-pre-line">{e.description}</p>
          </div>))}</>)}
      {data.educations.length > 0 && (<><h2 className="mt-4 text-[10px] font-bold uppercase tracking-widest" style={{ color: c }}>Formation</h2>
        {data.educations.map(e => <div key={e.id} className="flex justify-between"><span><b>{e.degree}</b> — {e.school}</span><span className="text-slate-500">{e.start}–{e.end}</span></div>)}</>)}
      <div className="mt-4 grid grid-cols-2 gap-4">
        {data.skills.length > 0 && (<div><h2 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: c }}>Compétences</h2><p className="mt-1">{data.skills.join(" · ")}</p></div>)}
        {data.languages.length > 0 && (<div><h2 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: c }}>Langues</h2><p className="mt-1">{data.languages.map(l => `${l.name} (${l.level})`).join(" · ")}</p></div>)}
      </div>
    </div>
  );
}

const TemplateMap: Record<TemplateId, (p: { data: CVData }) => ReactElement> = {
  executive: Executive,
  minimal: Minimal,
  classic: Classic,
  gold: Gold,
  creative: Creative,
  modern: Modern,
  elegant: Elegant,
  tech: Tech,
  compact: Compact,
};