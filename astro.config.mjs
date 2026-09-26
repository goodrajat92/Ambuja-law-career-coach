// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves this project at https://<user>.github.io/<repo>/,
// so `site` is the user domain and `base` is the repo name.
// Every internal link must go through the `url()` helper in src/lib/links.ts
// so it picks up this base path.
export default defineConfig({
  site: 'https://goodrajat92.github.io',
  base: '/Ambuja-law-career-coach',
  vite: {
    plugins: [tailwindcss()],
  },
});
