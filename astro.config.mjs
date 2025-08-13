import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://jsuazof.github.io/',
  base: process.env.NODE_ENV === 'production' ? '/jsuazof.github.io/' : '/',
  integrations: [
    mdx(),
    tailwind({
      configFile: false,
      applyBaseStyles: true
    }),
    sitemap()
  ],
  output: 'static',
  build: {
    assets: '_astro'
  }
});