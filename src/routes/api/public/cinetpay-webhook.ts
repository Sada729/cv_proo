import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/cinetpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.CINETPAY_SECRET_KEY;
        const apikey = process.env.CINETPAY_API_KEY;
        const site_id = process.env.CINETPAY_SITE_ID;
        if (!secret || !apikey || !site_id) return new Response("Payment not configured", { status: 503 });

        const form = await request.formData();
        const transaction_id = form.get("cpm_trans_id")?.toString();
        if (!transaction_id) return new Response("Missing tx", { status: 400 });

        // Verify by calling CinetPay check endpoint (server-to-server, no signature to compute)
        const verify = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apikey, site_id, transaction_id }),
        });
        const j = (await verify.json()) as { code: string; data?: { status: string; amount: string } };
        if (j.code !== "00") return new Response("Unverified", { status: 400 });
        const status = j.data?.status === "ACCEPTED" ? "paid" : "failed";

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: payment } = await supabaseAdmin
          .from("payments")
          .update({ status })
          .eq("transaction_id", transaction_id)
          .select()
          .maybeSingle();

        if (status === "paid" && payment) {
          const credits = (payment.metadata as { credits?: number } | null)?.credits ?? 1;
          // Increment user credits
          const { data: prof } = await supabaseAdmin.from("profiles").select("credits, plan").eq("id", payment.user_id).single();
          await supabaseAdmin
            .from("profiles")
            .update({ credits: (prof?.credits ?? 0) + credits, plan: payment.plan })
            .eq("id", payment.user_id);
        }

        return new Response("ok");
      },
    },
  },
});