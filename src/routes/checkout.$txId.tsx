import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Clock, XCircle, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { simulatePayment } from "@/lib/payments.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout/$txId")({
  component: CheckoutReturn,
});

type Method = "wave" | "orange" | "mtn" | "card";
const METHODS: { id: Method; name: string; color: string; textColor: string; hint: string }[] = [
  { id: "wave", name: "Wave", color: "bg-[#1DC8FF]", textColor: "text-white", hint: "Payez sans frais avec Wave" },
  { id: "orange", name: "Orange Money", color: "bg-[#FF7900]", textColor: "text-white", hint: "OM Sénégal / Côte d'Ivoire / Mali" },
  { id: "mtn", name: "MTN Money", color: "bg-[#FFCC00]", textColor: "text-slate-900", hint: "MTN Mobile Money" },
  { id: "card", name: "Carte bancaire", color: "bg-slate-900", textColor: "text-white", hint: "Visa / Mastercard" },
];

function CheckoutReturn() {
  const { txId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [method, setMethod] = useState<Method | null>(null);
  const [phone, setPhone] = useState("");
  const [processing, setProcessing] = useState(false);

  const q = useQuery({
    queryKey: ["payment", txId],
    queryFn: async () => {
      const { data } = await supabase.from("payments").select("*").eq("transaction_id", txId).maybeSingle();
      return data;
    },
  });

  async function confirm(outcome: "success" | "fail") {
    if (!method) { toast.error("Choisissez une méthode de paiement"); return; }
    if (method !== "card" && phone.length < 8) { toast.error("Saisissez votre numéro de téléphone"); return; }
    setProcessing(true);
    // Simulate provider processing delay
    await new Promise(r => setTimeout(r, 2000));
    const res = await simulatePayment({ data: { transactionId: txId, outcome, method, phone } });
    setProcessing(false);
    if (!res.ok) { toast.error(res.error ?? "Erreur"); return; }
    qc.invalidateQueries({ queryKey: ["payment", txId] });
    qc.invalidateQueries({ queryKey: ["profile"] });
    if (outcome === "success") toast.success("Paiement confirmé !");
  }

  if (q.isLoading) {
    return <main className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></main>;
  }
  if (!q.data) {
    return <main className="min-h-screen grid place-items-center"><div className="text-center"><h1 className="text-xl font-bold">Transaction introuvable</h1><Link to="/dashboard" className="text-primary underline mt-2 inline-block">Retour au dashboard</Link></div></main>;
  }

  const status = q.data?.status ?? "pending";
  const amount = q.data?.amount ?? 0;
  const planName = (q.data?.metadata as { plan_name?: string } | null)?.plan_name ?? q.data?.plan;

  // Finalized state
  if (status !== "pending") {
    const Icon = status === "paid" ? CheckCircle2 : XCircle;
    const color = status === "paid" ? "text-green-600" : "text-destructive";
    const text = status === "paid" ? "Paiement confirmé !" : "Paiement échoué";
    return (
      <main className="min-h-screen grid place-items-center bg-background p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md text-center rounded-3xl bg-card border p-10 shadow-elegant">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}>
            <Icon className={`h-20 w-20 mx-auto ${color}`} />
          </motion.div>
          <h1 className="mt-4 text-2xl font-bold">{text}</h1>
          {status === "paid" && (
            <p className="mt-2 text-muted-foreground text-sm">Vos crédits ont été ajoutés à votre compte. Vous pouvez maintenant télécharger votre CV.</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">Transaction : {txId}</p>
          <div className="mt-8 flex flex-col gap-2">
            <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-xl gradient-primary text-white font-semibold px-5 py-3">
              Retour au dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            {status === "failed" && (
              <button onClick={() => navigate({ to: "/pricing" })} className="text-sm text-muted-foreground hover:text-foreground">Réessayer avec un autre plan</button>
            )}
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-muted/30 to-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6">
          <ShieldCheck className="h-3.5 w-3.5" /> Paiement sécurisé — mode simulation
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-card border shadow-elegant overflow-hidden">
          <div className="gradient-hero text-white p-6 flex items-center justify-between">
            <div>
              <div className="text-white/70 text-xs uppercase tracking-widest">Montant à payer</div>
              <div className="mt-1 text-3xl font-black">{amount.toLocaleString("fr-FR")} <span className="text-lg font-semibold text-white/80">FCFA</span></div>
              <div className="mt-1 text-sm text-white/80">Plan {planName}</div>
            </div>
            <div className="text-right text-xs text-white/70">ResumAI<br />TX: {txId.slice(-8)}</div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="text-sm font-semibold">Méthode de paiement</label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {METHODS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    disabled={processing}
                    className={`rounded-2xl p-4 border-2 text-left transition-all ${method === m.id ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"}`}
                  >
                    <div className={`inline-flex items-center justify-center h-9 px-3 rounded-lg font-bold text-sm ${m.color} ${m.textColor}`}>{m.name}</div>
                    <div className="mt-2 text-xs text-muted-foreground">{m.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {method && method !== "card" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <label className="text-sm font-semibold">Numéro {METHODS.find(m => m.id === method)?.name}</label>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/[^0-9+]/g, ""))}
                    placeholder="+221 77 000 00 00"
                    className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                    disabled={processing}
                  />
                  <div className="mt-2 text-xs text-muted-foreground">Vous recevrez une notification pour confirmer le paiement.</div>
                </motion.div>
              )}
              {method === "card" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold">Numéro de carte</label>
                    <input placeholder="4242 4242 4242 4242" disabled={processing} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="MM/AA" disabled={processing} className="rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
                    <input placeholder="CVC" disabled={processing} className="rounded-xl border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => confirm("success")}
                disabled={processing || !method}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl gradient-primary text-white font-semibold px-4 py-4 shadow-elegant hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Traitement…</> : <>Payer {amount.toLocaleString("fr-FR")} FCFA</>}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => confirm("fail")}
                  disabled={processing || !method}
                  className="flex-1 text-xs text-muted-foreground hover:text-destructive py-2 transition-colors disabled:opacity-50"
                >
                  Simuler un échec
                </button>
                <Link to="/pricing" className="flex-1 text-xs text-muted-foreground hover:text-foreground py-2 text-center">Annuler</Link>
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3">
              <b>Mode simulation :</b> aucun débit réel. Cliquez « Payer » pour créditer votre compte, ou « Simuler un échec » pour tester le cas d'erreur.
            </div>
          </div>
        </motion.div>

        <div className="mt-4 text-center text-[10px] text-muted-foreground">
          Wave · Orange Money · MTN Money · Moov · Visa · Mastercard
        </div>
      </div>
    </main>
  );
}