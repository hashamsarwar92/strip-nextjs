import Stripe from "stripe";

import { stripe } from "@/lib/stripe/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
    console.log("Received Stripe webhook request");
  const signature = req.headers.get("stripe-signature");
  const webhookSecret =
  process.env.STRIPE_WEBHOOK_SECRET ?? process.env.STRIPE_SIGNING_SECRET;

  if (!signature) {
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  if (!webhookSecret) {
    return Response.json({ error: "Missing Stripe webhook secret" }, { status: 500 });
  }

  console.log("Verifying Stripe webhook signature");
  const rawBody = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid webhook signature";
    console.error("Stripe webhook signature verification failed:", message);

    console.log("Raw body:", rawBody);
    console.log("Signature:", signature);
    console.log("Webhook secret:", webhookSecret);

    return Response.json({ error: message }, { status: 400 });
  }

  console.log("Stripe webhook signature verified successfully");
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Stripe payment succeeded:", {
        eventType: event.type,
        sessionId: session.id,
        paymentStatus: session.payment_status,
        customerEmail: session.customer_details?.email ?? null,
        subscriptionId: session.subscription ?? null,
      });
      break;
    }
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Stripe async payment succeeded:", {
        eventType: event.type,
        sessionId: session.id,
        paymentStatus: session.payment_status,
      });
      break;
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Stripe async payment failed:", {
        eventType: event.type,
        sessionId: session.id,
        paymentStatus: session.payment_status,
      });
      break;
    }
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("Stripe payment intent succeeded:", {
        eventType: event.type,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      });
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("Stripe payment intent failed:", {
        eventType: event.type,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      });
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("Stripe invoice paid:", {
        eventType: event.type,
        invoiceId: invoice.id,
        customerId: invoice.customer ?? null,
        billingReason: invoice.billing_reason,
        amountPaid: invoice.amount_paid,
        currency: invoice.currency,
      });
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("Stripe invoice payment failed:", {
        eventType: event.type,
        invoiceId: invoice.id,
        customerId: invoice.customer ?? null,
        billingReason: invoice.billing_reason,
        amountDue: invoice.amount_due,
        currency: invoice.currency,
      });
      break;
    }
    default:
      console.log("Stripe webhook received:", event.type);
  }

  return Response.json({ received: true });
}