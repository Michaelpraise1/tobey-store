/**
 * POST /api/create-merch-order
 *
 * Handles merch (print-on-demand) checkout.
 * Uses the separate MerchCartItem structure from the store which carries
 * Printify-specific fields (printifyVariantId, selectedSize, selectedColor, etc.)
 *
 * Flow:
 *  1. Validate request body
 *  2. Save a new `merchOrder` document in Sanity with status "pending"
 *  3. Look up printifyProductId for each merch item from Sanity
 *  4. Submit to Printify with the exact variant IDs from the cart
 *  5. Update the Sanity doc with Printify's order ID + status "sent_to_printify"
 *  6. Send customer confirmation email via Resend
 *
 * Printify is never mentioned to the customer.
 */

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { backendClient } from '@/sanity/lib/backendClient';
import { client } from '@/sanity/lib/client';
import {
  createPrintifyOrder,
  type PrintifyAddress,
  type PrintifyLineItem,
} from '@/lib/printify';

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Types ────────────────────────────────────────────────────────────────────

interface MerchCartItemPayload {
  product: {
    _id: string;
    title: string;
    basePrice: number;
    printifyProductId?: string;
  };
  quantity: number;
  printifyVariantId?: number;
  selectedSize?: string;
  selectedColor?: string;
  selectedDesign?: string;
}

