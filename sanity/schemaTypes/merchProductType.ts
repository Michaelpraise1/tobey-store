import { TagIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * merchProduct schema
 *
 * Represents a print-on-demand merch item (e.g. hoodie, hat, mug).
 * Each document is a "product shell" — it holds your brand's design
 * metadata while Printify handles the actual printing + fulfillment.
 *
 * Phase 1: Managed manually in Sanity Studio, linked to Printify via
 *   printifyBlueprintId + printifyPrintProviderId.
 *
 * Phase 2: printifyProductId is auto-populated when a product is
 *   created via the Printify API (e.g. for custom customer designs).
 */
export const merchProductType = defineType({
  name: 'merchProduct',
  title: 'Merch Product',
  type: 'document',
  icon: TagIcon,
  groups: [
    { name: 'info', title: 'Product Info', default: true },
    { name: 'designs', title: 'Designs & Colors' },
    { name: 'fulfillment', title: 'Printify / Fulfillment' },
    { name: 'seo', title: 'SEO & Display' },
  ],
  fields: [
    // ─── Core Info ─────────────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Product Name',
      type: 'string',
      group: 'info',
      description: 'e.g. "Classic Hoodie", "Snapback Hat", "Logo Mug"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'info',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
      group: 'info',
    }),
    defineField({
      name: 'productType',
      title: 'Product Type',
      type: 'string',
      group: 'info',
      options: {
        list: [
          { title: 'T-Shirt', value: 'tshirt' },
          { title: 'Hoodie', value: 'hoodie' },
          { title: 'Beanie', value: 'beanie' },
          { title: 'Hat / Cap', value: 'hat' },
          { title: 'Mug', value: 'mug' },
          { title: 'Sticker', value: 'sticker' },
          { title: 'Joggers', value: 'joggers' },
          { title: 'Other', value: 'other' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'basePrice',
      title: 'Base Price (USD)',
      type: 'number',
      group: 'info',
      description: 'Your retail price shown to the customer.',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured on Merch Page',
      type: 'boolean',
      group: 'info',
      initialValue: false,
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'info',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Draft', value: 'draft' },
          { title: 'Archived', value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),

    // ─── Sizes ─────────────────────────────────────────────────────────────────
    defineField({
      name: 'availableSizes',
      title: 'Available Sizes',
      type: 'array',
      group: 'info',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'XS', value: 'xs' },
          { title: 'S', value: 's' },
          { title: 'M', value: 'm' },
          { title: 'L', value: 'l' },
          { title: 'XL', value: 'xl' },
          { title: '2XL', value: '2xl' },
          { title: '3XL', value: '3xl' },
          { title: 'One Size', value: 'one_size' },
        ],
      },
      // Hidden for non-apparel items like mugs and stickers
      hidden: ({ document }) =>
        ['mug', 'sticker'].includes(document?.productType as string),
    }),

    // ─── Designs & Colors ──────────────────────────────────────────────────────
    defineField({
      name: 'designs',
      title: 'Available Designs',
      type: 'array',
      group: 'designs',
      description:
        'Each design is a named logo/artwork option customers can pick from.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'design',
          title: 'Design',
          fields: [
            defineField({
              name: 'name',
              title: 'Design Name',
              type: 'string',
              description: 'e.g. "Classic Logo", "Flame Script", "Minimal Wordmark"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'previewImage',
              title: 'Preview Image',
              type: 'image',
              description: 'Mockup image of this design on the product.',
              options: { hotspot: true },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'string',
                }),
              ],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'printifyVariantIds',
              title: 'Printify Variant IDs',
              type: 'array',
              of: [{ type: 'number' }],
              description:
                '(Phase 1) The variant IDs from Printify that correspond to this design. Map from Printify product editor.',
            }),
          ],
          preview: {
            select: {
              title: 'name',
              media: 'previewImage',
            },
          },
        }),
      ],
    }),

    defineField({
      name: 'colorOptions',
      title: 'Available Colors',
      type: 'array',
      group: 'designs',
      description: 'Color choices available for this product.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'colorOption',
          fields: [
            defineField({
              name: 'label',
              title: 'Color Name',
              type: 'string',
              description: 'e.g. "Black", "Forest Green", "Sand"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'hex',
              title: 'Hex Code',
              type: 'string',
              description: 'e.g. #1a1a1a — used to render color swatches on the site.',
              validation: (Rule) =>
                Rule.regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
                  name: 'hex color',
                  invert: false,
                }).warning('Enter a valid hex color code'),
            }),
            defineField({
              name: 'printifyColorId',
              title: 'Printify Color ID',
              type: 'string',
              description:
                '(Phase 1) The color variant key from Printify, used to map customer selection to the correct variant.',
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'hex' },
          },
        }),
      ],
    }),

    // ─── Printify / Fulfillment ────────────────────────────────────────────────
    defineField({
      name: 'printifyBlueprintId',
      title: 'Printify Blueprint ID',
      type: 'number',
      group: 'fulfillment',
      description:
        'The Printify blueprint (product template) ID. Find this via the Printify Catalog API or your Printify dashboard.',
    }),
    defineField({
      name: 'printifyPrintProviderId',
      title: 'Printify Print Provider ID',
      type: 'number',
      group: 'fulfillment',
      description:
        'The print provider for this blueprint. Different providers have different quality/pricing.',
    }),
    defineField({
      name: 'printifyProductId',
      title: 'Printify Product ID',
      type: 'string',
      group: 'fulfillment',
      readOnly: true,
      description:
        '(Auto-populated) The live product ID once published to your Printify shop. Do not edit manually.',
    }),
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

    // ─── SEO & Display ─────────────────────────────────────────────────────────
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'seo',
      description: 'Overrides product title in <title> tag if set.',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Meta Description',
      type: 'text',
      group: 'seo',
      rows: 3,
      validation: (Rule) => Rule.max(155),
    }),
  ],

  preview: {
    select: {
      title: 'title',
      productType: 'productType',
      status: 'status',
      media: 'designs.0.previewImage',
      price: 'basePrice',
    },
    prepare({ title, productType, status, media, price }) {
      const statusEmoji = status === 'active' ? '🟢' : status === 'draft' ? '🟡' : '⚫'
      return {
        title: `${statusEmoji} ${title ?? 'Untitled'}`,
        subtitle: `${productType ?? 'Unknown type'} · $${price ?? '—'}`,
        media,
      }
    },
  },
})
