import type { StaticPageId } from '../screen/screenMode'

export type FooterLink = {
  id: StaticPageId
  label: string
}

export type EntryCardContent = {
  eyebrow: string
  title: string
  text: string
  authenticatedText?: string
  primaryAction: string
  secondaryAction?: string
}

export type HomeContent = {
  eyebrow: string
  title: string
  text: string
  mapCard: EntryCardContent
  catalogCard: EntryCardContent
  adminCard: EntryCardContent
}

export type StaticPageContent = {
  eyebrow: string
  title: string
  intro: string
  markdownUrl: string
  fallbackMarkdown: string
}

export type WorkspaceContent = {
  fallbackMapTitle: string
  fallbackMapDescription: string
  selectedMapDescriptionTemplate: string
  backToHome: string
  overlayLabel: string
  overlayTitle: string
  overlaySelectedTemplate: string
  overlayEmptyHint: string
  basemapLabel: string
  catalogLabel: string
  catalogSearchLabel: string
  catalogSearchPlaceholder: string
  mapsLoading: string
  mapsEmpty: string
  mapsNoResults: string
  mapYearUnknown: string
  mapDescriptionEmpty: string
  mapToggleCollapse: string
  mapToggleExpand: string
  mapToggleCollapseAria: string
  mapToggleExpandAria: string
  mapDetailYear: string
  mapDetailStatus: string
  mapStatusSelected: string
  mapStatusAvailable: string
  downloadPending: string
  downloadAction: string
  pointsToggleAria: string
  pointsToggle: string
  pointsEyebrow: string
  pointsTitle: string
  pointsClose: string
  pointsCloseAria: string
  pointsLoading: string
  pointsEmptyTitle: string
  pointsEmptyText: string
  pointDescriptionEmpty: string
  pointCreateTitle: string
  pointEditTitle: string
  pointSave: string
  pointDownloadError: string
  pointsLoadError: string
  mapsLoadError: string
}

export type HeaderContent = {
  currentUserAria: string
  defaultUserName: string
  adminRole: string
  userRole: string
  profile: string
  admin: string
  logout: string
  login: string
}

export type SiteContent = {
  appName: string
  tagline: string
  contactEmail: string
  feedbackSubject: string
  copyright: string
  header: HeaderContent
  footer: {
    links: FooterLink[]
  }
  home: HomeContent
  staticPages: Record<StaticPageId, StaticPageContent>
  workspace: WorkspaceContent
}

export type SiteContentInput = Partial<SiteContent>
