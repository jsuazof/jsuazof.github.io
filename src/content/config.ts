// src/content/config.ts
import { z, defineCollection } from "astro:content";

// Colección: Blog
const blogCollection = defineCollection({
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      badge: z.string().optional(),
      tags: z
        .array(z.string())
        .refine((items) => new Set(items).size === items.length, {
          message: "tags must be unique",
        })
        .optional(),
    }),
});

// Colección: Store (corregida)
const storeCollection = defineCollection({
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      custom_link_label: z.string(),
      custom_link: z.string().optional(),
      updatedDate: z.coerce.date(),
      pricing: z.string().optional(),
      oldPricing: z.string().optional(),
      badge: z.string().optional(),
      checkoutUrl: z.string().optional(),
      heroImage: image().optional(),
    }),
});
export const collections = { blog: blogCollection, store: storeCollection };
