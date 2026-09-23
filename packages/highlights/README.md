# @jemjam/satteri-highlights

Turn `==highlighted text==` into semantic `<mark>` elements with Sätteri.

```ts
import highlights from "@jemjam/satteri-highlights";
import { markdownToHtml } from "satteri";

const { html } = markdownToHtml("This is ==important==.", {
  mdastPlugins: [highlights()],
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
