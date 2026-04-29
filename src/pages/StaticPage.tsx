import { MarkdownContent } from '../content/MarkdownContent'
import { useSiteContent } from '../content/siteContent'
import { useStaticPageMarkdown } from '../content/useStaticPageMarkdown'
import type { StaticPageId } from '../screen/screenMode'

type StaticPageProps = {
  pageId: StaticPageId
  onBack: () => void
}

export function StaticPage({ pageId, onBack }: StaticPageProps) {
  const content = useSiteContent()
  const page = content.staticPages[pageId]
  const markdown = useStaticPageMarkdown(page.markdownUrl, page.fallbackMarkdown)

  return (
    <section className="static-page">
      <div className="static-page__container">
        <button
          type="button"
          className="back-link static-page__back"
          onClick={onBack}
        >
          На главную
        </button>
        <p className="static-page__eyebrow">{page.eyebrow}</p>
        <h1 className="static-page__title">{page.title}</h1>
        <p className="static-page__intro">{page.intro}</p>

        <div className="static-page__content">
          <MarkdownContent markdown={markdown} />
        </div>

        {pageId === 'feedback' ? (
          <p className="static-page__mail">
            <a className="static-page__mail-link" href={`mailto:${content.contactEmail}?subject=${encodeURIComponent(content.feedbackSubject)}`}>
              {content.contactEmail}
            </a>
          </p>
        ) : null}
      </div>
    </section>
  )
}
