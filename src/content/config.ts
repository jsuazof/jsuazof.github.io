// src/content/config.ts
import { z, defineCollection } from "astro:content";

// Schemas
const blogSchema = ({ image }: { image: any }) =>
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
  });

const storeSchema = ({ image }: { image: any }) =>
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
  });

// Collections
const blogCollection = defineCollection({
  schema: blogSchema,
});

const storeCollection = defineCollection({
  schema: storeSchema,
});

export const collections = { blog: blogCollection, store: storeCollection };

// Exports para tipado en otras páginas
export type BlogSchema = z.infer<ReturnType<typeof blogSchema>>;
export type StoreSchema = z.infer<ReturnType<typeof storeSchema>>;
