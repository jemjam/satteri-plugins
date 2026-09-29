---
title: Jam's Satteri Plugins
---

# Jam's Satteri Plugins

This is a very brief example page meant to show some of the satteri plugins in
action on markdown content.

---

## Highlights

The highlights plugin just makes text highlights in markdown translate to
actual `mark` elements. ==Many md processors already use this format== for text
highlights, so this adds the functionality to satteri md processing.

---

## Figures With Captions

The figcaptions plugin allows you to turn an image with some accompanying text
content into a `<figure>` with a proper `<figcaption>`. Normally a markdown
image will let you define alt text, and maybe some "title" string, but neither of
those is visible alongside the image in the way a figure/figcaption works.

```md
![An example image](./jason-leung-zz9qESMyBMo-unsplash-CROP.jpg)
This image pulled from [Jason Leung on Unsplash](https://unsplash.com/photos/a-large-display-of-legos-of-different-colors-and-sizes-zz9qESMyBMo)
```

turns-into:

![An example image](./jason-leung-zz9qESMyBMo-unsplash-CROP.jpg)
This image pulled from [Jason Leung on Unsplash](https://unsplash.com/photos/a-large-display-of-legos-of-different-colors-and-sizes-zz9qESMyBMo)

The convention works as follows: Paragraph elements that either start or end
with a single image on its own line are converted. The image becomes the
figure. The remaining content becomes the caption.
