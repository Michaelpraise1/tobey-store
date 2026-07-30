import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderID } = body as { orderID: string };

    if (!orderID) {
      return NextResponse.json({ error: 'PayPal Order ID is required' }, { status: 400 });
    }

    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;

    // If client secret is provided, capture order via PayPal REST API
    if (paypalClientSecret && paypalClientId && paypalClientId !== 'test' && paypalClientId !== 'sb') {
      const auth = Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64');
      const environment = process.env.NODE_ENV === 'production' ? 'api-m.paypal.com' : 'api-m.sandbox.paypal.com';

      const response = await fetch(`https://${environment}/v2/checkout/orders/${orderID}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to capture PayPal payment');
      }

      return NextResponse.json({
        status: data.status,
        payer: data.payer,
        transactionId: data.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderID,
      });
    }

    // Default Sandbox fallback status
    return NextResponse.json({
      status: 'COMPLETED',
      transactionId: orderID,
    });
  } catch (error: any) {
    console.error('[paypal/capture-order] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to capture PayPal payment' },
      { status: 500 }
    );
  }
}
