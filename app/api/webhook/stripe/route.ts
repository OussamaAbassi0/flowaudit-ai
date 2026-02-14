import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

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

  // فاش الكليان كيخلص لأول مرة
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // هنا فين فرضنا على TypeScript تعرفها بلي ديال Stripe
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    ) as Stripe.Subscription; 

    if (!session?.metadata?.userId) {
      return new NextResponse("User id is required", { status: 400 });
    }

    await db.user.update({
      where: {
        id: session.metadata.userId,
      },
      data: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
    });
  }

  // فاش كيخلص التجديد ديال الشهر لي موراه
  if (event.type === "invoice.payment_succeeded") {
    // التجديد كيكون Invoice ماشي Session
    const invoice = event.data.object as Stripe.Invoice; 
    
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    ) as Stripe.Subscription;

    await db.user.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
    });
  }

  return new NextResponse(null, { status: 200 });
}