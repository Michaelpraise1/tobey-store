import { HomeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const addressType = defineType({
  name: "address",
  title: "Address",
  type: "document",
  icon: HomeIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      description: "A friendly name for this address (e.g., 'Home', 'Work')",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      type: "string",
      title: "user email",
      validation: (Rule) => Rule.required().email(),
    }),
     
    defineField({
      name: "address",
      type: "string",
      title: "Address",
      description: "Street address, P.O. box, company name, c/o",
      validation: (Rule) => Rule.required().min(5).max(100),
    }),
   
     defineField({
      name: "city",
      type: "string",
      title: "City",
      validation: (Rule) => Rule.required(),
    }),
     defineField({
      name: "state",
      type: "string",
      title: "State",
      description: "Two letter state code (e.g., 'CA' for California)",
      validation: (Rule) => Rule.required().length(2).uppercase(),
    }),
     defineField({
      name: "zipCode",
      type: "string",
      title: "Zip Code",
      description: "Format: 12345 or 12345-6789",
      validation: (Rule) => Rule.required().regex(/^\d{5}(-\d{4})?$/, { name: "zip-code", invert: false, })
      .custom((zip: string | undefined) => {
        if (!zip) {
          return "ZIP code is required";
        }
        if (!zip.match(/^\d{5}(-\d{4})?$/)) {
          return "please enter a valid ZIP code (e.g., 12345 or 12345-6789)"
        }
        return true;
      }),
    }),
    
     defineField({
      name: "default",
      type: "boolean",
      title: "Default Address",
      description: "Is this the default shipping address?",
      initialValue: false,
     }),
     defineField({
      name: "createdAt",
      type: "datetime",
      title: "Created At",
      description: "When was this address created?",
      initialValue: new Date().toISOString(),
     }),

  ],
  preview: {
    select: {
      title: "name",
      subtitle: "address",
      city: "city",
      state: "state",
      isDefault: "default",
    },
    prepare({title, subtitle, city, state, isDefault}) {
      return {
        title: `${title} ${isDefault ? "(Default)" : ""}`,
        subtitle: `${subtitle}, ${city}, ${state}`,
      };
    }
  }

});