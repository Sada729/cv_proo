import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion, type Variants, useMotionValue, useSpring } from "motion/react";
import {
  Sparkles, Upload, Wand2, Check, ArrowRight,
  ShieldCheck, Target, Bot, ChevronDown, Quote,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import heroPerson from "@/assets/hero-person.jpg";
import tpl1 from "@/assets/template-1.jpg";
import tpl2 from "@/assets/template-2.jpg";
import tpl3 from "@/assets/template-3.jpg";
import tpl4 from "@/assets/template-4.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: "easeOut" },
  }),
};

function Header() {
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-4 left-1/2 z-50 w-[min(1200px,calc(100%-2rem))] -translate-x-1/2"
    >
      <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-5 py-3 shadow-card backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="grid h-8 w-8 place-items-center rounded-xl gradient-primary text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>ResumAI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
          {["Fonctionnalités", "Templates", "Tarifs", "FAQ"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-foreground transition-colors">{l}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth" className="hidden sm:inline-flex text-sm font-medium px-4 py-2 rounded-xl hover:bg-muted transition-colors">
            Connexion
          </Link>
          <Link to="/auth" className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl gradient-primary text-white shadow-elegant hover:opacity-90 transition-opacity">
            Commencer <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

function Hero() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });

  return (
    <section className="relative pt-32 pb-20 px-4"
      onMouseMove={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="relative overflow-hidden rounded-[2.5rem] shadow-elegant">
          <div className="absolute inset-0 gradient-hero" />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60 mix-blend-overlay"
            style={{
              background: "radial-gradient(500px circle at var(--mx) var(--my), rgba(255,255,255,0.35), transparent 60%)",
              "--mx": sx as unknown as string,
              "--my": sy as unknown as string,
            } as React.CSSProperties}
          />
          <div className="absolute -top-32 -right-20 h-96 w-96 rounded-full bg-white/20 blur-3xl animate-blob" />
          <div className="absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-primary-foreground/10 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />

          <div className="relative grid lg:grid-cols-2 gap-8 p-8 md:p-14">
            <div className="text-white">
              <motion.div variants={fadeUp} initial="hidden" animate="show" className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-xs font-medium border border-white/20">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Approuvé par 12 000+ candidats
              </motion.div>
              <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="show" className="mt-6 text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05]">
                Votre CV,<br />réinventé par l'<span className="italic font-serif">IA</span>.
              </motion.h1>
              <motion.p variants={fadeUp} custom={2} initial="hidden" animate="show" className="mt-6 max-w-lg text-white/85 text-lg">
                Créez un CV moderne, 100% compatible ATS, adapté à chaque offre en un clic. Templates premium, conseils intelligents, résultats professionnels.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show" className="mt-8 flex flex-wrap gap-3">
                <Link to="/auth" className="inline-flex items-center gap-2 rounded-2xl bg-white text-primary font-semibold px-6 py-3.5 shadow-lg hover:scale-[1.02] transition-transform">
                  Créer mon CV gratuit <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/auth" className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/10 backdrop-blur text-white font-semibold px-6 py-3.5 hover:bg-white/20 transition-colors">
                  <Upload className="h-4 w-4" /> Importer mon CV
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} custom={4} initial="hidden" animate="show" className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-9 w-9 rounded-full border-2 border-white gradient-primary" style={{ background: `linear-gradient(${i*90}deg, oklch(0.7 0.2 ${240+i*20}), oklch(0.55 0.22 ${260+i*15}))` }} />
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-bold text-lg">3.5k+</div>
                  <div className="text-white/70 text-xs">CV créés cette semaine</div>
                </div>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
              <div className="relative h-full min-h-[420px] rounded-3xl overflow-hidden">
                <img src={heroPerson} alt="Créez votre CV professionnel" className="h-full w-full object-cover" width={1024} height={1280} />
              </div>

              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="absolute top-6 -left-4 md:left-4 rounded-2xl bg-white/95 backdrop-blur p-3 shadow-card animate-float">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-green-100 text-green-700">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div>Score ATS</div>
                    <div className="text-green-600">98/100</div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="absolute bottom-6 -right-4 md:right-4 rounded-2xl bg-white/95 backdrop-blur p-3 shadow-card animate-float" style={{ animationDelay: "1.5s" }}>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <div>Conseil IA</div>
                    <div className="text-muted-foreground font-normal">Optimisé pour votre secteur</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: ShieldCheck, title: "100% ATS-Ready", desc: "Structure lisible par tous les systèmes de tri automatique." },
  { icon: Target, title: "Adapté à l'offre", desc: "Collez l'annonce, l'IA reformule votre CV pour ce poste." },
  { icon: Upload, title: "Import & conversion", desc: "Uploadez un vieux CV, on le transforme au format ATS." },
  { icon: Bot, title: "Conseil IA en temps réel", desc: "Suggestions de formulation, mots-clés, points forts." },
];

