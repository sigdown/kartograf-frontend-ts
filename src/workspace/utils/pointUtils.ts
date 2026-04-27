import type { PointPayload, RemotePoint } from '../../types/points'

  

export function getPointKey(point: RemotePoint) {

  return point.id ?? `${point.name}:${point.lat}:${point.lon}`

}

  

export function findPointByKey(points: RemotePoint[], pointKey: string) {

  return points.find((point) => getPointKey(point) === pointKey) ?? null

}

  

export function buildPointPayload(point: RemotePoint): PointPayload {

  return {

    name: point.name,

    description: point.description ?? '',

    lat: point.lat,

    lon: point.lon,

  }

}