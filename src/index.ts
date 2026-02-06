import { Element } from 'hast';
import { Plugin } from 'unified';
import { Node, Parent } from 'unist';
import { visit } from 'unist-util-visit';

interface TextNode extends Node {
  type: 'text';
  value: string;
}

interface ColorChipOptions {
  chipStyle?: Record<string, string>;
  wrapperStyle?: Record<string, string>;
}

const defaultWrapperStyle: Record<string, string> = {
  'display': 'inline-flex',
  'align-items': 'center',
  'vertical-align': 'middle',
  'white-space': 'nowrap',
  'font-size': 'inherit',
  'line-height': 'inherit',
  'font-family': 'inherit,monospace',
};

const defaultChipStyle: Record<string, string> = {
  'display': 'inline-block',
  'width': '1em',
  'height': '1em',
  'border': '0.5px solid color-mix(in srgb, currentColor 30%, transparent)',
  'box-shadow': '0 0 0.5px 0 color-mix(in srgb, currentColor 20%, transparent)',
  'border-radius': '0.175em',
  'margin-right': '0.25em',
  'vertical-align': 'middle',
  'flex-shrink': '0',
};

const styleToString = (style: Record<string, string>): string =>
  Object.entries(style).map(([k, v]) => `${k}:${v}`).join(';');

// Simple regex for colors
const colorRegex = /#([0-9A-Fa-f]{3})\b|#([0-9A-Fa-f]{4})\b|#([0-9A-Fa-f]{6})\b|#([0-9A-Fa-f]{8})\b|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0|1|0?\.\d+)\s*\)/g;

// Regex for escaped colors (with "\:" prefix)
const escapePrefix = "\:";

const createColorChip = (color: string, wrapperStyle: string, chipStyle: string): Element => ({
  type: 'element',
  tagName: 'span',
  properties: { style: wrapperStyle },
  children: [
    {
      type: 'element',
      tagName: 'span',
      properties: { style: `${chipStyle};background-color:${color}` },
      children: []
    },
    {
      type: 'text',
      value: color
    }
  ]
});

const rehypeColorChips: Plugin<[ColorChipOptions?]> = (options = {}) => {
  const wrapperStyle = styleToString({ ...defaultWrapperStyle, ...options.wrapperStyle });
  const chipStyle = styleToString({ ...defaultChipStyle, ...options.chipStyle });

  return (tree) => {
    // First pass: replace "\:" prefixes with a unique placeholder
    const escapedColors = new Map<string, string>();
    let counter = 0;

    visit(tree, 'text', (node: TextNode) => {
      if (!node.value) return;

      node.value = node.value.replace(new RegExp(escapePrefix + '(' + colorRegex.source + ')', 'g'), (_, color) => {
        const placeholder = `__ESCAPED_COLOR_${counter++}__`;
        escapedColors.set(placeholder, color);
        return placeholder;
      });
    });

    // Second pass: process normal colors
    visit(tree, 'text', (node: TextNode, index: number | null, parent: Parent | null) => {
      if (!parent || index === null || !node.value) return;

      const matches = Array.from(node.value.matchAll(colorRegex));
      if (matches.length === 0) return;

      const result: (TextNode | Element)[] = [];
      let lastIndex = 0;

      matches.forEach((match) => {
        const color = match[0];
        const startIndex = match.index!;

        if (startIndex > lastIndex) {
          result.push({
            type: 'text',
            value: node.value.slice(lastIndex, startIndex)
          });
        }

        result.push(createColorChip(color, wrapperStyle, chipStyle));
        lastIndex = startIndex + color.length;
      });

      if (lastIndex < node.value.length) {
        result.push({
          type: 'text',
          value: node.value.slice(lastIndex)
        });
      }

      parent.children.splice(index, 1, ...result);
      return index + result.length;
    });

    // Third pass: restore escaped colors
    visit(tree, 'text', (node: TextNode) => {
      if (!node.value) return;

      for (const [placeholder, color] of escapedColors.entries()) {
        node.value = node.value.replace(placeholder, color);
      }
    });
  };
};

export default rehypeColorChips;
export { defaultChipStyle, defaultWrapperStyle };
export type { ColorChipOptions };
