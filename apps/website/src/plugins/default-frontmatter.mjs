// @ts-check

/**
 * Fill missing top-level Astro frontmatter properties, preserving explicit values.
 * @param {Record<string, unknown>} defaults
 * @returns {NonNullable<import('@astrojs/markdown-satteri').SatteriProcessorOptions['mdastPlugins']>[number]}
 */
export default function defaultFrontmatter(defaults) {
  return {
    name: "default-frontmatter",
    before(_node, ctx) {
      const astro = /** @type {{ frontmatter: Record<string, unknown> } | undefined} */ (
        ctx.data.astro
      );
      if (!astro) return;

      for (const [key, value] of Object.entries(defaults)) {
        if (!Object.hasOwn(astro.frontmatter, key)) {
          astro.frontmatter[key] = structuredClone(value);
        }
      }
    },
  };
}
