export type BasemapId = 'vector' | 'hybrid'

export type BasemapOption = {
  id: BasemapId
  label: string
  styleUrl: string
}

export const basemapOptions: BasemapOption[] = [
  {
    id: 'vector',
    label: 'Vector',
    styleUrl: 'https://maps.kartograf.xyz/vector/style.json',
  },
  {
    id: 'hybrid',
    label: 'Hybrid',
    styleUrl: 'https://maps.kartograf.xyz/hybrid/style.json',
  },
]

export function getBasemapStyleUrl(basemapId: BasemapId) {
  const basemap = basemapOptions.find((option) => option.id === basemapId)

  if (!basemap) {
    throw new Error(`Unknown basemap id: ${basemapId}`)
  }

  return basemap.styleUrl
}