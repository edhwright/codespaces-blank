import { defineConfig } from 'astro/config';

import solidJs from "@astrojs/solid-js";

// https://astro.build/config
export default defineConfig({
  server: {
    host: true
  },
  integrations: [solidJs()]
});