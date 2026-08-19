/**
 * POST /api/create-order
 *
 * Handles regular shop product checkout.
 * Flow:
 *  1. Validate request body
 *  2. Save order to Sanity with status "pending"
 *  3. Look up printifyProductId + printifyVariantId for each cart item
 *  4. Submit order to Printify for print + fulfillment
 *  5. Update the Sanity order doc with Printify's order ID
 *  6. Send confirmation email via Resend
 *
 * Printify is NEVER mentioned in any customer-facing response.
 */

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ReceiptEmail } from '@/components/emails/ReceiptEmail';
import { backendClient } from '@/sanity/lib/backendClient';
import {
  createPrintifyOrder,
  buildPrintifyLineItem,
  type PrintifyAddress,
  type PrintifyLineItem,
} from '@/lib/printify';

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItemPayload {
  product: {
    _id: string;
    title?: string;
    price?: number;
    printifyProductId?: string;
    printifyVariantMap?: Array<{
      size?: string;
      color?: string;
      printifyVariantId?: number;
    }>;
  };
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
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
  return `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

/**
 * Resolve the Printify variant ID for a cart item.
 * Matches on size + color from the product's printifyVariantMap stored in Sanity.
 * Returns undefined if the product has no Printify configuration.
 */
function resolvePrintifyVariantId(item: CartItemPayload): number | undefined {
  const variantMap = item.product.printifyVariantMap;
  if (!variantMap || variantMap.length === 0) return undefined;

  // Exact size + color match
  const exact = variantMap.find(
    (v) =>
      (!item.selectedSize || v.size === item.selectedSize) &&
      (!item.selectedColor || v.color === item.selectedColor)
  );
  if (exact?.printifyVariantId) return exact.printifyVariantId;

  // Fallback: match size only
  if (item.selectedSize) {
    const sizeOnly = variantMap.find((v) => v.size === item.selectedSize);
    if (sizeOnly?.printifyVariantId) return sizeOnly.printifyVariantId;
  }

  // Last resort: first entry
  return variantMap[0]?.printifyVariantId;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customer, userId, paymentMethod, paypalOrderId, stripePaymentIntentId } = body as {
      items: CartItemPayload[];
      customer: CustomerPayload;
      paymentMethod?: string;
      paypalOrderId?: string;
      stripePaymentIntentId?: string;
      userId?: string;
    };

    // ── 1. Validate ────────────────────────────────────────────────────────────
    if (!items || !customer || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required order details.' },
        { status: 400 }
      );
    }

    if (!customer.email || !customer.firstName || !customer.address || !customer.city) {
      return NextResponse.json(
        { error: 'Incomplete customer information.' },
        { status: 400 }
      );
    }

    const orderId = generateOrderId();
    const totalAmount = items.reduce(
      (acc, item) => acc + (item.product.price || 0) * item.quantity,
      0
    );

    // ── 2. Save order to Sanity (status: pending) ──────────────────────────────
    let sanityOrderDocId: string | null = null;

    if (!process.env.SANITY_API_TOKEN) {
      console.warn('[Sanity] SANITY_API_TOKEN is not set — order will not be persisted.');
    } else {
      try {
        const doc = await backendClient.create({
          _type: 'order',
          orderNumber: orderId,
          customerName: `${customer.firstName} ${customer.lastName}`,
          customerEmail: customer.email,
          clerkUserId: userId || 'guest',
          paymentMethod: paymentMethod || 'card',
          paypalOrderId: paypalOrderId || undefined,
          stripePaymentIntentId: stripePaymentIntentId || undefined,
          amount: totalAmount,
          currency: 'USD',
          status: 'processing',
          fulfillmentStatus: 'pending_fulfillment',
          address: {
            name: `${customer.firstName} ${customer.lastName}`,
            address: `${customer.address}${customer.city ? `, ${customer.city}` : ''}`,
            state: customer.state,
            zip: customer.zipCode,
          },
          products: items.map((item, index) => ({
            _key: `item_${index}`,
            product: { _type: 'reference', _ref: item.product._id },
            quantity: item.quantity,
            price: item.product.price || 0,
          })),
        });
        sanityOrderDocId = doc._id;
        console.log(`[Sanity] Order ${orderId} saved (doc: ${doc._id})`);
      } catch (sanityErr) {
        // Log but don't abort — fulfillment is more important than DB write
        console.error('[Sanity] Failed to save order:', sanityErr);
      }
    }

    // ── 3. Build Printify line items ───────────────────────────────────────────
    const shopId = process.env.PRINTIFY_SHOP_ID;
    const printifyApiKey = process.env.PRINTIFY_API_KEY;

    let printifyOrderId: string | null = null;

    if (!shopId || !printifyApiKey) {
      console.warn('[Printify] API credentials not configured — skipping fulfillment submission.');
    } else {
      const printifyLineItems: PrintifyLineItem[] = [];
      const skippedItems: string[] = [];

      for (const item of items) {
        if (!item.product.printifyProductId) {
          skippedItems.push(item.product.title || item.product._id);
          continue;
        }

        const variantId = resolvePrintifyVariantId(item);
        if (!variantId) {
          skippedItems.push(item.product.title || item.product._id);
          console.warn(
            `[Printify] No variant ID found for product "${item.product.title}" (size: ${item.selectedSize}, color: ${item.selectedColor})`
          );
          continue;
        }

        printifyLineItems.push(
          buildPrintifyLineItem({
            printifyProductId: item.product.printifyProductId,
            printifyVariantId: variantId,
            quantity: item.quantity,
          })
        );
      }

      if (skippedItems.length > 0) {
        console.warn(
          `[Printify] The following items were skipped (no Printify config): ${skippedItems.join(', ')}`
        );
      }

      // ── 4. Submit to Printify ────────────────────────────────────────────────
      if (printifyLineItems.length > 0) {
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
            label: `Tobey Store — ${orderId}`,
            line_items: printifyLineItems,
            shipping_method: 1, // Standard shipping
            send_shipping_notification: false, // We handle notifications ourselves
            address_to: shippingAddress,
          });

          printifyOrderId = printifyResponse.id;
          console.log(
            `[Printify] Order submitted successfully. Printify ID: ${printifyOrderId}`
          );

          // ── 5. Update Sanity with Printify order ID ──────────────────────────
          if (sanityOrderDocId && process.env.SANITY_API_TOKEN) {
            try {
              await backendClient.patch(sanityOrderDocId).set({
                printifyOrderId,
                fulfillmentStatus: 'sent_to_printify',
              }).commit();
              console.log(`[Sanity] Order ${orderId} updated with Printify ID.`);
            } catch (patchErr) {
              console.error('[Sanity] Failed to patch Printify order ID:', patchErr);
            }
          }
        } catch (printifyErr: unknown) {
          // ── Fulfillment failure — hold order in pending state ──────────────
          const errMsg = printifyErr instanceof Error ? printifyErr.message : String(printifyErr);
          console.error('[Printify] Order submission failed:', errMsg);

          if (sanityOrderDocId && process.env.SANITY_API_TOKEN) {
            try {
              await backendClient.patch(sanityOrderDocId).set({
                fulfillmentStatus: 'failed',
                status: 'pending',
              }).commit();
            } catch (_) { /* best-effort */ }
          }

          // Send admin alert
          if (process.env.RESEND_API_KEY) {
            try {
              await resend.emails.send({
                from: 'Tobey Store Alerts <onboarding@resend.dev>',
                to: 'hello@tobeystudios.com',
                subject: `⚠️ Printify fulfillment FAILED for order ${orderId}`,
                html: `<p>Order <strong>${orderId}</strong> was placed but could not be submitted to Printify.</p>
                       <p><strong>Error:</strong> ${errMsg}</p>
                       <p>Please review and manually re-submit from the Sanity dashboard.</p>`,
              });
            } catch (_) { /* email failure is non-critical */ }
          }

          // Don't expose Printify in error — customer still gets their order ID
          // The order is held in "pending_fulfillment" for manual retry
        }
      }
    }

    // ── 6. Send customer confirmation email ────────────────────────────────────
    const emailLineItems = items.map((item) => ({
      sku: item.product._id,
      name: item.product.title || 'Product',
      quantity: item.quantity,
      price: item.product.price || 0,
    }));

    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'Original Tobey Studio <onboarding@resend.dev>',
          to: customer.email,
          subject: `Your Order Confirmation #${orderId}`,
          react: ReceiptEmail({
            orderId,
            customerName: customer.firstName,
            totalAmount,
            items: emailLineItems,
          }),
        });
        console.log(`[Email] Confirmation sent to ${customer.email}`);
      } catch (emailErr) {
        console.error('[Email] Failed to send confirmation:', emailErr);
        // Non-critical — order is still created
      }
    }

    // ── 7. Return success (Printify details never exposed to client) ───────────
    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order placed successfully. You will receive a confirmation email shortly.',
    });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[create-order] Unhandled error:', error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
