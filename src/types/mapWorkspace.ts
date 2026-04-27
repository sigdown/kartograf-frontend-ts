import type { PointPayload } from './points'

export type PointFormState = {
  mode: 'create' | 'edit'
  pointId?: string
  value: PointPayload
}

export type PointContextMenuState = {
  lat: number
  lon: number
  x: number
  y: number
}

export type PointFocusRequest = {
  pointId: string
  nonce: number
}
