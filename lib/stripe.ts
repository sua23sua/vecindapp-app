import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    owners: 50,
    priceBase: 19,
    pricePlus: 29,
    priceIdBase: process.env.STRIPE_PRICE_STARTER_BASE!,
    priceIdPlus: process.env.STRIPE_PRICE_STARTER_PLUS!,
  },
  {
    id: "profesional",
    name: "Profesional",
    owners: 150,
    priceBase: 39,
    pricePlus: 59,
    priceIdBase: process.env.STRIPE_PRICE_PROFESIONAL_BASE!,
    priceIdPlus: process.env.STRIPE_PRICE_PROFESIONAL_PLUS!,
  },
  {
    id: "avanzado",
    name: "Avanzado",
    owners: 300,
    priceBase: 69,
    pricePlus: 99,
    priceIdBase: process.env.STRIPE_PRICE_AVANZADO_BASE!,
    priceIdPlus: process.env.STRIPE_PRICE_AVANZADO_PLUS!,
  },
  {
    id: "gestoria",
    name: "Gestoría",
    owners: 600,
    priceBase: 119,
    pricePlus: 169,
    priceIdBase: process.env.STRIPE_PRICE_GESTORIA_BASE!,
    priceIdPlus: process.env.STRIPE_PRICE_GESTORIA_PLUS!,
  },
  {
    id: "corporativo",
    name: "Corporativo",
    owners: 1500,
    priceBase: 199,
    pricePlus: 279,
    priceIdBase: process.env.STRIPE_PRICE_CORPORATIVO_BASE!,
    priceIdPlus: process.env.STRIPE_PRICE_CORPORATIVO_PLUS!,
  },
] as const;

export type PlanId = (typeof PLANS)[number]["id"];
