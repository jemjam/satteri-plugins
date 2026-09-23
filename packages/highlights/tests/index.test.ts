import { markdownToHtml } from "satteri";
import { expect, test } from "vite-plus/test";
import highlights from "../src/index.ts";

function compile(source: string) {
  return markdownToHtml(source, { mdastPlugins: [highlights()] }).html;
}

test("marks highlights within prose and preserves text around multiple matches", () => {
  expect(compile("Before ==one==, between ==two==, after.")).toBe(
    "<p>Before <mark>one</mark>, between <mark>two</mark>, after.</p>\n",
  );
});

test("leaves incomplete and disallowed delimiter forms unchanged", () => {
  for (const source of ["==unfinished", "====", "===extra===", "==a=b==", "==a\nb=="]) {
    expect(compile(source)).toBe(markdownToHtml(source).html);
  }
});

test("documents the current escaped delimiter behavior", () => {
  expect(compile(String.raw`\==escaped==`)).toBe("<p><mark>escaped</mark></p>\n");
});

test("leaves inline and fenced code literal", () => {
  const html = compile("`==inline==`\n\n```md\n==fenced==\n```");
  expect(html).toContain("<code>==inline==</code>");
  expect(html).toContain('<pre><code class="language-md">==fenced==\n</code></pre>');
  expect(html).not.toContain("<mark>");
});

test("preserves emphasis and links containing highlights", () => {
  const html = compile("*==emphasis==* and [==link==](https://example.com)");
  expect(html).toContain("<em><mark>emphasis</mark></em>");
  expect(html).toContain('<a href="https://example.com"><mark>link</mark></a>');
});

test("does not match delimiters across inline formatting nodes", () => {
  const source = "==some *emphasis*==";
  expect(compile(source)).toBe(markdownToHtml(source).html);
});

test("preserves whitespace and escapes HTML-sensitive content inside marks", () => {
  expect(compile("==   ==")).toContain("<mark>   </mark>");
  expect(compile("==a & b==")).toContain("<mark>a &amp; b</mark>");
});

test("leaves a document without matches identical to plain compilation", () => {
  const source = "Ordinary *emphasis* and a [link](https://example.com).";
  expect(compile(source)).toBe(markdownToHtml(source).html);
});

test("does not carry state between compilations", () => {
  const source = "==first== and ==second==";
  const expected = compile(source);
  compile("No matches here.");
  expect(compile(source)).toBe(expected);
});
