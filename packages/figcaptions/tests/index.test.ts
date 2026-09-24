import { markdownToHtml } from "satteri";
import { expect, test } from "vite-plus/test";
import figcaptions from "../src/index.ts";

function compile(source: string) {
  return markdownToHtml(source, { mdastPlugins: [figcaptions()] }).html;
}
