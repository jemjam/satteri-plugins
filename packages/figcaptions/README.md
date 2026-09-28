# @jemjam/satteri-figcaptions

Turn an image at the start or end of a Markdown paragraph into a semantic
figure when a line break separates it from caption content. The caption keeps
its inline formatting and source order.

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
URL, and title remain independent; alt text and titles may wrap across lines.
The separating newline or hard break is removed; breaks inside the caption are
preserved. Blockquotes, list items, and resolved image references are supported.

Blank lines and other Markdown blocks end the paragraph. Image-only paragraphs,
linked images, inline images sharing their line with caption text, unresolved
references, and captions containing only plain whitespace or breaks stay
unchanged. Standalone images at both ends are ambiguous and also stay unchanged.
When only one end image has a separating line break, the other image remains
part of the caption. Inline markup counts as caption content, even when it wraps
only whitespace.

Matching uses parsed nodes and text values without requesting source positions.
Images and paragraphs created by other plugins can therefore qualify without
positions. Decoded newline entities such as `&#10;` count as line breaks, and
decoded spaces or tabs beside the separator count as whitespace.

The zero-argument default export returns a per-document plugin factory and skips
MDX. Tested against Sätteri 0.10.5; no styling or configuration options are
included.

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
