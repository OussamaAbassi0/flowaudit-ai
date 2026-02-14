import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

// Helper — current_period_end moved to subscription item in Stripe API 2026-01-28.clover
function getPeriodEnd(subscription: Stripe.Subscription): Date {
  const periodEnd =
    (subscription as any).current_period_end ??
    subscription.items?.data?.[0]?.current_period_end;
  if (!periodEnd) throw new Error("Could not determine subscription period end");
  return new Date(periodEnd * 1000);
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error("Webhook Error:", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // First-time checkout completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    ) as Stripe.Subscription;

    if (!session?.metadata?.userId) {
      return new NextResponse("User id is required", { status: 400 });
    }

    await db.user.update({
      where: { id: session.metadata.userId },
      data: {
        stripeSubscriptionId:   subscription.id,
        stripeCustomerId:       subscription.customer as string,
        stripePriceId:          subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: getPeriodEnd(subscription),
      },
    });
  }

  // Monthly renewal
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;

    const subscriptionId =
      (invoice as any).subscription ??
      (invoice.parent as any)?.subscription_details?.subscription_id ??
      (invoice.parent as any)?.id;

    if (!subscriptionId) {
      return new NextResponse("No subscription found on invoice", { status: 400 });
    }

    const subscription = await stripe.subscriptions.retrieve(
      subscriptionId as string
    ) as Stripe.Subscription;

    await db.user.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        stripePriceId:          subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: getPeriodEnd(subscription),
      },
    });
  }

  return new NextResponse(null, { status: 200 });
}