function Features() {
  return (
    <section id="fonctionnalités" className="py-24 px-4">
      <div className="mx-auto max-w-[1200px]">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-primary font-semibold">Ce qu'on fait</div>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold">Tout ce qu'il vous faut pour être choisi.</h2>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-card border border-border/50"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity gradient-primary" />
              <div className="relative">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-white/20 group-hover:text-white transition-colors">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold text-lg group-hover:text-white transition-colors">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground group-hover:text-white/85 transition-colors">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const templates = [
  { img: tpl1, name: "Executive", tag: "Corporate" },
  { img: tpl2, name: "Noir & Or", tag: "Premium" },
  { img: tpl3, name: "Créatif", tag: "Design" },
  { img: tpl4, name: "Minimal", tag: "ATS-First" },
];

function Templates() {
  return (
    <section id="templates" className="py-24 px-4 bg-gradient-to-b from-transparent to-muted/40">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary font-semibold">Templates</div>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold">Un design pour chaque ambition.</h2>
          </div>
          <a href="#" className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
            Voir tous les modèles <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {templates.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -10, rotate: -1 }}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-card shadow-card cursor-pointer"
            >
              <img src={t.img} alt={t.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-x-0 bottom-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                <div className="text-xs text-white/80">{t.tag}</div>
                <div className="font-bold text-white text-lg">{t.name}</div>
                <button className="mt-2 inline-flex items-center gap-1 text-xs font-semibold bg-white text-primary px-3 py-1.5 rounded-lg">
                  Utiliser <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  const steps = [
    { n: "01", title: "Choisissez un template", desc: "Parcourez notre bibliothèque de designs modernes et ATS-friendly." },
    { n: "02", title: "Importez ou créez", desc: "Uploadez un ancien CV ou remplissez le formulaire guidé." },
    { n: "03", title: "Adaptez à l'offre", desc: "Collez la fiche de poste, l'IA optimise mot pour mot." },
    { n: "04", title: "Téléchargez et postulez", desc: "Export PDF haute qualité, prêt à envoyer." },
  ];
  return (
    <section className="py-24 px-4">
      <div className="mx-auto max-w-[1200px] grid lg:grid-cols-2 gap-14 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-elegant">
            <img src={tpl1} alt="Aperçu CV" className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="absolute -top-6 -right-6 h-32 w-32 rounded-2xl gradient-primary shadow-glow -z-10" />
          <div className="absolute -bottom-6 -left-6 h-40 w-40 rounded-full bg-accent -z-10" />
        </motion.div>

        <div>
          <div className="text-xs uppercase tracking-widest text-primary font-semibold">Le processus</div>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold">4 étapes.<br />Un CV qui décroche des entretiens.</h2>
          <div className="mt-10 space-y-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex gap-4 rounded-2xl bg-card p-5 shadow-card border border-border/50 hover:border-primary/50 transition-colors"
              >
                <div className="text-2xl font-black text-primary/30 group-hover:text-primary transition-colors">{s.n}</div>
                <div>
                  <div className="font-bold">{s.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    { name: "Starter", price: "1 000", per: "FCFA", features: ["1 CV téléchargeable", "Tous les templates ATS", "Export PDF haute qualité"], cta: "Choisir Starter", featured: false },
    { name: "Pro", price: "2 000", per: "FCFA", features: ["5 CV téléchargeables", "Adaptation IA à l'offre", "Import ancien CV", "Support prioritaire"], cta: "Choisir Pro", featured: true },
    { name: "Premium", price: "5 000", per: "FCFA", features: ["CV illimités", "Lettre de motivation IA", "Coach carrière IA", "Multi-langues"], cta: "Choisir Premium", featured: false },
  ];
  return (
    <section id="tarifs" className="py-24 px-4">
      <div className="mx-auto max-w-[1200px]">
        <div className="text-center max-w-xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-primary font-semibold">Tarifs transparents</div>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold">Payez uniquement à la création.</h2>
          <p className="mt-4 text-muted-foreground">Wave · Orange Money · MTN · Moov · Carte bancaire. Sans abonnement.</p>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 ${p.featured ? "gradient-hero text-white shadow-elegant scale-105" : "bg-card border border-border shadow-card"}`}
            >
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white text-primary text-xs font-bold px-3 py-1 shadow">
                  ★ Le plus populaire
                </div>
              )}
              <div className="font-bold text-lg">{p.name}</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-black">{p.price}</span>
                <span className={`text-lg font-semibold ${p.featured ? "text-white/70" : "text-muted-foreground"}`}>{p.per}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${p.featured ? "text-white" : "text-primary"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth" className={`mt-8 w-full text-center block rounded-xl py-3 font-semibold transition-transform hover:scale-[1.02] ${p.featured ? "bg-white text-primary" : "gradient-primary text-white"}`}>
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "Qu'est-ce qu'un CV compatible ATS ?", a: "Un CV structuré pour être lu correctement par les logiciels de tri des recruteurs (Applicant Tracking Systems). Notre plateforme garantit cette compatibilité." },
    { q: "Puis-je importer mon ancien CV ?", a: "Oui, uploadez votre PDF ou Word, notre IA en extrait le contenu et le transforme au format ATS avec un design moderne." },
    { q: "L'IA adapte-t-elle vraiment le CV à chaque offre ?", a: "Absolument. Collez la fiche de poste, l'IA identifie les mots-clés et reformule vos expériences pour matcher l'annonce." },
    { q: "Puis-je ajouter ma photo de profil ?", a: "Oui, upload de photo disponible, avec recadrage automatique et optimisation pour le rendu final." },
    { q: "Comment fonctionne le paiement ?", a: "Paiement mensuel sécurisé (Stripe). Sans engagement, annulation en 1 clic depuis votre espace." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-24 px-4">
      <div className="mx-auto max-w-[900px]">
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-primary font-semibold">Questions fréquentes</div>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold">On répond à tout.</h2>
        </div>
        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-2xl bg-card border border-border/60 overflow-hidden"
            >
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between text-left p-5 font-semibold hover:bg-muted/50 transition-colors">
                <span>{f.q}</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              <motion.div
                initial={false}
                animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 text-muted-foreground text-sm">{f.a}</div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[2.5rem] gradient-hero p-12 md:p-20 text-center shadow-elegant"
      >
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-blob" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-blob" style={{ animationDelay: "2s" }} />
        <div className="relative">
          <Wand2 className="h-10 w-10 text-white mx-auto" />
          <h2 className="mt-4 text-4xl md:text-6xl font-bold text-white">Prêt à décrocher le job ?</h2>
          <p className="mt-4 text-white/85 max-w-xl mx-auto">Rejoignez des milliers de candidats qui ont transformé leur CV avec ResumAI.</p>
          <Link to="/auth" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white text-primary font-semibold px-8 py-4 shadow-lg hover:scale-[1.03] transition-transform">
            Créer mon CV maintenant <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-12 px-4">
      <div className="mx-auto max-w-[1200px] grid md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-bold text-2xl">
            <span className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            ResumAI
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-sm">Le créateur de CV intelligent, propulsé par l'IA. Modernes, ATS-ready, sur mesure.</p>
        </div>
        <div>
          <div className="font-semibold mb-3">Produit</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">Templates</a></li>
            <li><a href="#" className="hover:text-foreground">Tarifs</a></li>
            <li><a href="#" className="hover:text-foreground">Blog carrière</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Contact</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>hello@resumai.com</li>
            <li>+33 1 23 45 67 89</li>
            <li>Lun–Ven 9h–18h</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] mt-10 pt-6 border-t border-border/60 text-xs text-muted-foreground">
        © 2026 ResumAI. Tous droits réservés.
      </div>
    </footer>
  );
}

function Index() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <Hero />
      <Features />
      <Templates />
      <Process />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
