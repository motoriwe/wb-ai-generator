import { stripe } from "@/lib/stripe";

export async function POST(req) {
  try {
    const { userId, userEmail } = await req.json();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      client_reference_id: userId, // связываем сессию Stripe с юзером в нашей БД
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?canceled=true`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return Response.json({ error: "Не удалось создать сессию оплаты" }, { status: 500 });
  }
}
