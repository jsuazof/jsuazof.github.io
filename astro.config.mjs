import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: 'https://jsuazof.github.io',
  base: '/jscloud-architect',
  integrations: [mdx(), sitemap(), tailwind()]
});