import type { BasemapId } from '../config/basemaps'

export type MapViewport = {
  lng: number
  lat: number
  zoom: number
  bearing: number
  pitch: number
}

export type WorkspaceState = {
  basemap: BasemapId
  selectedMapSlug: string | null
  expandedMapSlug: string | null
  overlayOpacity: number
  searchQuery: string
  viewport: MapViewport | null
}
