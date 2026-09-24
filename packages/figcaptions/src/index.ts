import { defineMdastPlugin, type Custom, type MdastNode, type PluginFactoryContext } from "satteri";

type Paragraph = Extract<MdastNode, { type: "paragraph" }>;
type Inline = Paragraph["children"][number];

/** Return caption children only when the boundary image occupies its own line. */
function captionFor(
  node: Readonly<Paragraph>,
  source: string,
  first: boolean,
): Inline[] | undefined {
  const image = node.children[first ? 0 : node.children.length - 1];
  const position = image?.position;
  if (
    !node.position ||
    !position ||
    (image.type !== "image" && image.type !== "imageReference") ||
    position.start.line !== position.end.line
  )
    return;

  const edge = first ? "start" : "end";
  const paragraphEdge = node.position[edge];
  const imageEdge = position[edge];
  if (
    paragraphEdge.offset === undefined ||
    imageEdge.offset === undefined ||
    paragraphEdge.line !== imageEdge.line
  )
    return;
  const padding = first
    ? source.slice(paragraphEdge.offset, imageEdge.offset)
    : source.slice(imageEdge.offset, paragraphEdge.offset);
  if (!/^[\t ]*$/.test(padding)) return;
  const imageOffset = first ? position.end.offset : position.start.offset;
  if (imageOffset === undefined) return;

  // Check the physical line in the original source. Container prefixes belong
  // to the parser; the paragraph and neighboring nodes establish the other edge.
  if (first && !/^[\t ]*(?:\\)?(?:\r\n|\r|\n)/.test(source.slice(imageOffset))) return;

  if (!first) {
    const prefix = source
      .slice(0, imageOffset)
      .split(/\r\n|\r|\n/)
      .at(-1)!;
    if (!/^[\t >]*$/.test(prefix)) return;
  }

  const children = first ? node.children.slice(1) : node.children.slice(0, -1);
  const index = first ? 0 : children.length - 1;
  const boundary = children[index];
  if (!boundary?.position) return;
  if (boundary.type === "break") {
    if (
      first
        ? boundary.position.start.line !== position.end.line
        : boundary.position.end.line !== position.start.line
    )
      return;
    children.splice(index, 1);
  } else if (boundary.type === "text") {
    const separator = first ? /^[\t ]*(?:\r\n|\r|\n)/ : /(?:\r\n|\r|\n)[\t ]*$/;
    if (!separator.test(boundary.value)) return;
    const value = boundary.value.replace(separator, "");
    if (value) children[index] = { ...boundary, value };
    else children.splice(index, 1);
  } else return;

  if (
    !children.some(
      (child) => child.type !== "break" && (child.type !== "text" || child.value.trim()),
    )
  )
    return;
  return children;
}

/** Register with `mdastPlugins: [figcaptions()]`. Markdown only; no options. */
export default function figcaptions() {
  return ({ sourceFormat }: PluginFactoryContext) =>
    sourceFormat !== "markdown"
      ? null
      : defineMdastPlugin({
          name: "figcaptions",
          options: { position: true },
          paragraph(node, ctx) {
            const after = captionFor(node, ctx.source, true);
            const before = captionFor(node, ctx.source, false);
            if ((!after && !before) || (after && before)) return;
            const caption: Custom = {
              type: "figcaption",
              data: { hName: "figcaption" },
              children: after ?? before!,
            };
            const image = node.children[after ? 0 : node.children.length - 1];
            ctx.replaceNode(node, {
              type: "figure",
              data: { hName: "figure" },
              children: after ? [image, caption] : [caption, image],
            });
          },
        });
}
