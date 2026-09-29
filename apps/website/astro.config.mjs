// @ts-check
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";

import highlights from "@jemjam/satteri-highlights";
import figcaptions from "@jemjam/satteri-figcaptions";
import defaultFrontmatter from "./src/plugins/default-frontmatter.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://jemjam.github.io",
  base: "/satteri-plugins",
  trailingSlash: "never",
  markdown: {
    processor: satteri({
      mdastPlugins: [
        defaultFrontmatter({
          layout: fileURLToPath(
            new URL("./src/layouts/Layout.astro", import.meta.url),
          ),
        }),
        figcaptions(),
        highlights(),
      ],
    }),
  },
});
