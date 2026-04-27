import { useEffect, useState } from 'react'

export function useStaticPageMarkdown(markdownUrl: string, fallbackMarkdown: string) {
  const [markdown, setMarkdown] = useState(fallbackMarkdown)

  useEffect(() => {
    let isMounted = true

    async function loadMarkdown() {
      try {
        const response = await fetch(markdownUrl, {
          cache: 'no-store',
        })

        if (!response.ok) {
          setMarkdown(fallbackMarkdown)
          return
        }

        const text = await response.text()

        if (isMounted) {
          setMarkdown(text.trim() ? text : fallbackMarkdown)
        }
      } catch {
        if (isMounted) {
          setMarkdown(fallbackMarkdown)
        }
      }
    }

    setMarkdown(fallbackMarkdown)
    void loadMarkdown()

    return () => {
      isMounted = false
    }
  }, [fallbackMarkdown, markdownUrl])

  return markdown
}