interface CustomerPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateOrderId(): string {
  return `MERCH-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

/** Fetch the Printify product ID from Sanity if not already on the payload */
async function resolvePrintifyProductId(
  sanityId: string,
  incomingId?: string
): Promise<string | null> {
  if (incomingId) return incomingId;

  const result = await client.fetch<{ printifyProductId?: string } | null>(
    `*[_type == "merchProduct" && _id == $id][0]{ printifyProductId }`,
    { id: sanityId }
  );

  return result?.printifyProductId || null;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customer, userId } = body as {
      items: MerchCartItemPayload[];
      customer: CustomerPayload;
      userId?: string;
    };

    // ── 1. Validate ────────────────────────────────────────────────────────────
    if (!items || items.length === 0 || !customer) {
      return NextResponse.json({ error: 'Missing required order details.' }, { status: 400 });
    }
    if (!customer.email || !customer.firstName || !customer.address) {
      return NextResponse.json({ error: 'Incomplete customer information.' }, { status: 400 });
    }

    const orderId = generateOrderId();
    const totalAmount = items.reduce(
      (acc, item) => acc + (item.product.basePrice || 0) * item.quantity,
      0
    );

    // ── 2. Save to Sanity (status: pending) ────────────────────────────────────
    let sanityOrderDocId: string | null = null;

    if (process.env.SANITY_API_TOKEN) {
      try {
        const doc = await backendClient.create({
          _type: 'merchOrder',
          orderNumber: orderId,
          customerName: `${customer.firstName} ${customer.lastName}`,
          customerEmail: customer.email,
          clerkUserId: userId || 'guest',
          totalAmount,
          currency: 'usd',
          status: 'paid',
          fulfillmentStatus: 'pending_fulfillment',
          fulfillmentProvider: 'printify',
          shippingAddress: {
            name: `${customer.firstName} ${customer.lastName}`,
            address1: customer.address,
            city: customer.city,
            state: customer.state,
            zip: customer.zipCode,
            country: customer.country || 'US',
          },
          items: items.map((item, index) => ({
            _key: `item_${index}`,
            product: { _type: 'reference', _ref: item.product._id },
            designName: item.selectedDesign || null,
            color: item.selectedColor || null,
            size: item.selectedSize || null,
            quantity: item.quantity,
            priceAtPurchase: item.product.basePrice || 0,
            printifyVariantId: item.printifyVariantId || null,
          })),
        });
        sanityOrderDocId = doc._id;
        console.log(`[Sanity] Merch order ${orderId} saved (doc: ${doc._id})`);
      } catch (err) {
        console.error('[Sanity] Failed to save merch order:', err);
      }
    }

    // ── 3. Build Printify line items ───────────────────────────────────────────
    const shopId = process.env.PRINTIFY_SHOP_ID;
    const printifyApiKey = process.env.PRINTIFY_API_KEY;
    let printifyOrderId: string | null = null;

    if (!shopId || !printifyApiKey) {
      console.warn('[Printify] Credentials not set — skipping fulfillment submission.');
    } else {
      const lineItems: PrintifyLineItem[] = [];
      const skipped: string[] = [];

      for (const item of items) {
        const printifyProductId = await resolvePrintifyProductId(
          item.product._id,
          item.product.printifyProductId
        );

        if (!printifyProductId) {
          skipped.push(item.product.title);
          console.warn(`[Printify] No printifyProductId for "${item.product.title}" — skipped.`);
          continue;
        }

        if (!item.printifyVariantId) {
          skipped.push(item.product.title);
          console.warn(
            `[Printify] No printifyVariantId for "${item.product.title}" (size: ${item.selectedSize}, color: ${item.selectedColor}) — skipped.`
          );
          continue;
        }

        lineItems.push({
          product_id: printifyProductId,
          variant_id: item.printifyVariantId,
          quantity: item.quantity,
        });
      }

      if (skipped.length > 0) {
        console.warn(`[Printify] Skipped items (no Printify config): ${skipped.join(', ')}`);
      }

      // ── 4. Submit to Printify ──────────────────────────────────────────────
      if (lineItems.length > 0) {
        try {
          const shippingAddress: PrintifyAddress = {
            first_name: customer.firstName,
            last_name: customer.lastName,
            email: customer.email,
            phone: customer.phone || '',
            address1: customer.address,
            city: customer.city,
            state: customer.state,
            zip: customer.zipCode,
            country: customer.country || 'US',
          };

          const printifyResponse = await createPrintifyOrder(shopId, {
            external_id: orderId,
            label: `Tobey Merch — ${orderId}`,
            line_items: lineItems,
            shipping_method: 1,
            send_shipping_notification: false,
            address_to: shippingAddress,
          });

          printifyOrderId = printifyResponse.id;
          console.log(`[Printify] Merch order submitted. Printify ID: ${printifyOrderId}`);

          // ── 5. Update Sanity with Printify order ID ──────────────────────────
          if (sanityOrderDocId && process.env.SANITY_API_TOKEN) {
            try {
              await backendClient.patch(sanityOrderDocId).set({
                printifyOrderId,
                status: 'sent_to_fulfillment',
                fulfillmentStatus: 'sent_to_printify',
              }).commit();
            } catch (patchErr) {
              console.error('[Sanity] Failed to patch merch order with Printify ID:', patchErr);
            }
          }
        } catch (printifyErr: unknown) {
          const errMsg = printifyErr instanceof Error ? printifyErr.message : String(printifyErr);
          console.error('[Printify] Merch order submission failed:', errMsg);

          // Hold in pending state + alert admin
          if (sanityOrderDocId && process.env.SANITY_API_TOKEN) {
            try {
              await backendClient.patch(sanityOrderDocId).set({
                fulfillmentStatus: 'failed',
              }).commit();
            } catch (_) { /* best-effort */ }
          }

          if (process.env.RESEND_API_KEY) {
            try {
              await resend.emails.send({
                from: 'Tobey Store Alerts <onboarding@resend.dev>',
                to: 'hello@tobeystudios.com',
                subject: `⚠️ Printify MERCH fulfillment FAILED — ${orderId}`,
                html: `<p>Merch order <strong>${orderId}</strong> failed to submit to Printify.</p>
                       <p><strong>Error:</strong> ${errMsg}</p>
                       <p>Please review and manually re-submit in the Sanity dashboard.</p>`,
              });
            } catch (_) { /* non-critical */ }
          }
        }
      }
    }

    // ── 6. Send customer confirmation email ────────────────────────────────────
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'Original Tobey Studio <onboarding@resend.dev>',
          to: customer.email,
          subject: `Your Merch Order Confirmation #${orderId}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #111">Order Confirmed! 🎉</h1>
              <p>Hey ${customer.firstName},</p>
              <p>Your order <strong>#${orderId}</strong> has been received and is being prepared for you.</p>
              <h3>Order Summary</h3>
              <ul>
                ${items.map(item =>
                  `<li>${item.product.title} × ${item.quantity}${item.selectedSize ? ` (${item.selectedSize})` : ''}${item.selectedColor ? ` — ${item.selectedColor}` : ''} — $${((item.product.basePrice || 0) * item.quantity).toFixed(2)}</li>`
                ).join('')}
              </ul>
              <p><strong>Total: $${totalAmount.toFixed(2)}</strong></p>
              <p>We'll send another email with tracking information once your order ships.</p>
              <p>— The Tobey Studios Team</p>
            </div>
          `,
        });
        console.log(`[Email] Merch confirmation sent to ${customer.email}`);
      } catch (emailErr) {
        console.error('[Email] Failed to send merch confirmation:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order placed successfully. You will receive a confirmation email shortly.',
    });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[create-merch-order] Unhandled error:', error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
