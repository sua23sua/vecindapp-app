import Stripe from "stripe";

const stripBom = (s: string) => s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s;
const e = (key: string) => stripBom(process.env[key] ?? "");

export const stripe = new Stripe(e("STRIPE_SECRET_KEY"));

export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    owners: 100,
    priceBase: 24.95,
    pricePlus: 44.95,
    priceIdBase: e("STRIPE_PRICE_STARTER_BASE"),
    priceIdPlus: e("STRIPE_PRICE_STARTER_PLUS"),
  },
  {
    id: "profesional",
    name: "Profesional",
    owners: 250,
    priceBase: 49.95,
    pricePlus: 69.95,
    priceIdBase: e("STRIPE_PRICE_PROFESIONAL_BASE"),
    priceIdPlus: e("STRIPE_PRICE_PROFESIONAL_PLUS"),
  },
  {
    id: "avanzado",
    name: "Avanzado",
    owners: 500,
    priceBase: 79.95,
    pricePlus: 99.95,
    priceIdBase: e("STRIPE_PRICE_AVANZADO_BASE"),
    priceIdPlus: e("STRIPE_PRICE_AVANZADO_PLUS"),
  },
  {
    id: "gestoria",
    name: "Gestoría",
    owners: 1000,
    priceBase: 129.95,
    pricePlus: 149.95,
    priceIdBase: e("STRIPE_PRICE_GESTORIA_BASE"),
    priceIdPlus: e("STRIPE_PRICE_GESTORIA_PLUS"),
  },
  {
    id: "corporativo",
    name: "Corporativo",
    owners: 2500,
    priceBase: 199.95,
    pricePlus: 229.95,
    priceIdBase: e("STRIPE_PRICE_CORPORATIVO_BASE"),
    priceIdPlus: e("STRIPE_PRICE_CORPORATIVO_PLUS"),
  },
] as const;

export type PlanId = (typeof PLANS)[number]["id"];
