// rehype-color-chips.ts
import { Element } from 'hast';
import { Plugin } from 'unified';
import { Node, Parent } from 'unist';
import { visit } from 'unist-util-visit';

interface TextNode extends Node {
  type: 'text';
  value: string;
}

// Simple regex for colors
const colorRegex = /#([0-9A-Fa-f]{3})\b|#([0-9A-Fa-f]{4})\b|#([0-9A-Fa-f]{6})\b|#([0-9A-Fa-f]{8})\b|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0|1|0?\.\d+)\s*\)/g;

// Regex for escaped colors (with "\:" prefix)
const escapePrefix = "\:";

const createColorChip = (color: string): Element => ({
  type: 'element',
  tagName: 'span',
  properties: {
    style: [
      'display:inline-flex',
      'align-items:center',
      'justify-content:center',
      'white-space:nowrap',
      'font-size:inherit',
      'line-height:inherit',
      'font-family:monospace'
    ].join(';')
  },
  children: [
    {
      type: 'element',
      tagName: 'span',
      properties: {
        style: [
          'display:inline-block',
          'width:0.6em',
          'height:0.6em',
          `background-color:${color}`,
          'border:0.5px solid currentColor',
          'box-shadow:inset 0 0 0 0.5px rgba(0,0,0,0.2)',
          'border-radius:0.125em',
          'margin-right:1px',
        ].join(';')
      },
      children: []
    },
    {
      type: 'text',
      value: color
    }
  ]
});

const rehypeColorChips: Plugin = () => {
  return (tree) => {
    // First pass: replace "\:" prefixes with a unique placeholder
    const escapedColors = new Map<string, string>();
    let counter = 0;

    visit(tree, 'text', (node: TextNode) => {
      if (!node.value) return;

      // Replace escaped colors with placeholders
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

        result.push(createColorChip(color));
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
