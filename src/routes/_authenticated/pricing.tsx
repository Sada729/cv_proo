import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PLANS } from "@/lib/cv-types";
import { useState } from "react";
import { initiatePayment } from "@/lib/payments.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/pricing")({
  component: PricingPage,
});

function PricingPage() {
  const [pending, setPending] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleBuy(planId: string) {
    setPending(planId);
    try {
      const res = await initiatePayment({ data: { plan: planId } });
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        toast.error(res.error ?? "Impossible d'initier le paiement");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setPending(null);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1200px] px-4 py-14">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-primary font-semibold">Tarifs en franc CFA</div>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold">Payez uniquement quand vous téléchargez.</h1>
          <p className="mt-4 text-muted-foreground">Wave, Orange Money, MTN Money, cartes bancaires — via CinetPay.</p>
        </motion.div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className={`relative rounded-3xl p-8 ${"popular" in p && p.popular ? "gradient-hero text-white shadow-elegant lg:scale-105" : "bg-card border border-border shadow-card"}`}
            >
              {"popular" in p && p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white text-primary text-xs font-bold px-3 py-1 shadow">
                  ★ Le plus populaire
                </div>
              )}
              <div className="font-bold text-lg">{p.name}</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-black">{p.price.toLocaleString("fr-FR")}</span>
                <span className={"popular" in p && p.popular ? "text-white/70" : "text-muted-foreground"}>FCFA</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${"popular" in p && p.popular ? "text-white" : "text-primary"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleBuy(p.id)}
                disabled={pending !== null}
                className={`mt-8 w-full rounded-xl py-3 font-semibold transition-transform hover:scale-[1.02] disabled:opacity-50 inline-flex items-center justify-center gap-2 ${"popular" in p && p.popular ? "bg-white text-primary" : "gradient-primary text-white"}`}
              >
                {pending === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4" /> Payer {p.price.toLocaleString("fr-FR")} FCFA</>}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center text-xs text-muted-foreground">
          Paiement sécurisé via CinetPay. Wave · Orange Money · MTN · Moov · Visa/Mastercard.
        </div>
      </div>
    </AppShell>
  );
}