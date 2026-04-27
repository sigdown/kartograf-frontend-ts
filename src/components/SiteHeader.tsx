import { useSiteContent } from '../content/siteContent'
import type { AuthSession } from '../types/auth'

type SiteHeaderProps = {
  authSession: AuthSession | null
  isAdmin: boolean
  onNavigate: (mode: 'home' | 'guest-map' | 'auth' | 'admin' | 'account') => void
  onLogout: () => void
}

export function SiteHeader({ authSession, isAdmin, onNavigate, onLogout }: SiteHeaderProps) {
  const content = useSiteContent()
  const header = content.header

  return (
    <header className="landing-header">
      <div className="landing-header__brand">
        <span className="landing-header__logo">{content.appName}</span>
        <span className="landing-header__note">{content.tagline}</span>
      </div>
      <div className="landing-header__actions">
        {authSession ? (
          <>
            <span className="landing-header__user" aria-label={header.currentUserAria}>
              <span className="landing-header__status-dot" aria-hidden="true" />
              <span className="landing-header__user-name">
                {authSession.user.display_name ||
                  authSession.user.username ||
                  header.defaultUserName}
              </span>
              <span className="landing-header__user-role">
                {isAdmin ? header.adminRole : header.userRole}
              </span>
            </span>
            <button
              type="button"
              className="landing-header__ghost landing-header__ghost--subtle"
              onClick={() => onNavigate('account')}
            >
              {header.profile}
            </button>
            <button
              type="button"
              className="landing-header__ghost landing-header__ghost--subtle"
              onClick={() => onNavigate('admin')}
              hidden={!isAdmin}
            >
              {header.admin}
            </button>
            <button
              type="button"
              className="landing-header__ghost landing-header__ghost--danger"
              onClick={onLogout}
            >
              {header.logout}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="landing-header__ghost landing-header__ghost--subtle"
            onClick={() => onNavigate('auth')}
          >
            {header.login}
          </button>
        )}
      </div>
    </header>
  )
}