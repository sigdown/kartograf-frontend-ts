import { useSiteContent } from '../content/siteContent'
import type { StaticPageId } from '../screen/screenMode'

type SiteFooterProps = {
  onNavigate: (mode: StaticPageId) => void
}

export function SiteFooter({ onNavigate }: SiteFooterProps) {
  const content = useSiteContent()

  return (
    <footer className="site-footer">
      <nav className="site-footer__links" aria-label="Общие страницы">
        {content.footer.links.map((link) => (
          <a
            key={link.id}
            className="site-footer__link"
            href={`#${link.id}`}
            onClick={(event) => {
              event.preventDefault()
              onNavigate(link.id)
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  )
}