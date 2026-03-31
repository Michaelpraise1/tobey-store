import { BasketIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const productType = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'discount',
      title: 'Discount',
      type: 'number',
      description: 'Discount amount',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [defineArrayMember({ type: 'image', options: { hotspot: true } })],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'category' }] })],
    }),
    defineField({
      name: 'stock',
      title: 'Stock',
      type: 'number',
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "status",
      title: "product status",
      type: "string",
      options: {
        list: [
          { title: "Available", value: "available" },
          { title: "Out of Stock", value: "out_of_stock" },
          { title: "New", value: "new" },
          { title: "Hot", value: "hot" },

        ]
      }
    }),
    defineField({
      name: 'variants',
      title: "product type",
      type: "string",
      options: {
        list: [
          { title: "Apparel", value: "apparel" },
          { title: "Beverages", value: "beverages" },
          { title: "others", value: "others" },
        ]
      }
    }),
    defineField({
      name: "sizes",
      title: "Sizes",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Small", value: "small" },
          { title: "Medium", value: "medium" },
          { title: "Large", value: "large" },
          { title: "Extra Large", value: "xl" },
          { title: "Double Extra Large", value: "xxl" }
        ]
      },
      hidden: ({ document }) => document?.variants !== 'apparel'
    }),
        defineField({
      name: "taste",
      title: "Taste",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Medium", value: "medium" },
          { title: "Hot", value: "hot" },
          { title: "Extreme", value: "extreme" },
          { title: "Caffeine", value: "caffeine" },
          { title: "Sugar-Free", value: "sugarfree" },
          { title: "Natural", value: "natural" },
          { title: "Sweet", value: "sweet" },
          { title: "Tart", value: "tart" },
          { title: "Fizzy", value: "fizzy" },
        ]
      },
      hidden: ({ document }) => document?.variants !== 'beverages'
    }),
    defineField({
      name: 'hasVariants',
      title: 'Has Variants',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Product',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'images.0',
      subtitle: 'price',
    },
    prepare(selection) {
      const { title, media, subtitle } = selection
      return {
        title,
        media,
        subtitle: subtitle ? `$${subtitle}` : 'No price',
      }
    },
  },
})
