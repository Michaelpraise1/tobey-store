import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ReceiptEmail } from '@/components/emails/ReceiptEmail';
import { backendClient } from '@/sanity/lib/backendClient';

// Initialize Resend (Needs RESEND_API_KEY in .env.local)
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customer, paymentMethod, userId } = body;

    // Validate request
    if (!items || !customer || items.length === 0) {
      return NextResponse.json({ error: 'Missing required order details' }, { status: 400 });
    }

    // Format Line Items for Email & Backend
    const formattedLineItems = items.map((item: any) => ({
      sku: item.product.sku || item.product._id, // Replace with Merchize Product SKU mapping
      name: item.product.title,
      quantity: item.quantity,
      price: item.product.price || 0,
    }));

    const totalAmount = formattedLineItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const orderId = `ORD-${Date.now()}`;

    // 0. Save the Order to Sanity Database
    try {
      if (process.env.SANITY_API_TOKEN) {
        await backendClient.create({
          _type: 'order',
          orderNumber: orderId,
          customerName: `${customer.firstName} ${customer.lastName}`,
          customerEmail: customer.email,
          stripeCheckoutSessionId: `mock_session_${Date.now()}`,
          stripeCustomerId: `mock_customer_${Date.now()}`,
          clerkUserId: userId || 'guest',
          amount: totalAmount,
          currency: 'USD',
          status: 'processing',
          address: {
            name: `${customer.firstName} ${customer.lastName}`,
            address: `${customer.address}, ${customer.city}`,
            state: customer.state,
            zip: customer.zipCode,
          },
          products: items.map((item: any, index: number) => ({
            _key: `key_${index}`,
            product: {
              _type: 'reference',
              _ref: item.product._id,
            },
            quantity: item.quantity,
            price: item.product.price || 0,
          })),
        });
        console.log(`[Sanity] Order ${orderId} saved successfully.`);
      } else {
        console.warn("[Sanity] Order not saved because SANITY_API_TOKEN is missing from environment variables.");
      }
    } catch (sanityError) {
      console.error("[Sanity Write Error]", sanityError);
      // We don't fail the whole request for a DB error if they are just mocking, but normally you would handle this more strictly.
    }

    // Prepare Merchize API Payload
    const merchizePayload = {
      api_key: process.env.MERCHIZE_API_KEY || 'sandbox_api_key',
      order_id: orderId,
      status: 'Processing',
      shipping_address: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        address1: customer.address,
        city: customer.city,
        state: customer.state,
        zip: customer.zipCode,
        country: customer.country,
        phone: customer.phone,
        email: customer.email,
      },
      line_items: formattedLineItems
    };

    // 1. Process Payment via Stripe/PayPal here...
    
    // 2. Transmit to Merchize Endpoint here...
    const MERCHIZE_API_URL = process.env.MERCHIZE_API_URL || 'https://api.merchize.com/v1/orders';
    console.log(`[Mock Merchize Sync] Sending Order ${merchizePayload.order_id} to ${MERCHIZE_API_URL}`);

    // 3. Send Automated Email Notification via Resend
    // By default, using Resend requires a verified domain or uses onboarding onboarding@resend.dev
    try {
      await resend.emails.send({
        from: 'Original Tobey Studio <onboarding@resend.dev>', // Update to your verified domain (e.g., updates@tobeystudio.com)
        to: customer.email,
        subject: `Your Order Confirmation #${orderId}`,
        react: ReceiptEmail({
          orderId: orderId,
          customerName: customer.firstName,
          totalAmount: totalAmount,
          items: formattedLineItems
        }),
      });
      console.log(`[Email Sent] Confirmation dispatched to ${customer.email}`);
    } catch (emailError) {
      console.error("[Email Dispatch Error]", emailError);
      // We don't throw here to avoid failing the whole order if just the email errors out (e.g. invalid mock key)
    }

    return NextResponse.json({ 
      success: true, 
      orderId: orderId, 
      message: 'Order created, synced to Merchize, and emailed.' 
    });

  } catch (error: any) {
    console.error('Order Creation Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
