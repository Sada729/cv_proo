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
    const apikey = process.env.CINETPAY_API_KEY;
    const site_id = process.env.CINETPAY_SITE_ID;

    // Create a pending payment record either way (audit trail)
    const transactionId = `RA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const { supabase, userId } = context;
    const { error: insErr } = await supabase.from("payments").insert({
      user_id: userId,
      amount: plan.amount,
      currency: "XOF",
      plan: data.plan,
      provider: "cinetpay",
      transaction_id: transactionId,
      status: "pending",
      metadata: { plan_name: plan.name, credits: plan.credits },
    });
    if (insErr) return { error: insErr.message };

    if (!apikey || !site_id) {
      return {
        error:
          "Le paiement CinetPay n'est pas encore configuré. Ajoutez les clés CINETPAY_API_KEY, CINETPAY_SITE_ID et CINETPAY_SECRET_KEY pour activer Wave / Orange Money.",
      };
    }

    const origin = process.env.APP_URL ?? "https://project--8fed15b7-ef69-41e4-9a6c-c11d3cad326b.lovable.app";

    const payload = {
      apikey,
      site_id,
      transaction_id: transactionId,
      amount: plan.amount,
      currency: "XOF",
      description: `ResumAI — plan ${plan.name}`,
      customer_id: userId,
      channels: "ALL",
      return_url: `${origin}/checkout/${transactionId}`,
      notify_url: `${origin}/api/public/cinetpay-webhook`,
    };

    const res = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as { code: string; message: string; data?: { payment_url: string } };
    if (json.code !== "201" || !json.data?.payment_url) {
      return { error: `CinetPay: ${json.message}` };
    }
    return { checkoutUrl: json.data.payment_url };
  });