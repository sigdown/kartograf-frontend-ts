import { http } from './client'
import type { PointPayload, RemotePoint } from '../types/points'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function pickPoint(value: unknown): RemotePoint | null {
  if (isObject(value) && 'lat' in value && 'lon' in value) {
    return value as RemotePoint
  }

  if (isObject(value)) {
    if (isObject(value.point)) {
      return value.point as RemotePoint
    }

    if (isObject(value.data)) {
      return value.data as RemotePoint
    }
  }

  return null
}

function pickPoints(value: unknown): RemotePoint[] {
  if (Array.isArray(value)) {
    return value as RemotePoint[]
  }

  if (isObject(value)) {
    if (Array.isArray(value.points)) {
      return value.points as RemotePoint[]
    }

    if (Array.isArray(value.items)) {
      return value.items as RemotePoint[]
    }

    if (Array.isArray(value.data)) {
      return value.data as RemotePoint[]
    }
  }

  return []
}

export async function getPoints() {
  const response = await http.get('/points')
  return pickPoints(response.data)
}

export async function createPoint(payload: PointPayload) {
  const response = await http.post('/points', payload)
  return pickPoint(response.data)
}

export async function updatePoint(pointId: string, payload: PointPayload) {
  const response = await http.patch(`/points/${encodeURIComponent(pointId)}`, payload)
  return pickPoint(response.data)
}

export async function deletePoint(pointId: string) {
  const response = await http.delete(`/points/${encodeURIComponent(pointId)}`)
  return response.data
}