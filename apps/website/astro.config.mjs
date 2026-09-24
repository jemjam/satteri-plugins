// @ts-check
import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";

import highlights from "@jemjam/satteri-highlights";

// https://astro.build/config
export default defineConfig({
  markdown: {
    processor: satteri({
      mdastPlugins: [highlights()],
    }),
  },
});
