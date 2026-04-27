import type { ReactElement } from 'react'

type MarkdownContentProps = {
  markdown: string
}

function parseInline(text: string) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g)

  return parts.map((part, index) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={`${part}-${index}`} href={part} target="_blank" rel="noreferrer">
          {part}
        </a>
      )
    }

    return part
  })
}

export function MarkdownContent({ markdown }: MarkdownContentProps) {
  const lines = markdown.split(/\r?\n/)
  const blocks: ReactElement[] = []
  let paragraph: string[] = []
  let listItems: string[] = []

  function flushParagraph() {
    if (paragraph.length === 0) {
      return
    }

    const text = paragraph.join(' ')
    blocks.push(<p key={`p-${blocks.length}`}>{parseInline(text)}</p>)
    paragraph = []
  }

  function flushList() {
    if (listItems.length === 0) {
      return
    }

    blocks.push(
      <ul key={`ul-${blocks.length}`}>
        {listItems.map((item) => (
          <li key={item}>{parseInline(item)}</li>
        ))}
      </ul>,
    )
    listItems = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      flushParagraph()
      flushList()
      continue
    }

    if (line.startsWith('### ')) {
      flushParagraph()
      flushList()
      blocks.push(<h3 key={`h3-${blocks.length}`}>{line.slice(4)}</h3>)
      continue
    }

    if (line.startsWith('## ')) {
      flushParagraph()
      flushList()
      blocks.push(<h2 key={`h2-${blocks.length}`}>{line.slice(3)}</h2>)
      continue
    }

    if (line.startsWith('# ')) {
      flushParagraph()
      flushList()
      blocks.push(<h1 key={`h1-${blocks.length}`}>{line.slice(2)}</h1>)
      continue
    }

    if (line.startsWith('- ')) {
      flushParagraph()
      listItems.push(line.slice(2))
      continue
    }

    flushList()
    paragraph.push(line)
  }

  flushParagraph()
  flushList()

  return <>{blocks}</>
}