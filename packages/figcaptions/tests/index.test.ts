import { defineMdastPlugin, markdownToHtml, mdxToJs, type MdastNode } from "satteri";
import { expect, test } from "vite-plus/test";
import figcaptions from "../src/index.ts";

function compile(source: string) {
  return markdownToHtml(source, { mdastPlugins: [figcaptions()] }).html;
}

const img = '<img src="boat.jpg" alt="Boat">';
const image = "![Boat](boat.jpg)";

test.each([
  [image + "\nCaption.", `<figure>${img}<figcaption>Caption.</figcaption></figure>\n`],
  ["Caption.\n" + image, `<figure><figcaption>Caption.</figcaption>${img}</figure>\n`],
  [
    image + "\nCaption\nwraps.",
    `<figure>${img}<figcaption>Caption\nwraps.</figcaption></figure>\n`,
  ],
  [
    "Caption\nwraps.\n" + image,
    `<figure><figcaption>Caption\nwraps.</figcaption>${img}</figure>\n`,
  ],
])("preserves source order: %s", (source, expected) => {
  expect(compile(source)).toBe(expected);
});

test.each([
  image,
  image + "\n \t",
  image + "\n\nCaption",
  "Caption\n\n" + image,
  image + " Caption",
  "Caption " + image,
  image + " same line\nCaption",
  "Caption\nsame line " + image,
  image + "\nCaption\n![Other](other.jpg)",
  image + "\n![Other](other.jpg)",
  "[![Boat](boat.jpg)](link)\nCaption",
  "Caption\n[![Boat](boat.jpg)](link)",
  "![Boat][missing]\nCaption",
  "Caption\n![Boat][missing]",
  "Ordinary *prose*.",
  "![Multi\nline](boat.jpg)\nCaption",
  "Before\n" + image + "\nAfter",
])("leaves nonmatching Markdown unchanged: %s", (source) => {
  expect(compile(source)).toBe(markdownToHtml(source).html);
});

test.each(["\n", "  \n", "\\\n", "\r\n", "  \r\n", "\r"])(
  "removes only the boundary break %j",
  (separator) => {
    expect(compile(image + separator + "Caption")).toBe(
      `<figure>${img}<figcaption>Caption</figcaption></figure>\n`,
    );
    expect(compile("Caption" + separator + image)).toBe(
      `<figure><figcaption>Caption</figcaption>${img}</figure>\n`,
    );
  },
);

test("preserves inline formatting, caption images and internal hard breaks in both orders", () => {
  const caption =
    "**Strong** *Emphasis* [link](https://example.com) `code` ![small](small.png)  \nnext\\\nlast";
  const content =
    '<strong>Strong</strong> <em>Emphasis</em> <a href="https://example.com">link</a> <code>code</code> <img src="small.png" alt="small"><br>\nnext<br>\nlast';
  expect(compile(image + "\n" + caption)).toBe(
    `<figure>${img}<figcaption>${content}</figcaption></figure>\n`,
  );
  expect(compile(caption + "\n" + image)).toBe(
    `<figure><figcaption>${content}</figcaption>${img}</figure>\n`,
  );
});

test.each(["> ", "- ", "1. ", "> - "])("works in containers %s", (prefix) => {
  const continuation = prefix.replace(/(?:- |1\. )/, (match) => " ".repeat(match.length));
  for (const lines of [
    [image, "Caption"],
    ["Caption", image],
  ]) {
    const html = compile(prefix + lines[0] + "\n" + continuation + lines[1]);
    expect(html).toContain("<figure>");
    expect(html).toContain("<figcaption>Caption</figcaption>");
    expect(html).not.toContain("<p>");
    expect(html).toContain(prefix.includes(">") ? "<blockquote>" : "<li>");
  }
});

test.each(["![Boat][ref]", "![ref][]", "![ref]"])(
  "supports resolved reference images %s",
  (reference) => {
    const definition = '\n\n[ref]: boat.jpg "Title"';
    for (const source of [reference + "\nCaption", "Caption\n" + reference]) {
      const html = compile(source + definition);
      expect(html).toContain("<figure>");
      expect(html).toContain('src="boat.jpg"');
      expect(html).toContain('title="Title"');
      expect(html).toContain("<figcaption>Caption</figcaption>");
    }
  },
);

