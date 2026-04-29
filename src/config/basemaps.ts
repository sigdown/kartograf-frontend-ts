import { getMapsBaseUrl } from './runtimeConfig'

export type BasemapId = 'vector' | 'hybrid'

export type BasemapOption = {
  id: BasemapId
  label: string
  styleUrl: string
}

const normalizedMapsBaseUrl = getMapsBaseUrl().replace(/\/+$/, '')

export const basemapOptions: BasemapOption[] = [
  {
    id: 'vector',
    label: 'Vector',
    styleUrl: `${normalizedMapsBaseUrl}/vector/style.json`,
  },
  {
    id: 'hybrid',
    label: 'Hybrid',
    styleUrl: `${normalizedMapsBaseUrl}/hybrid/style.json`,
  },
]

export function getBasemapStyleUrl(basemapId: BasemapId) {
  const basemap = basemapOptions.find((option) => option.id === basemapId)

  if (!basemap) {
    throw new Error(`Unknown basemap id: ${basemapId}`)
  }

  return basemap.styleUrl
}
