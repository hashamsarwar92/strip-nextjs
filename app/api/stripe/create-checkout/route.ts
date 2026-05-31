import { stripe } from "@/lib/stripe/stripe";

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json();
    const appOrigin = new URL(req.url).origin;

    if (!priceId) {
      return Response.json(
        { error: "Missing priceId" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appOrigin}/success`,
      cancel_url: `${appOrigin}/cancel`,
    });

    return Response.json({ url: session.url });
  } catch (error: unknown) {
    console.error(error);

    const message = error instanceof Error ? error.message : "Failed to create Stripe Checkout session";

    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}