import {BasketIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const orderType = defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({
      name: 'orderNumber',
      title: 'Order Number',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'customerName',
      title: 'Customer Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'customerEmail',
      title: 'Customer Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'stripeCheckoutSessionId',
      title: 'Stripe Checkout Session ID',
      type: 'string',
    }),
    defineField({
      name: 'paypalOrderId',
      title: 'PayPal Order ID',
      type: 'string',
    }),
    defineField({
      name: 'paymentMethod',
      title: 'Payment Method',
      type: 'string',
      initialValue: 'card',
    }),
    defineField({
      name: "stripeCustomerId",
      title: "Stripe Customer ID",
      type: "string",
    }),
    defineField({
      name: "clerkUserId",
      title: "Store User ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'amount',
      title: 'Amount',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      initialValue: 'USD',
    }),
     defineField({
      name: "address",
      title: "Shipping Address",
      type: "object",
      fields: [
        defineField({ name: "state", title: "State", type: "string" }),
        defineField({ name: "zip", title: "Zip Code", type: "string" }),
        defineField({ name: "address", title: "Street Address", type: "string" }),
        defineField({ name: "name", title: "Name", type: "string" }),
      ],
    }),
    defineField({
      name: 'status',
      title: 'Order Status',
      type: 'string',
      options: {
        list: [
          {title: 'Pending', value: 'pending'},
          {title: 'Processing', value: 'processing'},
          {title: 'Shipped', value: 'shipped'},
          {title: 'Delivered', value: 'delivered'},
          {title: 'Cancelled', value: 'cancelled'},
        ],
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'products',
      title: 'Products',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'product',
              title: 'Product',
              type: 'reference',
              to: [{type: 'product'}],
            }),
            defineField({name: 'quantity', title: 'Quantity', type: 'number'}),
            defineField({name: 'price', title: 'Price at Purchase', type: 'number'}),
          ],
          preview: {
            select: {
              title: 'product.title',
              quantity: 'quantity',
              media: 'product.images.0',
              price: 'price',
            },
            prepare({title, quantity, media, price}) {
              return {
                title: title ? `${title} x${quantity}` : 'Unknown Product',
                subtitle: `$${price}`,
                media,
              }
            },
          },
        }),
      ],
    }),

    // ─── Printify Fulfillment (internal — not shown to customer) ─────────────
    defineField({
      name: 'printifyOrderId',
      title: 'Printify Order ID',
      type: 'string',
      readOnly: true,
      description: '(Auto-populated) Returned by Printify after the order is submitted for fulfillment.',
    }),
    defineField({
      name: 'fulfillmentStatus',
      title: 'Fulfillment Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending Fulfillment', value: 'pending_fulfillment' },
          { title: 'Sent to Printify', value: 'sent_to_printify' },
          { title: 'In Production', value: 'in_production' },
          { title: 'Shipped', value: 'shipped' },
          { title: 'Delivered', value: 'delivered' },
          { title: 'Fulfillment Failed', value: 'failed' },
        ],
        layout: 'dropdown',
      },
      description: 'Updated automatically by Printify webhooks.',
    }),
    defineField({
      name: 'trackingNumber',
      title: 'Tracking Number',
      type: 'string',
      readOnly: true,
      description: 'Populated via Printify webhook once the order has shipped.',
    }),
    defineField({
      name: 'trackingUrl',
      title: 'Tracking URL',
      type: 'url',
      readOnly: true,
      description: 'Direct link to carrier tracking page.',
    }),
  ],
  preview: {
    select: {
      title: 'orderNumber',
      subtitle: 'customerName',
      amount: 'amount',
      currency: 'currency',
      status: 'status',
    },
    prepare(selection) {
      const {title, subtitle, amount, currency, status} = selection
      return {
        title: title ? `Order #${title}` : 'New Order',
        subtitle: `${subtitle || 'Unknown Customer'} - ${status} - ${amount} ${currency}`,
      }
    },
  },
})
