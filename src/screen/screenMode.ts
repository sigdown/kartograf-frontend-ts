const SCREEN_MODE_STORAGE_KEY = 'kartograf.screen.mode'

export type StaticPageId =
  | 'about'
  | 'sources'
  | 'licenses'
  | 'feedback'

export type ScreenMode =
  | 'home'
  | 'guest-map'
  | 'auth'
  | 'admin'
  | 'account'
  | StaticPageId

export const staticPageIds: StaticPageId[] = [
  'about',
  'sources',
  'licenses',
  'feedback',
]

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

export function isStaticPageId(value: unknown): value is StaticPageId {
  return (
    value === 'about' ||
    value === 'sources' ||
    value === 'licenses' ||
    value === 'feedback'
  )
}

export function isScreenMode(value: unknown): value is ScreenMode {
  return (
    value === 'home' ||
    value === 'guest-map' ||
    value === 'auth' ||
    value === 'admin' ||
    value === 'account' ||
    isStaticPageId(value)
  )
}

export function loadScreenMode(): ScreenMode | null {
  if (!canUseStorage()) {
    return null
  }

  const raw = window.sessionStorage.getItem(SCREEN_MODE_STORAGE_KEY)

  return isScreenMode(raw) ? raw : null
}

export function saveScreenMode(screenMode: ScreenMode) {
  if (!canUseStorage()) {
    return
  }

  window.sessionStorage.setItem(SCREEN_MODE_STORAGE_KEY, screenMode)
}