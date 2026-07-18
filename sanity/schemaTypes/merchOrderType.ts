import { BasketIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * merchOrder schema
 *
 * Tracks all merch orders placed through the website.
 * Created by the API route after a successful Stripe payment.
 * Updated via Printify webhooks as fulfillment progresses.
 *
 * Intentionally separate from the main `order` schema so merch
 * orders (print-on-demand, no inventory) don't mix with regular
 * product orders (stock-based).
 */
export const merchOrderType = defineType({
  name: 'merchOrder',
  title: 'Merch Order',
  type: 'document',
  icon: BasketIcon,
  groups: [
    { name: 'customer', title: 'Customer', default: true },
    { name: 'items', title: 'Order Items' },
    { name: 'fulfillment', title: 'Fulfillment' },
    { name: 'payment', title: 'Payment' },
  ],
  fields: [
    // ─── Order Identity ────────────────────────────────────────────────────────
    defineField({
      name: 'orderNumber',
      title: 'Order Number',
      type: 'string',
      readOnly: true,
      description: 'Auto-generated unique order reference (e.g. MERCH-2024-0001).',
    }),

    // ─── Customer ─────────────────────────────────────────────────────────────
    defineField({
      name: 'customerName',
      title: 'Customer Name',
      type: 'string',
      group: 'customer',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'customerEmail',
      title: 'Customer Email',
      type: 'string',
      group: 'customer',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'clerkUserId',
      title: 'Store User ID',
      type: 'string',
      group: 'customer',
      description: 'Clerk user ID — links the order to an authenticated account.',
    }),
    defineField({
      name: 'shippingAddress',
      title: 'Shipping Address',
      type: 'object',
      group: 'customer',
      fields: [
        defineField({ name: 'name', title: 'Full Name', type: 'string' }),
        defineField({ name: 'address1', title: 'Street Address', type: 'string' }),
        defineField({ name: 'address2', title: 'Apt / Suite', type: 'string' }),
        defineField({ name: 'city', title: 'City', type: 'string' }),
        defineField({ name: 'state', title: 'State / Province', type: 'string' }),
        defineField({ name: 'zip', title: 'ZIP / Postal Code', type: 'string' }),
        defineField({
          name: 'country',
          title: 'Country Code',
          type: 'string',
          initialValue: 'US',
          description: 'ISO 3166-1 alpha-2 (e.g. US, CA, GB)',
        }),
      ],
    }),

    // ─── Order Items ──────────────────────────────────────────────────────────
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      group: 'items',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'merchOrderItem',
          fields: [
            defineField({
              name: 'product',
              title: 'Merch Product',
              type: 'reference',
              to: [{ type: 'merchProduct' }],
            }),
            defineField({
              name: 'designName',
              title: 'Selected Design',
              type: 'string',
              description: 'The design name the customer chose (e.g. "Classic Logo").',
            }),
            defineField({
              name: 'color',
              title: 'Selected Color',
              type: 'string',
              description: 'Color label chosen by the customer.',
            }),
            defineField({
              name: 'size',
              title: 'Selected Size',
              type: 'string',
              description: 'Size chosen by the customer (if applicable).',
            }),
            defineField({
              name: 'quantity',
              title: 'Quantity',
              type: 'number',
              validation: (Rule) => Rule.required().min(1),
            }),
            defineField({
              name: 'priceAtPurchase',
              title: 'Unit Price at Purchase',
              type: 'number',
              description: 'Price locked in at the time of checkout.',
              validation: (Rule) => Rule.required().min(0),
            }),
            // Phase 2: store Printify's internal variant ID per item
            defineField({
              name: 'printifyVariantId',
              title: 'Printify Variant ID',
              type: 'number',
              description:
                '(Populated by API) The exact Printify variant selected, used to submit the order.',
            }),
            // Phase 2: custom artwork URL if the customer uploaded their own
            defineField({
              name: 'customArtworkUrl',
              title: 'Custom Artwork URL',
              type: 'url',
              description:
                '(Phase 2) URL of customer-uploaded artwork stored in your CDN.',
            }),
          ],
          preview: {
            select: {
              title: 'product.title',
              design: 'designName',
              color: 'color',
              size: 'size',
              quantity: 'quantity',
              price: 'priceAtPurchase',
              media: 'product.designs.0.previewImage',
            },
            prepare({ title, design, color, size, quantity, price, media }) {
              return {
                title: title ? `${title} ×${quantity}` : 'Unknown Item',
                subtitle: [design, color, size].filter(Boolean).join(' · ') + ` · $${price}`,
                media,
              }
            },
          },
        }),
      ],
    }),

    // ─── Payment ──────────────────────────────────────────────────────────────
    defineField({
      name: 'stripeCheckoutSessionId',
      title: 'Stripe Checkout Session ID',
      type: 'string',
      group: 'payment',
      readOnly: true,
    }),
    defineField({
      name: 'stripeCustomerId',
      title: 'Stripe Customer ID',
      type: 'string',
      group: 'payment',
      readOnly: true,
    }),
    defineField({
      name: 'totalAmount',
      title: 'Total Amount (USD)',
      type: 'number',
      group: 'payment',
      description: 'Total charged to the customer including shipping.',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      group: 'payment',
      initialValue: 'usd',
    }),

    // ─── Fulfillment ──────────────────────────────────────────────────────────
    defineField({
      name: 'fulfillmentProvider',
      title: 'Fulfillment Provider',
      type: 'string',
      group: 'fulfillment',
      options: {
        list: [
          { title: 'Printify', value: 'printify' },
          { title: 'Printful', value: 'printful' },
          { title: 'Gelato', value: 'gelato' },
          { title: 'Manual', value: 'manual' },
        ],
        layout: 'radio',
      },
      initialValue: 'printify',
    }),
    defineField({
      name: 'printifyOrderId',
      title: 'Printify Order ID',
      type: 'string',
      group: 'fulfillment',
      readOnly: true,
      description: 'Populated automatically when the order is submitted to Printify.',
    }),
    defineField({
      name: 'status',
      title: 'Order Status',
      type: 'string',
      group: 'fulfillment',
      options: {
        list: [
          { title: 'Pending Payment', value: 'pending' },
          { title: 'Paid — Awaiting Fulfillment', value: 'paid' },
          { title: 'Sent to Printify', value: 'sent_to_fulfillment' },
          { title: 'In Production', value: 'in_production' },
          { title: 'Shipped', value: 'shipped' },
          { title: 'Delivered', value: 'delivered' },
          { title: 'Cancelled', value: 'cancelled' },
          { title: 'Refunded', value: 'refunded' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'trackingNumber',
      title: 'Tracking Number',
      type: 'string',
      group: 'fulfillment',
      description: 'Populated by Printify webhook once the order has shipped.',
    }),
    defineField({
      name: 'trackingUrl',
      title: 'Tracking URL',
      type: 'url',
      group: 'fulfillment',
      description: 'Direct link to carrier tracking page.',
    }),
    defineField({
      name: 'estimatedDelivery',
      title: 'Estimated Delivery Date',
      type: 'date',
      group: 'fulfillment',
    }),
    defineField({
      name: 'fulfillmentNotes',
      title: 'Fulfillment Notes',
      type: 'text',
      group: 'fulfillment',
      rows: 2,
      description: 'Internal notes (e.g. production issues, customer requests).',
    }),
  ],

  preview: {
    select: {
      title: 'orderNumber',
      customer: 'customerName',
      status: 'status',
      amount: 'totalAmount',
    },
    prepare({ title, customer, status, amount }) {
      const statusEmoji: Record<string, string> = {
        pending: '⏳',
        paid: '💳',
        sent_to_fulfillment: '📤',
        in_production: '🖨️',
        shipped: '📦',
        delivered: '✅',
        cancelled: '❌',
        refunded: '↩️',
      }
      const emoji = statusEmoji[status] ?? '❓'
      return {
        title: title ? `${emoji} Merch #${title}` : `${emoji} New Merch Order`,
        subtitle: `${customer ?? 'Unknown'} · $${amount ?? '—'} · ${status ?? 'pending'}`,
      }
    },
  },
})
