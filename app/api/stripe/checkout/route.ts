import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "../../../../lib/db"; 
import { stripe } from "../../../../lib/stripe"; // ها حنا استعملناه، دابا غيولي لونو عادي!

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // كنجيبو المعلومات ديال الكليان من قاعدة البيانات ديالنا
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    // كنصاوبو ليه جلسة ديال الدفع فـ Stripe
    const session = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.email, // باش يطلع الإيميل ديالو واجد فصفحة الدفع
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID, // داك الكود لي جبتي قبيلة
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id, // هادي مهمة بزاف باش ملي يخلص نعرفو شكون هو
      },
    });

    // كنرجعو الرابط ديال الدفع للفرونتاند
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("STRIPE_CHECKOUT_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}