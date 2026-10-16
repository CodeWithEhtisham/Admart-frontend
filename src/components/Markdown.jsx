// Simple Markdown for blog posts: ## headings, lists, quotes, images, **bold**, *italic*, `code`
// and [links](https://...). Builds React elements (never raw HTML), so post text can't inject scripts.

const SAFE_URL = /^(https?:\/\/|mailto:|\/(?!\/))/i
const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|!?\[[^\]]*\]\([^)\s]+\))/g

function inline(text) {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) return <code key={i}>{part.slice(1, -1)}</code>
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>
    const link = part.match(/^(!?)\[([^\]]*)\]\(([^)\s]+)\)$/)
    if (link) {
      const [, image, label, url] = link
      if (!SAFE_URL.test(url)) return label
      if (image) return <img key={i} src={url} alt={label} loading="lazy" />
      const external = /^https?:/i.test(url)
      return (
        <a key={i} href={url} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {label}
        </a>
      )
    }
    return part
  })
}

/** Blocks are separated by empty lines; a block's first characters decide its type. */
export default function Markdown({ text }) {
  const blocks = (text || '').replace(/\r\n/g, '\n').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
  return blocks.map((block, i) => {
    const lines = block.split('\n')
    const heading = block.match(/^(#{1,3})\s+(.+)$/)
    if (heading && lines.length === 1) {
      const Tag = heading[1].length === 3 ? 'h3' : 'h2' // the page title is the only h1
      return <Tag key={i}>{inline(heading[2])}</Tag>
    }
    if (lines.every((l) => /^[-*]\s+/.test(l))) {
      return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^[-*]\s+/, ''))}</li>)}</ul>
    }
    if (lines.every((l) => /^\d+[.)]\s+/.test(l))) {
      return <ol key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\d+[.)]\s+/, ''))}</li>)}</ol>
    }
    if (lines.every((l) => l.startsWith('>'))) {
      return <blockquote key={i}>{inline(lines.map((l) => l.replace(/^>\s?/, '')).join(' '))}</blockquote>
    }
    const image = block.match(/^!\[[^\]]*\]\([^)\s]+\)$/)
    if (image) return <figure key={i}>{inline(block)}</figure>
    return <p key={i}>{lines.map((l, j) => [j ? <br key={`b${j}`} /> : null, ...inline(l)])}</p>
  })
}
