/**
 * POST /api/webhooks/printify
 *
 * Receives Printify fulfillment events and updates the corresponding
 * Sanity order document with fulfillment status and tracking info.
 *
 * Supported events:
 *  - order:shipment:created          → status: "shipped", saves tracking info
 *  - order:shipment:delivered        → status: "delivered"
 *  - print_provider:order:sent-to-production → status: "in_production"
 *
 * Verification:
 *  Printify sends an X-Pfy-Signature header. We validate it against
 *  PRINTIFY_WEBHOOK_SECRET to ensure the request is genuine.
 *
 * IMPORTANT: This endpoint must return 200 quickly — Printify will retry
 * failed deliveries. We do all DB work synchronously before responding.
 *
 * Setup: Register this webhook URL in your Printify dashboard under
 *  Settings → Webhooks → Add endpoint:
 *  https://your-domain.com/api/webhooks/printify
 */

import { NextResponse } from 'next/server';
import { backendClient } from '@/sanity/lib/backendClient';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PrintifyShipment {
  carrier: string;
  number: string;
  url: string;
  delivered_at: string | null;
}

interface PrintifyWebhookPayload {
  type: string;
  resource: {
    id: string;   // Printify order ID
    type: string;
    data?: {
      shipments?: PrintifyShipment[];
      shipment?: PrintifyShipment;
      status?: string;
    };
  };
}

// ─── Signature Verification ───────────────────────────────────────────────────

/**
 * Printify signs webhooks with HMAC-SHA256 using your webhook secret.
 * The signature is in the X-Pfy-Signature header.
 *
 * NOTE: As of the current Printify API docs, they use a simple secret
 * token approach. If Printify updates their signing method, update here.
 * For now we verify against the raw secret string.
 */
async function verifySignature(request: Request, body: string): Promise<boolean> {
  const secret = process.env.PRINTIFY_WEBHOOK_SECRET;
  if (!secret) {
    // If no secret is set, skip verification (dev mode only)
    console.warn('[Printify Webhook] PRINTIFY_WEBHOOK_SECRET not set — skipping signature check.');
    return true;
  }

  const signature = request.headers.get('x-pfy-signature');
  if (!signature) {
    console.warn('[Printify Webhook] Missing X-Pfy-Signature header.');
    return false;
  }

  // HMAC-SHA256 verification using Web Crypto API (available in Edge + Node)
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(body);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const expectedSignature = Buffer.from(signatureBuffer).toString('hex');

  // Constant-time comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) return false;

  let mismatch = 0;
  for (let i = 0; i < signature.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  return mismatch === 0;
}

// ─── Sanity query to find order by Printify ID ────────────────────────────────

async function findSanityOrderByPrintifyId(printifyOrderId: string) {
  // Search in both order and merchOrder documents
  const query = `*[
    (_type == "order" || _type == "merchOrder") &&
    printifyOrderId == $printifyOrderId
  ][0]{ _id, _type }`;

  return backendClient.fetch(query, { printifyOrderId });
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  // Read body as text first (needed for signature verification)
  const rawBody = await request.text();

  // ── Verify signature ───────────────────────────────────────────────────────
  const isValid = await verifySignature(request, rawBody);
  if (!isValid) {
    console.error('[Printify Webhook] Invalid signature — rejecting request.');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // ── Parse payload ──────────────────────────────────────────────────────────
  let payload: PrintifyWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { type, resource } = payload;
  const printifyOrderId = resource?.id;

  console.log(`[Printify Webhook] Event: ${type} | Printify Order ID: ${printifyOrderId}`);

  if (!printifyOrderId) {
    return NextResponse.json({ error: 'Missing resource.id' }, { status: 400 });
  }

  // ── Find the Sanity order ──────────────────────────────────────────────────
  if (!process.env.SANITY_API_TOKEN) {
    console.warn('[Printify Webhook] SANITY_API_TOKEN not set — cannot update order.');
    return NextResponse.json({ received: true });
  }

  const sanityOrder = await findSanityOrderByPrintifyId(printifyOrderId);

  if (!sanityOrder) {
    // This can happen if the order was placed before the webhook was set up,
    // or if it's a test event. Log and return 200 to prevent Printify retries.
    console.warn(
      `[Printify Webhook] No Sanity order found for Printify ID: ${printifyOrderId}. Ignoring.`
    );
    return NextResponse.json({ received: true });
  }

  // ── Handle event types ─────────────────────────────────────────────────────
  try {
    switch (type) {

      case 'order:shipment:created': {
        const shipments = resource.data?.shipments || (resource.data?.shipment ? [resource.data.shipment] : []);
        const shipment = shipments[0];

        const patch = backendClient.patch(sanityOrder._id).set({
          fulfillmentStatus: 'shipped',
          status: 'shipped',
          ...(shipment?.number && { trackingNumber: shipment.number }),
          ...(shipment?.url && { trackingUrl: shipment.url }),
        });

        await patch.commit();
        console.log(
          `[Printify Webhook] Order ${sanityOrder._id} marked as SHIPPED.` +
          (shipment?.number ? ` Tracking: ${shipment.number}` : '')
        );
        break;
      }

      case 'order:shipment:delivered': {
        await backendClient.patch(sanityOrder._id).set({
          fulfillmentStatus: 'delivered',
          status: 'delivered',
        }).commit();
        console.log(`[Printify Webhook] Order ${sanityOrder._id} marked as DELIVERED.`);
        break;
      }

      case 'print_provider:order:sent-to-production': {
        await backendClient.patch(sanityOrder._id).set({
          fulfillmentStatus: 'in_production',
        }).commit();
        console.log(`[Printify Webhook] Order ${sanityOrder._id} marked as IN PRODUCTION.`);
        break;
      }

      default:
        // Log unrecognized events but don't error — Printify may send new event types
        console.log(`[Printify Webhook] Unhandled event type: "${type}". No action taken.`);
        break;
    }
  } catch (updateErr) {
    console.error('[Printify Webhook] Failed to update Sanity order:', updateErr);
    // Still return 200 — we don't want Printify to flood us with retries
    // The admin can manually fix the order status in Sanity Studio
  }

  // Always return 200 to Printify
  return NextResponse.json({ received: true });
}
