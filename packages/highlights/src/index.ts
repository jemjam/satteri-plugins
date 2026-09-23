import { defineMdastPlugin, type Custom, type MdastNode } from "satteri";

/** Turn ==highlighted text== into <mark> elements within Markdown text nodes. */
export default function highlights() {
  return defineMdastPlugin({
    name: "highlights",
    text(node, ctx) {
      const children: (MdastNode | Custom)[] = [];
      let offset = 0;

      for (const match of node.value.matchAll(/(?<!=)==([^=\n]+)==(?!=)/g)) {
        if (match.index > offset) {
          children.push({
            type: "text",
            value: node.value.slice(offset, match.index),
          });
        }

        children.push({
          type: "highlight",
          data: { hName: "mark" },
          children: [{ type: "text", value: match[1] }],
        });
        offset = match.index + match[0].length;
      }

      if (children.length === 0) return;

      if (offset < node.value.length) {
        children.push({ type: "text", value: node.value.slice(offset) });
      }

      ctx.replaceNode(node, children);
    },
  });
}
