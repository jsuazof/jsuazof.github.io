import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://jsuazof.github.io/',
  base: '/',
  integrations: [
    mdx(),
    sitemap()
  ],
  output: 'static',
  build: {
    assets: '_astro'
  }
});