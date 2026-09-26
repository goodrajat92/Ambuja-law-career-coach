/**
 * A tiny, dependency-free Markdown-to-HTML renderer for note bodies.
 *
 * Notes are user-authored and rendered back as HTML in the browser, so
 * this always escapes raw HTML entities FIRST, then only re-introduces
 * markup for the small set of patterns below — never passes user input
 * through unescaped. That keeps "Markdown support" safe without adding
 * a markdown-parser dependency for what is, deliberately, a small format.
 *
 * Supports: # / ## / ### headings, **bold**, *italic*, `code`,
 * [text](url) links, - / * bullet lists, 1. numbered lists, and
 * paragraphs (blank-line separated).
 */
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderInline(s: string): string {
  return s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

export function renderMarkdown(source: string): string {
  const escaped = escapeHtml(source);
  const lines = escaped.split(/\r?\n/);
  const html: string[] = [];
  let list: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let para: string[] = [];

  function flushPara() {
    if (para.length) {
      html.push(`<p>${renderInline(para.join(' '))}</p>`);
      para = [];
    }
  }
  function flushList() {
    if (list) {
      const tag = list.type;
      html.push(`<${tag}>${list.items.map((i) => `<li>${renderInline(i)}</li>`).join('')}</${tag}>`);
      list = null;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    const bullet = line.match(/^[-*]\s+(.*)$/);
    const numbered = line.match(/^\d+\.\s+(.*)$/);

    if (heading) {
      flushPara();
      flushList();
      const level = heading[1].length;
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
    } else if (bullet) {
      flushPara();
      if (!list || list.type !== 'ul') {
        flushList();
        list = { type: 'ul', items: [] };
      }
      list.items.push(bullet[1]);
    } else if (numbered) {
      flushPara();
      if (!list || list.type !== 'ol') {
        flushList();
        list = { type: 'ol', items: [] };
      }
      list.items.push(numbered[1]);
    } else if (line === '') {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();

  return html.join('\n');
}

/** A short plain-text excerpt (headings/markup stripped), for list previews. */
export function excerpt(source: string, maxLength = 140): string {
  const plain = source
    .replace(/[#*`_>-]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > maxLength ? `${plain.slice(0, maxLength).trimEnd()}…` : plain;
}
