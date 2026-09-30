---
title: Figures With Captions
---

## Figures With Captions

The figcaptions plugin allows you to turn an image with some accompanying text
content into a `<figure>` with a proper `<figcaption>`. Normally a markdown
image will let you define alt text, and maybe some "title" string, but neither of
those is visible alongside the image in the way a figure/figcaption works.

```md
![An example image](../assets/jason-leung-zz9qESMyBMo-unsplash-CROP.jpg "look at
all those figures")
This image pulled from [Jason Leung on Unsplash](https://unsplash.com/photos/a-large-display-of-legos-of-different-colors-and-sizes-zz9qESMyBMo)
```

turns-into:

![An example image](../assets/jason-leung-zz9qESMyBMo-unsplash-CROP.jpg "look at
all those figures")
This image pulled from [Jason Leung on Unsplash](https://unsplash.com/photos/a-large-display-of-legos-of-different-colors-and-sizes-zz9qESMyBMo)

The convention works as follows: Paragraph elements that either start or end
with a single image on its own line are converted. The image becomes the
figure. The remaining content becomes the caption.
