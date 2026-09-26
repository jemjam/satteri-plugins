# @jemjam/satteri-figcaptions

Turn an image on the first or last line of a Markdown paragraph into a semantic
figure. The other lines become its caption, preserving inline formatting and
source order.

```ts
import figcaptions from "@jemjam/satteri-figcaptions";
import { markdownToHtml } from "satteri";

const { html } = markdownToHtml(
  "![Boat on the lake](boat.jpg)\nA **quiet morning** on Lake Saimaa.",
  { mdastPlugins: [figcaptions()] },
);
```

```html
<figure>
  <img src="boat.jpg" alt="Boat on the lake" />
  <figcaption>A <strong>quiet morning</strong> on Lake Saimaa.</figcaption>
</figure>
```

Caption-first input produces `figure > figcaption + img`. Captions may wrap
across lines and contain emphasis, links, code, and images. The image's alt text,
URL, and title remain independent. A separating hard break is removed; breaks
inside the caption are preserved. Blockquotes, list items, and resolved image
references are supported.

Blank lines and other Markdown blocks end the paragraph. Image-only paragraphs,
linked images, inline images sharing their line with caption text, unresolved
references, whitespace-only captions, and standalone images at both ends stay
unchanged. Images must occupy a single source line. Missing paragraph, image,
or separator positions also leave the paragraph unchanged.

The zero-argument default export returns a per-document plugin factory. It
requests source positions and skips MDX. Tested against Sätteri 0.10.5; no
styling or configuration options are included.

## Development

From the repository root, with mise's configured tools:

```sh
mise exec -- vp -C packages/figcaptions test --run
mise exec -- vp check
mise exec -- vp -C packages/figcaptions pack
```
