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
};

export const TEMPLATES = [
  { id: "executive", name: "Executive", tag: "Corporate" },
  { id: "minimal", name: "Minimal", tag: "ATS-First" },
  { id: "gold", name: "Noir & Or", tag: "Premium" },
  { id: "creative", name: "Créatif", tag: "Design" },
] as const;

export type TemplateId = typeof TEMPLATES[number]["id"];

export const PLANS = [
  { id: "starter", name: "Starter", price: 1000, credits: 1, features: ["1 CV téléchargeable", "Tous les templates ATS", "Export PDF HD"] },
  { id: "pro", name: "Pro", price: 2000, credits: 5, features: ["5 CV téléchargeables", "Adaptation IA à l'offre", "Import ancien CV", "Support prioritaire"], popular: true },
  { id: "premium", name: "Premium", price: 5000, credits: 999, features: ["CV illimités", "Lettre de motivation IA", "Coach carrière IA", "Multi-langues"] },
] as const;