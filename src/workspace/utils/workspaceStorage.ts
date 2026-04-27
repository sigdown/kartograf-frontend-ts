import { basemapOptions, type BasemapId } from '../../config/basemaps'
import type { WorkspaceState } from '../../types/workspace'

const WORKSPACE_STORAGE_KEY = 'kartograf.workspace.state'

export const defaultWorkspaceState: WorkspaceState = {
  basemap: basemapOptions[0].id,
  selectedMapSlug: null,
  expandedMapSlug: null,
  overlayOpacity: 0.72,
  searchQuery: '',
  viewport: null,
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isBasemapId(value: unknown): value is BasemapId {
  return (
    typeof value === 'string' &&
    basemapOptions.some((option) => option.id === value)
  )
}

function normalizeWorkspaceState(value: unknown): WorkspaceState {
  if (!isObject(value)) {
    return defaultWorkspaceState
  }

  return {
    basemap: isBasemapId(value.basemap)
      ? value.basemap
      : defaultWorkspaceState.basemap,

    selectedMapSlug:
      typeof value.selectedMapSlug === 'string'
        ? value.selectedMapSlug
        : null,

    expandedMapSlug:
      typeof value.expandedMapSlug === 'string'
        ? value.expandedMapSlug
        : null,

    overlayOpacity:
      typeof value.overlayOpacity === 'number'
        ? value.overlayOpacity
        : defaultWorkspaceState.overlayOpacity,

    searchQuery:
      typeof value.searchQuery === 'string'
        ? value.searchQuery
        : defaultWorkspaceState.searchQuery,

    viewport:
      isObject(value.viewport) &&
      typeof value.viewport.lng === 'number' &&
      typeof value.viewport.lat === 'number' &&
      typeof value.viewport.zoom === 'number' &&
      typeof value.viewport.bearing === 'number' &&
      typeof value.viewport.pitch === 'number'
        ? {
            lng: value.viewport.lng,
            lat: value.viewport.lat,
            zoom: value.viewport.zoom,
            bearing: value.viewport.bearing,
            pitch: value.viewport.pitch,
          }
        : null,
  }
}

export function loadWorkspaceState(): WorkspaceState {
  if (!canUseStorage()) {
    return defaultWorkspaceState
  }

  const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY)

  if (!raw) {
    return defaultWorkspaceState
  }

  try {
    return normalizeWorkspaceState(JSON.parse(raw))
  } catch {
    window.localStorage.removeItem(WORKSPACE_STORAGE_KEY)
    return defaultWorkspaceState
  }
}

export function saveWorkspaceState(state: WorkspaceState) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(state))
}