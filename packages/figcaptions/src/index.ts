import { defineMdastPlugin, type Custom, type MdastNode, type PluginFactoryContext } from "satteri";

type Paragraph = Extract<MdastNode, { type: "paragraph" }>;
type Inline = Paragraph["children"][number];
type Edge = "start" | "end";

const startSeparator = /^[\t ]*(?:\r\n|\r|\n)/;
const endSeparator = /(?:\r\n|\r|\n)[\t ]*$/;

function isImage(node: Inline | undefined): boolean {
  return node?.type === "image" || node?.type === "imageReference";
}

function isSeparator(node: Inline | undefined, edge: Edge): boolean {
  return (
    node?.type === "break" ||
    (node?.type === "text" && (edge === "start" ? startSeparator : endSeparator).test(node.value))
  );
}

/** Strip the boundary separator and return nonempty caption children. */
function captionChildren(node: Readonly<Paragraph>, first: boolean): Inline[] | undefined {
  const children = first ? node.children.slice(1) : node.children.slice(0, -1);
  const index = first ? 0 : children.length - 1;
  const boundary = children[index];
  if (boundary?.type === "break") {
    children.splice(index, 1);
  } else if (boundary?.type === "text") {
    const separator = first ? startSeparator : endSeparator;
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
          paragraph(node, ctx) {
            const children = node.children;
            const head = children[0];
            const tail = children.at(-1);
            const leading = isImage(head) && isSeparator(children[1], "start");
            const trailing = isImage(tail) && isSeparator(children.at(-2), "end");
            if (leading === trailing) return;

            const captionContent = captionChildren(node, leading);
            if (!captionContent) return;
            const caption: Custom = {
              type: "figcaption",
              data: { hName: "figcaption" },
              children: captionContent,
            };
            const image = leading ? head! : tail!;
            ctx.replaceNode(node, {
              type: "figure",
              data: { hName: "figure" },
              children: leading ? [image, caption] : [caption, image],
            });
          },
        });
}
