import { NextResponse } from 'next/server';

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

    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;

    // If client secret is provided, create order directly via PayPal REST API
    if (paypalClientSecret && paypalClientId && paypalClientId !== 'test' && paypalClientId !== 'sb') {
      const auth = Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64');
      const environment = process.env.NODE_ENV === 'production' ? 'api-m.paypal.com' : 'api-m.sandbox.paypal.com';

      const response = await fetch(`https://${environment}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'USD',
                value: totalAmount.toFixed(2),
              },
              description: 'Tobey Store Purchase',
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create PayPal order');
      }

      return NextResponse.json({ orderID: data.id, amount: totalAmount.toFixed(2) });
    }

    // Default / Sandbox client-side creation response
    return NextResponse.json({
      amount: totalAmount.toFixed(2),
      currency: 'USD',
    });
  } catch (error: any) {
    console.error('[paypal/create-order] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize PayPal transaction' },
      { status: 500 }
    );
  }
}
