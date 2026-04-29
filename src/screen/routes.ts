import type { ScreenMode, StaticPageId } from './screenMode'

export const routes = {
  home: '/',
  view: '/view',
  account: '/account',
  admin: '/admin',
  about: '/about',
  sources: '/sources',
  licenses: '/licenses',
  feedback: '/feedback',
} as const

const staticPageIdToPath: Record<StaticPageId, string> = {
  about: routes.about,
  sources: routes.sources,
  licenses: routes.licenses,
  feedback: routes.feedback,
}

const pathToStaticPageIdMap = new Map<string, StaticPageId>(
  Object.entries(staticPageIdToPath).map(([pageId, path]) => [path, pageId as StaticPageId]),
)

export function screenModeToPath(mode: ScreenMode) {
  switch (mode) {
    case 'home':
    case 'auth':
      return routes.home
    case 'guest-map':
      return routes.view
    case 'account':
      return routes.account
    case 'admin':
      return routes.admin
    default:
      return staticPageIdToPath[mode]
  }
}

export function pathToScreenMode(pathname: string): ScreenMode | null {
  switch (pathname) {
    case routes.home:
      return 'home'
    case routes.view:
      return 'guest-map'
    case routes.account:
      return 'account'
    case routes.admin:
      return 'admin'
    default:
      return pathToStaticPageIdMap.get(pathname) ?? null
  }
}

export function pathToStaticPageId(pathname: string): StaticPageId | null {
  return pathToStaticPageIdMap.get(pathname) ?? null
}
