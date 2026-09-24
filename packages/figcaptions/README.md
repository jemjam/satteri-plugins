# @jemjam/satteri-figcaptions

Creates a convention in markdown where an image/paragraph are turned into a
`figure` with an associated `figcaption`. The figure itself must be alone on
one line at either the start or end of a paragraph, with the remaining content
becoming the related caption.

```ts
import figcaptions from "@jemjam/satteri-figcaptions";
import { markdownToHtml } from "satteri";

const mdcontent = `![Image Alt](./path-to-image.png)
Some _possibly formatted_ text to use within the caption`;

const { html } = markdownToHtml(mdcontent, {
  mdastPlugins: [figcaptions()],
});
```

## Development

- Install dependencies:

```bash
vp install
```

- Run the unit tests:

```bash
vp test
```

- Build the library:

```bash
vp pack
```
