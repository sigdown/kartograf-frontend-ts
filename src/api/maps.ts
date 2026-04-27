import { http } from './client'
import type { MapItem } from '../types/maps'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function pickArray(value: unknown): MapItem[] {
  if (Array.isArray(value)) {
    return value as MapItem[]
  }

  if (isObject(value)) {
    if (Array.isArray(value.maps)) {
      return value.maps as MapItem[]
    }

    if (Array.isArray(value.items)) {
      return value.items as MapItem[]
    }

    if (Array.isArray(value.data)) {
      return value.data as MapItem[]
    }
  }

  return []
}

function pickItem(value: unknown): MapItem | null {
  if (isObject(value) && 'slug' in value) {
    return value as MapItem
  }

  if (isObject(value)) {
    if (isObject(value.map)) {
      return value.map as MapItem
    }

    if (isObject(value.data)) {
      return value.data as MapItem
    }
  }

  return null
}

function pickDownloadUrl(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value
  }

  if (isObject(value)) {
    const candidates = [
      value.download_url,
      value.downloadUrl,
      value.url,
      value.presigned_url,
      value.presignedUrl,
    ]

    const resolved = candidates.find(
      (candidate) => typeof candidate === 'string' && candidate.trim(),
    )

    if (typeof resolved === 'string') {
      return resolved
    }

    if (isObject(value.data)) {
      return pickDownloadUrl(value.data)
    }
  }

  throw new Error('Download URL response has invalid format.')
}

export async function getMaps() {
  const response = await http.get('/maps')
  return pickArray(response.data)
}

export async function getMapBySlug(slug: string) {
  const response = await http.get(`/maps/${slug}`)
  return pickItem(response.data)
}

export async function getMapDownloadUrl(mapId: string) {
  const response = await http.get(
    `/maps/by-id/${encodeURIComponent(mapId)}/download`,
  )

  return pickDownloadUrl(response.data)
}