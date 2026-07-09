import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

const CV_SCHEMA_PROMPT = `Retourne STRICTEMENT un JSON valide au format:
{"fullName":"","title":"","email":"","phone":"","location":"","summary":"",
"experiences":[{"role":"","company":"","location":"","start":"","end":"","description":""}],
"educations":[{"school":"","degree":"","start":"","end":"","description":""}],
"skills":["..."],
"languages":[{"name":"","level":""}]}
Réponds uniquement avec le JSON, sans texte autour, sans backticks.`;

function withIds<T extends { id?: string }>(arr: T[] | undefined): (T & { id: string })[] {
  return (arr ?? []).map((x, i) => ({ ...x, id: x.id ?? `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}` }));
}

function stripJson(s: string) {
  const m = s.match(/\{[\s\S]*\}/);
  return m ? m[0] : s;
}

async function callAI(messages: unknown[]): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY manquant");
  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: MODEL, messages }),
  });
  if (!res.ok) {
    const txt = await res.text();
    if (res.status === 429) throw new Error("Limite IA atteinte, réessayez dans une minute.");
    if (res.status === 402) throw new Error("Crédits IA épuisés. Contactez l'admin.");
    throw new Error(`Erreur IA (${res.status}): ${txt.slice(0, 200)}`);
  }
  const json = await res.json() as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "";
}

export const parseUploadedCV = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({
    fileBase64: z.string(),
    mimeType: z.string(),
    fileName: z.string(),
  }).parse(raw))
  .handler(async ({ data }): Promise<{ ok: boolean; cv?: unknown; error?: string }> => {
    try {
      const isImage = data.mimeType.startsWith("image/");
      const content = isImage
        ? [
            { type: "text", text: `${CV_SCHEMA_PROMPT}\n\nAnalyse le CV dans l'image et extrais les informations.` },
            { type: "image_url", image_url: { url: `data:${data.mimeType};base64,${data.fileBase64}` } },
          ]
        : [
            { type: "text", text: `${CV_SCHEMA_PROMPT}\n\nAnalyse ce CV et extrais les informations en respectant les normes ATS.` },
            { type: "file", file: { filename: data.fileName, file_data: `data:${data.mimeType};base64,${data.fileBase64}` } },
          ];

      const out = await callAI([
        { role: "system", content: "Tu es un expert RH qui structure des CV au format JSON ATS-friendly." },
        { role: "user", content },
      ]);
      const parsed = JSON.parse(stripJson(out));
      const cv = {
        fullName: parsed.fullName ?? "",
        title: parsed.title ?? "",
        email: parsed.email ?? "",
        phone: parsed.phone ?? "",
        location: parsed.location ?? "",
        summary: parsed.summary ?? "",
        experiences: withIds(parsed.experiences),
        educations: withIds(parsed.educations),
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        languages: Array.isArray(parsed.languages) ? parsed.languages : [],
      };
      return { ok: true, cv };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
    }
  });

export const adaptCVToJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({
    currentCV: z.any(),
    jobText: z.string().optional(),
    fileBase64: z.string().optional(),
    mimeType: z.string().optional(),
    fileName: z.string().optional(),
  }).parse(raw))
  .handler(async ({ data }): Promise<{ ok: boolean; cv?: unknown; error?: string }> => {
    try {
      const parts: unknown[] = [
        {
          type: "text",
          text:
            `Voici le CV actuel du candidat (JSON):\n${JSON.stringify(data.currentCV)}\n\n` +
            `Analyse l'offre d'emploi ci-dessous et RÉÉCRIS le CV pour maximiser la correspondance ATS: ` +
            `intègre les mots-clés pertinents, reformule les descriptions d'expériences en actions mesurables, ` +
            `ajuste le titre et le résumé. Garde la véracité (n'invente pas d'expériences).\n\n` +
            CV_SCHEMA_PROMPT,
        },
      ];
      if (data.jobText) parts.push({ type: "text", text: `Fiche de poste:\n${data.jobText}` });
      if (data.fileBase64 && data.mimeType) {
        if (data.mimeType.startsWith("image/")) {
          parts.push({ type: "image_url", image_url: { url: `data:${data.mimeType};base64,${data.fileBase64}` } });
        } else {
          parts.push({ type: "file", file: { filename: data.fileName ?? "job.pdf", file_data: `data:${data.mimeType};base64,${data.fileBase64}` } });
        }
      }
      const out = await callAI([
        { role: "system", content: "Tu es un coach carrière expert en optimisation ATS." },
        { role: "user", content: parts },
      ]);
      const parsed = JSON.parse(stripJson(out));
      const cv = {
        ...data.currentCV,
        fullName: parsed.fullName ?? data.currentCV.fullName,
        title: parsed.title ?? data.currentCV.title,
        email: parsed.email ?? data.currentCV.email,
        phone: parsed.phone ?? data.currentCV.phone,
        location: parsed.location ?? data.currentCV.location,
        summary: parsed.summary ?? data.currentCV.summary,
        experiences: withIds(parsed.experiences ?? data.currentCV.experiences),
        educations: withIds(parsed.educations ?? data.currentCV.educations),
        skills: Array.isArray(parsed.skills) ? parsed.skills : (data.currentCV.skills ?? []),
        languages: Array.isArray(parsed.languages) ? parsed.languages : (data.currentCV.languages ?? []),
      };
      return { ok: true, cv };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
    }
  });