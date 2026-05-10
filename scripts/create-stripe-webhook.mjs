import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const webhook = await stripe.webhookEndpoints.create({
  url: "https://vecindapp-bo7j2v8dp-sua23suas-projects.vercel.app/api/stripe/webhook",
  enabled_events: [
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.payment_failed",
  ],
  description: "VecindApp production webhook",
});

console.log("Webhook creado:", webhook.id);
console.log("\nSTRIPE_WEBHOOK_SECRET=" + webhook.secret);
