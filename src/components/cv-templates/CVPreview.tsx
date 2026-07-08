import type { ReactElement } from "react";
import type { CVData, TemplateId } from "@/lib/cv-types";

export function CVPreview({ data, template }: { data: CVData; template: TemplateId }) {
  const Comp = TemplateMap[template] ?? Executive;
  return <Comp data={data} />;
}

function SectionTitle({ children, color = "#3730a3" }: { children: string; color?: string }) {
  return (
    <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] mt-5 mb-2 pb-1 border-b" style={{ color, borderColor: color + "33" }}>{children}</h2>
  );
}

function Executive({ data }: { data: CVData }) {
  return (
    <div className="bg-white text-slate-900 p-10 min-h-[297mm] w-[210mm] mx-auto font-sans text-[11px] leading-relaxed">
      <header className="flex items-center gap-6 pb-5 border-b-2 border-indigo-700">
        {data.avatarUrl && <img src={data.avatarUrl} alt="" className="h-24 w-24 rounded-full object-cover border-2 border-indigo-700" />}
        <div>
          <h1 className="text-3xl font-bold text-indigo-900">{data.fullName || "Votre nom"}</h1>
          <div className="text-indigo-700 font-medium mt-1">{data.title || "Votre poste"}</div>
          <div className="mt-2 text-slate-600 text-[10px] flex flex-wrap gap-3">
            {data.email && <span>✉ {data.email}</span>}
            {data.phone && <span>☎ {data.phone}</span>}
            {data.location && <span>📍 {data.location}</span>}
          </div>
        </div>
      </header>

      {data.summary && (<><SectionTitle>Profil</SectionTitle><p className="text-slate-700">{data.summary}</p></>)}

      {data.experiences.length > 0 && (<>
        <SectionTitle>Expérience professionnelle</SectionTitle>
        {data.experiences.map(e => (
          <div key={e.id} className="mb-3">
            <div className="flex justify-between font-semibold"><span>{e.role} — {e.company}</span><span className="text-slate-500">{e.start} – {e.end}</span></div>
            <div className="text-slate-600 text-[10px]">{e.location}</div>
            <p className="mt-1 text-slate-700 whitespace-pre-line">{e.description}</p>
          </div>
        ))}
      </>)}

      {data.educations.length > 0 && (<>
        <SectionTitle>Formation</SectionTitle>
        {data.educations.map(e => (
          <div key={e.id} className="mb-2">
            <div className="flex justify-between font-semibold"><span>{e.degree} — {e.school}</span><span className="text-slate-500">{e.start} – {e.end}</span></div>
            {e.description && <p className="text-slate-700 mt-1">{e.description}</p>}
          </div>
        ))}
      </>)}

      {data.skills.length > 0 && (<>
        <SectionTitle>Compétences</SectionTitle>
        <div className="flex flex-wrap gap-1.5">{data.skills.map(s => <span key={s} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 text-[10px]">{s}</span>)}</div>
      </>)}

      {data.languages.length > 0 && (<>
        <SectionTitle>Langues</SectionTitle>
        <div className="flex flex-wrap gap-3">{data.languages.map(l => <span key={l.name} className="text-slate-700"><b>{l.name}</b> — {l.level}</span>)}</div>
      </>)}
    </div>
  );
}

function Minimal({ data }: { data: CVData }) {
  return (
    <div className="bg-white text-slate-900 p-12 min-h-[297mm] w-[210mm] mx-auto font-sans text-[11px] leading-relaxed">
      <h1 className="text-4xl font-light tracking-tight">{data.fullName || "Votre nom"}</h1>
      <div className="text-slate-500 mt-1">{data.title}</div>
      <div className="mt-2 text-slate-500 text-[10px]">{[data.email, data.phone, data.location].filter(Boolean).join("  •  ")}</div>
      {data.summary && (<><SectionTitle color="#0f172a">Résumé</SectionTitle><p>{data.summary}</p></>)}
      {data.experiences.length > 0 && (<><SectionTitle color="#0f172a">Expérience</SectionTitle>
        {data.experiences.map(e => (
          <div key={e.id} className="mb-3">
            <div className="flex justify-between"><span className="font-semibold">{e.role}</span><span className="text-slate-500">{e.start} – {e.end}</span></div>
            <div className="italic text-slate-600">{e.company}{e.location ? ` • ${e.location}` : ""}</div>
            <p className="mt-1 whitespace-pre-line">{e.description}</p>
          </div>))}</>)}
      {data.educations.length > 0 && (<><SectionTitle color="#0f172a">Formation</SectionTitle>
        {data.educations.map(e => (
          <div key={e.id} className="mb-2"><div className="flex justify-between"><span className="font-semibold">{e.degree}</span><span className="text-slate-500">{e.start} – {e.end}</span></div><div className="italic text-slate-600">{e.school}</div></div>))}</>)}
      {data.skills.length > 0 && (<><SectionTitle color="#0f172a">Compétences</SectionTitle><p>{data.skills.join(" · ")}</p></>)}
      {data.languages.length > 0 && (<><SectionTitle color="#0f172a">Langues</SectionTitle><p>{data.languages.map(l => `${l.name} (${l.level})`).join(" · ")}</p></>)}
    </div>
  );
}

function Gold({ data }: { data: CVData }) {
  return (
    <div className="bg-slate-900 text-slate-100 p-10 min-h-[297mm] w-[210mm] mx-auto font-sans text-[11px] leading-relaxed">
      <header className="pb-4 border-b border-[#C9A961]">
        <h1 className="text-4xl font-bold" style={{ color: "#C9A961" }}>{data.fullName || "Votre nom"}</h1>
        <div className="mt-1 text-slate-300">{data.title}</div>
        <div className="mt-2 text-slate-400 text-[10px]">{[data.email, data.phone, data.location].filter(Boolean).join("  •  ")}</div>
      </header>
      {data.summary && (<><SectionTitle color="#C9A961">Profil</SectionTitle><p className="text-slate-200">{data.summary}</p></>)}
      {data.experiences.length > 0 && (<><SectionTitle color="#C9A961">Expérience</SectionTitle>
        {data.experiences.map(e => (
          <div key={e.id} className="mb-3">
            <div className="flex justify-between"><span className="font-semibold">{e.role} — {e.company}</span><span style={{ color: "#C9A961" }}>{e.start} – {e.end}</span></div>
            <p className="mt-1 text-slate-200 whitespace-pre-line">{e.description}</p>
          </div>))}</>)}
      {data.educations.length > 0 && (<><SectionTitle color="#C9A961">Formation</SectionTitle>
        {data.educations.map(e => <div key={e.id} className="mb-2"><div className="flex justify-between"><b>{e.degree} — {e.school}</b><span style={{ color: "#C9A961" }}>{e.start} – {e.end}</span></div></div>)}</>)}
      {data.skills.length > 0 && (<><SectionTitle color="#C9A961">Compétences</SectionTitle><div className="flex flex-wrap gap-1.5">{data.skills.map(s => <span key={s} className="px-2 py-0.5 rounded border border-[#C9A961] text-[#C9A961] text-[10px]">{s}</span>)}</div></>)}
    </div>
  );
}

function Creative({ data }: { data: CVData }) {
  return (
    <div className="bg-white min-h-[297mm] w-[210mm] mx-auto grid grid-cols-[35%_65%] text-[11px]">
      <aside className="bg-gradient-to-b from-indigo-600 to-purple-700 text-white p-6">
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
        {data.summary && (<><SectionTitle color="#4f46e5">Profil</SectionTitle><p>{data.summary}</p></>)}
        {data.experiences.length > 0 && (<><SectionTitle color="#4f46e5">Expérience</SectionTitle>
          {data.experiences.map(e => (
            <div key={e.id} className="mb-3">
              <div className="font-semibold text-indigo-800">{e.role}</div>
              <div className="flex justify-between text-slate-600 text-[10px]"><span>{e.company}</span><span>{e.start} – {e.end}</span></div>
              <p className="mt-1 whitespace-pre-line">{e.description}</p>
            </div>))}</>)}
        {data.educations.length > 0 && (<><SectionTitle color="#4f46e5">Formation</SectionTitle>
          {data.educations.map(e => <div key={e.id} className="mb-2"><b>{e.degree}</b> — {e.school} <span className="text-slate-500">({e.start} – {e.end})</span></div>)}</>)}
      </section>
    </div>
  );
}

const TemplateMap: Record<TemplateId, (p: { data: CVData }) => ReactElement> = {
  executive: Executive,
  minimal: Minimal,
  gold: Gold,
  creative: Creative,
};