import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/checkout/$txId")({
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { txId } = Route.useParams();
  const q = useQuery({
    queryKey: ["payment", txId],
    queryFn: async () => {
      const { data } = await supabase.from("payments").select("*").eq("transaction_id", txId).maybeSingle();
      return data;
    },
    refetchInterval: (query) => (query.state.data?.status === "pending" ? 3000 : false),
  });

  const status = q.data?.status ?? "pending";
  const Icon = status === "paid" ? CheckCircle2 : status === "failed" ? XCircle : Clock;
  const color = status === "paid" ? "text-green-600" : status === "failed" ? "text-destructive" : "text-primary";
  const text = status === "paid" ? "Paiement confirmé !" : status === "failed" ? "Paiement échoué" : "Paiement en cours…";

  return (
    <main className="min-h-screen grid place-items-center bg-background p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md text-center rounded-3xl bg-card border p-10 shadow-elegant">
        <Icon className={`h-16 w-16 mx-auto ${color}`} />
        <h1 className="mt-4 text-2xl font-bold">{text}</h1>
        <p className="mt-2 text-muted-foreground text-sm">Transaction : {txId}</p>
        <Link to="/dashboard" className="mt-8 inline-flex items-center gap-2 rounded-xl gradient-primary text-white font-semibold px-5 py-3">
          Retour au dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </main>
  );
}