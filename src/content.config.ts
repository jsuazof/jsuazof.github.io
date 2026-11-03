import { defineCollection } from "astro:content";
import type { ImageMetadata } from "astro";
import { z } from "astro:schema";
import { glob } from "astro/loaders";

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
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: blogSchema,
});

const storeCollection = defineCollection({
  loader: glob({ base: "./src/content/store", pattern: "**/*.{md,mdx}" }),
  schema: storeSchema,
});

export const collections = { blog: blogCollection, store: storeCollection };

// Exports para tipado en otras páginas
export interface BlogSchema {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  heroImage?: ImageMetadata;
  badge?: string;
  tags?: string[];
}

export interface StoreSchema {
  title: string;
  description: string;
  custom_link_label: string;
  custom_link?: string;
  updatedDate: Date;
  pricing?: string;
  oldPricing?: string;
  badge?: string;
  checkoutUrl?: string;
  heroImage?: ImageMetadata;
}
