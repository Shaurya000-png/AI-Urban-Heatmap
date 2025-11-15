import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked to use async/await
marked.setOptions({
  async: true,
  gfm: true,
  breaks: true
});

export const renderMarkdown = async (markdown: string): Promise<string> => {
  if (!markdown) return '';
  const html = await marked(markdown);
  return DOMPurify.sanitize(html);
};

// Synchronous version for cases where you can't use async/await
export const renderMarkdownSync = (markdown: string): string => {
  if (!markdown) return '';
  // Force synchronous parsing by using marked.parse() with { async: false }
  const html = marked.parse(markdown, { async: false }) as string;
  return DOMPurify.sanitize(html);
};