test("preserves attributes and escapes special characters independently of caption", () => {
  const source = '![A & "B"](boat.jpg?a=1&b=2 "A & title")\nCaption & <b>text</b>';
  const html = compile(source);
  expect(html).toContain(
    '<img src="boat.jpg?a=1&amp;b=2" alt="A &amp; &quot;B&quot;" title="A &amp; title">',
  );
  expect(html).toContain("<figcaption>Caption &amp;");
});

test("respects block boundaries and multiple figures", () => {
  const html = compile(image + "\nCaption\n# Heading\n\n" + image + "\nSecond\n- item");
  expect(html).toBe(
    `<figure>${img}<figcaption>Caption</figcaption></figure>\n<h1>Heading</h1>\n<figure>${img}<figcaption>Second</figcaption></figure>\n<ul>\n<li>item</li>\n</ul>\n`,
  );
});

test("reuses a plugin entry across independent compilations without state leakage", () => {
  const plugin = figcaptions();
  const run = (source: string) => markdownToHtml(source, { mdastPlugins: [plugin] }).html;
  const expected = run(image + "\nCaption");
  expect(run("No figure")).toBe(markdownToHtml("No figure").html);
  expect(run(image + "\nCaption")).toBe(expected);
});

test.each(["paragraph", "image", "text"])("leaves nodes without %s positions unchanged", (type) => {
  const strip = defineMdastPlugin({
    name: "strip-positions",
    options: { position: true },
    paragraph(node, ctx) {
      function copy(node: MdastNode): MdastNode {
        const result = { ...node };
        if (result.type === type) delete result.position;
        if ("children" in result) Object.assign(result, { children: result.children.map(copy) });
        return result;
      }
      ctx.replaceNode(node, copy(node));
    },
  });
  for (const source of [image + "\nCaption", "Caption\n" + image]) {
    expect(markdownToHtml(source, { mdastPlugins: [strip, figcaptions()] }).html).toBe(
      markdownToHtml(source, { mdastPlugins: [strip] }).html,
    );
  }
});

test("leaves synthetic whitespace-only captions unchanged", () => {
  const blank = defineMdastPlugin({
    name: "blank-caption",
    options: { position: true },
    text(node, ctx) {
      ctx.setProperty(node, "value", "\n   ");
    },
  });
  const source = image + "\nCaption";
  expect(markdownToHtml(source, { mdastPlugins: [blank, figcaptions()] }).html).toBe(
    markdownToHtml(source, { mdastPlugins: [blank] }).html,
  );
});

test.each([
  "Caption\ntext&#10;" + image,
  image + "&#10;Caption",
  "![Boat](boat.jpg) &#32;\nCaption",
])("does not mistake character references for source line boundaries: %s", (source) => {
  expect(compile(source)).toBe(markdownToHtml(source).html);
});

test.each(["![船 🚢](boat.jpg)", '![船 🚢](boat.jpg "järvi")'])(
  "handles Unicode source offsets: %s",
  (source) => {
    expect(compile(source + "\nKuvateksti")).toContain("<figcaption>Kuvateksti</figcaption>");
    expect(compile("Kuvateksti 🚢\n" + source)).toContain("<figcaption>Kuvateksti 🚢</figcaption>");
  },
);

test("skips MDX compilation", () => {
  const source = image + "\nCaption";
  expect(mdxToJs(source, { mdastPlugins: [figcaptions()] }).code).toBe(mdxToJs(source).code);
});

test.each(["  ", "\t", ""])("accepts trailing whitespace on the image line %j", (space) => {
  expect(compile(image + space + "\nCaption")).toContain("<figcaption>Caption</figcaption>");
  expect(compile("Caption\n" + image + space)).toContain("<figcaption>Caption</figcaption>");
});

test("preserves caption images at an inline boundary", () => {
  expect(compile(image + "\n![Icon](icon.png) caption")).toContain(
    '<figcaption><img src="icon.png" alt="Icon"> caption</figcaption>',
  );
  expect(compile("Caption ![Icon](icon.png)\n" + image)).toContain(
    '<figcaption>Caption <img src="icon.png" alt="Icon"></figcaption>',
  );
});
