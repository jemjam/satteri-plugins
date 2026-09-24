// @ts-check
import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";

import highlights from "@jemjam/satteri-highlights";
import figcaptions from "@jemjam/satteri-figcaptions";

// https://astro.build/config
export default defineConfig({
  markdown: {
    processor: satteri({
      mdastPlugins: [figcaptions(), highlights()],
    }),
  },
});
