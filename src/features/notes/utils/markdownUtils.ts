// src/features/notes/utils/markdownUtils.ts

import MarkdownIt from 'markdown-it';
import markdownItMath from 'markdown-it-math';
import markdownItKatex from '@iktakahiro/markdown-it-katex';
import markdownItPrism from 'markdown-it-prism';
import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism.css';

const mdParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})
  .use(markdownItMath)
  .use(markdownItKatex)
  .use(markdownItPrism);

export function markdownToHtml(markdown: string): string {
  return mdParser.render(markdown);
}
