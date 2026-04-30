import { useSiteContent } from '../content/siteContent'
import type { AuthSession } from '../types/auth'

type HomeScreenMode = 'home' | 'guest-map' | 'auth' | 'admin' | 'account'

type HomePageProps = {
  authSession: AuthSession | null
  isAdmin: boolean
  setScreenMode: (mode: HomeScreenMode) => void
}

export function HomePage({
  authSession,
  isAdmin,
  setScreenMode,
}: HomePageProps) {
  const content = useSiteContent()
  const home = content.home

  return (
    <>
      <section className="landing-hero">
        <div className="landing-hero__copy">
          <p className="landing-hero__eyebrow">{home.eyebrow}</p>
          <h1 className="landing-hero__title">{home.title}</h1>
          <p className="landing-hero__text">{home.text}</p>
        </div>

        <div className="landing-options">
          <article className="entry-card">
            <p className="entry-card__eyebrow">{home.mapCard.eyebrow}</p>
            <h2 className="entry-card__title">{home.mapCard.title}</h2>
            <p className="entry-card__text">
              {authSession && home.mapCard.authenticatedText
                ? home.mapCard.authenticatedText
                : home.mapCard.text}
            </p>
            <div className="entry-card__actions">
              <button
                type="button"
                className="entry-card__button entry-card__button--primary"
                onClick={() => setScreenMode('guest-map')}
              >
                {home.mapCard.primaryAction}
              </button>
              <button
                type="button"
                className="entry-card__button"
                onClick={() => setScreenMode(authSession ? 'account' : 'auth')}
              >
                {authSession ? content.header.profile : home.mapCard.secondaryAction}
              </button>
            </div>
          </article>

          <article className="entry-card">
            <p className="entry-card__eyebrow">{home.catalogCard.eyebrow}</p>
            <h2 className="entry-card__title">{home.catalogCard.title}</h2>
            <p className="entry-card__text">{home.catalogCard.text}</p>
            <div className="entry-card__actions">
              <button
                type="button"
                className="entry-card__button"
                onClick={() => setScreenMode('guest-map')}
              >
                {home.catalogCard.primaryAction}
              </button>
              {authSession ? (
                <button
                  type="button"
                  className="entry-card__button entry-card__button--secondary"
                  onClick={() => setScreenMode('account')}
                >
                  {home.catalogCard.secondaryAction ?? content.header.profile}
                </button>
              ) : null}
            </div>
          </article>

          {authSession && isAdmin ? (
            <article className="entry-card">
              <p className="entry-card__eyebrow">{home.adminCard.eyebrow}</p>
              <h2 className="entry-card__title">{home.adminCard.title}</h2>
              <p className="entry-card__text">{home.adminCard.text}</p>
              <div className="entry-card__actions">
                <button
                  type="button"
                  className="entry-card__button entry-card__button--secondary"
                  onClick={() => setScreenMode('admin')}
                >
                  {home.adminCard.primaryAction}
                </button>
              </div>
            </article>
          ) : null}
        </div>
      </section>
    </>
  )
}
