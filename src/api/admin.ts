import axios from 'axios'
import { http } from './client'
import type { MapItem } from '../types/maps'

type CreateMapUploadPayload = {
  slug: string
  title: string
  description: string
  year: number | null
  archive_name: string
  archive_mime_type: string
}

type FinalizeMapCreationPayload = {
  map_id: string
  archive_id: string
  storage_key: string
  slug: string
  title: string
  description: string
  year: number | null
}

type CreateMapArchiveUploadPayload = {
  archive_name: string
  archive_mime_type: string
}

type FinalizeMapArchiveReplacementPayload = {
  archive_id: string
  storage_key: string
}

type UpdateMapMetadataPayload = {
  title: string
  description: string
  year: number | null
}

type UploadUrlResponse = {
  uploadUrl: string
  mapId: string
  archiveId: string
  storageKey: string
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readString(data: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = data[key]

    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }

  return ''
}

function normalizeUploadUrlResponse(data: unknown): UploadUrlResponse {
  if (!isObject(data)) {
    throw new Error('Upload URL response has invalid format.')
  }

  const uploadUrl = readString(data, [
    'upload_url',
    'uploadUrl',
    'presigned_url',
    'presignedUrl',
    'url',
  ])

  const mapId = readString(data, ['map_id', 'mapId'])
  const archiveId = readString(data, ['archive_id', 'archiveId'])
  const storageKey = readString(data, ['storage_key', 'storageKey'])

  if (!uploadUrl || !mapId || !archiveId || !storageKey) {
    throw new Error('Upload URL response is missing required fields.')
  }

  return {
    uploadUrl,
    mapId,
    archiveId,
    storageKey,
  }
}

function pickMapItem(value: unknown): MapItem | null {
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

export async function createMapUpload(payload: CreateMapUploadPayload) {
  const response = await http.post('/admin/maps/upload-url', payload)

  return normalizeUploadUrlResponse(response.data)
}

export async function uploadMapArchive(
  uploadUrl: string,
  file: File,
  mimeType: string,
) {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': mimeType,
    },
  })
}

export async function finalizeMapCreation(
  payload: FinalizeMapCreationPayload,
) {
  const response = await http.post('/admin/maps', payload)

  return response.data
}

export async function updateMapMetadata(
  mapIdentifier: string,
  payload: UpdateMapMetadataPayload,
) {
  const response = await http.patch(
    `/admin/maps/${encodeURIComponent(mapIdentifier)}`,
    payload,
  )

  return pickMapItem(response.data)
}

export async function createMapArchiveUpload(
  mapIdentifier: string,
  payload: CreateMapArchiveUploadPayload,
) {
  const response = await http.post(
    `/admin/maps/${encodeURIComponent(mapIdentifier)}/archive/upload-url`,
    payload,
  )

  return normalizeUploadUrlResponse(response.data)
}

export async function finalizeMapArchiveReplacement(
  mapIdentifier: string,
  payload: FinalizeMapArchiveReplacementPayload,
) {
  const response = await http.put(
    `/admin/maps/${encodeURIComponent(mapIdentifier)}/archive`,
    payload,
  )

  return response.data
}

export async function deleteMap(mapIdentifier: string) {
  const response = await http.delete(
    `/admin/maps/${encodeURIComponent(mapIdentifier)}`,
  )

  return response.data
}