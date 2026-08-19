import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

interface CartItemPayload {
  product: {
    _id: string;
    title?: string;
    price?: number;
  };
  quantity: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body as { items: CartItemPayload[] };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const totalAmount = items.reduce(
      (acc, item) => acc + (item.product.price || 0) * item.quantity,
      0
    );

    // Stripe amounts are in cents
    const amountInCents = Math.round(totalAmount * 100);

    if (amountInCents < 50) {
      return NextResponse.json(
        { error: 'Order total is below the minimum charge amount ($0.50).' },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        product_count: items.length.toString(),
        product_ids: items.map((i) => i.product._id).join(','),
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('[stripe/create-payment-intent] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
