// app/api/stripe/portal/route.ts
// Opens the Stripe Customer Portal for Pro users to manage
// their subscription — cancel, update card, view invoices.

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return new NextResponse("No Stripe customer found", { status: 404 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      locale: "en",
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("STRIPE_PORTAL_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
