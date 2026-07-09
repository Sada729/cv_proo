export type CVExperience = {
  id: string;
  role: string;
  company: string;
  location?: string;
  start: string;
  end: string;
  description: string;
};

export type CVEducation = {
  id: string;
  school: string;
  degree: string;
  start: string;
  end: string;
  description?: string;
};

export type CVData = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl?: string;
  summary: string;
  experiences: CVExperience[];
  educations: CVEducation[];
  skills: string[];
  languages: { name: string; level: string }[];
  accent?: string;
  fontFamily?: string;
};

export const emptyCV: CVData = {
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  experiences: [],
  educations: [],
  skills: [],
  languages: [],
  accent: "#4f46e5",
  fontFamily: "Inter",
};

export const TEMPLATES = [
  { id: "executive", name: "Executive", tag: "Corporate", ats: 98 },
  { id: "minimal", name: "Minimal", tag: "ATS-First", ats: 100 },
  { id: "classic", name: "Classic", tag: "Traditionnel", ats: 99 },
  { id: "gold", name: "Noir & Or", tag: "Premium", ats: 92 },
  { id: "creative", name: "Créatif", tag: "Design", ats: 88 },
  { id: "modern", name: "Modern Sidebar", tag: "Moderne", ats: 94 },
  { id: "elegant", name: "Elegant", tag: "Éditorial", ats: 96 },
  { id: "tech", name: "Tech Pro", tag: "Développeur", ats: 97 },
  { id: "compact", name: "Compact", tag: "Dense", ats: 95 },
] as const;

export type TemplateId = typeof TEMPLATES[number]["id"];

export const ACCENT_COLORS = [
  "#4f46e5", "#0ea5e9", "#059669", "#dc2626",
  "#ea580c", "#7c3aed", "#db2777", "#0f172a", "#C9A961",
];

export const FONT_FAMILIES = [
  { id: "Inter", label: "Inter (moderne)", css: "'Inter', system-ui, sans-serif" },
  { id: "Sora", label: "Sora (professionnel)", css: "'Sora', system-ui, sans-serif" },
  { id: "Merriweather", label: "Merriweather (classique)", css: "'Merriweather', Georgia, serif" },
  { id: "Playfair", label: "Playfair (éditorial)", css: "'Playfair Display', Georgia, serif" },
  { id: "JetBrains", label: "JetBrains Mono (tech)", css: "'JetBrains Mono', monospace" },
];

export const SAMPLE_CV: CVData = {
  fullName: "Awa Diallo",
  title: "Product Manager Senior",
  email: "awa.diallo@email.com",
  phone: "+221 77 000 00 00",
  location: "Dakar, Sénégal",
  summary:
    "PM avec 7 ans d'expérience en produits SaaS B2B. Passionnée par le design centré utilisateur et la croissance data-driven.",
  experiences: [
    { id: "1", role: "Product Manager", company: "Orange Digital", location: "Dakar", start: "2022", end: "Actuel", description: "Pilotage d'une roadmap SaaS multi-pays. +38% de conversion en 18 mois." },
    { id: "2", role: "Associate PM", company: "Wave", location: "Dakar", start: "2019", end: "2022", description: "Lancement de 4 features majeures. Coordination avec équipes tech et design." },
  ],
  educations: [
    { id: "1", school: "HEC Paris", degree: "MSc Innovation", start: "2017", end: "2019" },
    { id: "2", school: "UCAD", degree: "Licence Économie", start: "2014", end: "2017" },
  ],
  skills: ["Product Strategy", "Agile", "SQL", "Figma", "A/B Testing", "OKRs"],
  languages: [{ name: "Français", level: "Natif" }, { name: "Anglais", level: "C1" }, { name: "Wolof", level: "Natif" }],
  accent: "#4f46e5",
  fontFamily: "Inter",
};

export const PLANS = [
  { id: "starter", name: "Starter", price: 1000, credits: 1, features: ["1 CV téléchargeable", "Tous les templates ATS", "Export PDF HD"] },
  { id: "pro", name: "Pro", price: 2000, credits: 5, features: ["5 CV téléchargeables", "Adaptation IA à l'offre", "Import ancien CV", "Support prioritaire"], popular: true },
  { id: "premium", name: "Premium", price: 5000, credits: 999, features: ["CV illimités", "Lettre de motivation IA", "Coach carrière IA", "Multi-langues"] },
] as const;