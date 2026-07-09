import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const PLANS: Record<string, { amount: number; credits: number; name: string }> = {
  starter: { amount: 1000, credits: 1, name: "Starter" },
  pro: { amount: 2000, credits: 5, name: "Pro" },
  premium: { amount: 5000, credits: 999, name: "Premium" },
};

export const initiatePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ plan: z.enum(["starter", "pro", "premium"]) }).parse(raw))
  .handler(async ({ data, context }): Promise<{ checkoutUrl?: string; error?: string }> => {
    const plan = PLANS[data.plan];
    const transactionId = `RA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const { supabase, userId } = context;

    // Record pending payment (audit)
    const { error: insErr } = await supabase.from("payments").insert({
      user_id: userId,
      amount: plan.amount,
      currency: "XOF",
      plan: data.plan,
      provider: "simulation",
      transaction_id: transactionId,
      status: "pending",
      metadata: { plan_name: plan.name, credits: plan.credits, simulated: true },
    });
    if (insErr) return { error: insErr.message };

    // Redirect to the simulated checkout page — user confirms there
    return { checkoutUrl: `/checkout/${transactionId}` };
  });

export const simulatePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({
    transactionId: z.string(),
    outcome: z.enum(["success", "fail"]),
    method: z.enum(["wave", "orange", "mtn", "card"]),
    phone: z.string().optional(),
  }).parse(raw))
  .handler(async ({ data, context }): Promise<{ ok: boolean; error?: string }> => {
    const { supabase, userId } = context;

    const { data: payment, error: fetchErr } = await supabase
      .from("payments").select("*").eq("transaction_id", data.transactionId).eq("user_id", userId).maybeSingle();
    if (fetchErr || !payment) return { ok: false, error: "Transaction introuvable" };
    if (payment.status !== "pending") return { ok: false, error: "Transaction déjà traitée" };

    const newStatus = data.outcome === "success" ? "paid" : "failed";
    const meta = (payment.metadata as Record<string, unknown> | null) ?? {};
    const { error: upErr } = await supabase.from("payments")
      .update({
        status: newStatus,
        metadata: { ...meta, method: data.method, phone: data.phone ?? null },
      })
      .eq("transaction_id", data.transactionId);
    if (upErr) return { ok: false, error: upErr.message };

    if (newStatus === "paid") {
      const creditsToAdd = (meta.credits as number | undefined) ?? 1;
      const { data: prof } = await supabase.from("profiles").select("credits").eq("id", userId).single();
      await supabase.from("profiles")
        .update({ credits: (prof?.credits ?? 0) + creditsToAdd, plan: payment.plan })
        .eq("id", userId);
    }

    return { ok: true };
  });