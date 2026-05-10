import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const plans = [
  { id: "starter",     name: "Starter",     owners: 50,   priceBase: 1900, pricePlus: 2900 },
  { id: "profesional", name: "Profesional", owners: 150,  priceBase: 3900, pricePlus: 5900 },
  { id: "avanzado",    name: "Avanzado",    owners: 300,  priceBase: 6900, pricePlus: 9900 },
  { id: "gestoria",    name: "Gestoría",    owners: 600,  priceBase: 11900, pricePlus: 16900 },
  { id: "corporativo", name: "Corporativo", owners: 1500, priceBase: 19900, pricePlus: 27900 },
];

const envLines = [];

for (const plan of plans) {
  const product = await stripe.products.create({
    name: `VecindApp ${plan.name}`,
    description: `Hasta ${plan.owners} propietarios`,
    metadata: { plan_id: plan.id },
  });

  const priceBase = await stripe.prices.create({
    product: product.id,
    unit_amount: plan.priceBase,
    currency: "eur",
    recurring: { interval: "month" },
    nickname: `${plan.name} Base`,
    metadata: { plan_id: plan.id, tier: "base" },
  });

  const pricePlus = await stripe.prices.create({
    product: product.id,
    unit_amount: plan.pricePlus,
    currency: "eur",
    recurring: { interval: "month" },
    nickname: `${plan.name} Plus`,
    metadata: { plan_id: plan.id, tier: "plus" },
  });

  const key = plan.id.toUpperCase().replace("Í", "I").replace("Ó", "O");
  envLines.push(`STRIPE_PRICE_${key}_BASE=${priceBase.id}`);
  envLines.push(`STRIPE_PRICE_${key}_PLUS=${pricePlus.id}`);

  console.log(`✓ ${plan.name}: base=${priceBase.id}  plus=${pricePlus.id}`);
}

console.log("\n--- Copia estas líneas en .env.local ---\n");
console.log(envLines.join("\n"));
