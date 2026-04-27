export type RemotePoint = {
  id?: string
  name: string
  description?: string
  lat: number
  lon: number
  created_at?: string
  updated_at?: string
}

export type PointPayload = {
  name: string
  description: string
  lat: number
  lon: number
}