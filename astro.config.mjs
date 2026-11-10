import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://jsuazof.github.io/',
  base: '/',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    mdx(),
    sitemap()
  ],
  output: 'static',
  build: {
    assets: '_astro'
  }
});