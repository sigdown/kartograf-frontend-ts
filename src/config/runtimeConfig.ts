type RuntimeConfig = {
  apiBaseUrl: string
  mapsBaseUrl: string
}

const defaultRuntimeConfig: RuntimeConfig = {
  apiBaseUrl: 'https://api.kartograf.xyz',
  mapsBaseUrl: 'https://maps.kartograf.xyz',
}

let runtimeConfig: RuntimeConfig = {
  ...defaultRuntimeConfig,
}

function normalizeBaseUrl(value: unknown, fallback: string) {
  if (typeof value !== 'string') {
    return fallback
  }

  const trimmed = value.trim()

  return trimmed || fallback
}

function readConfigEndpoints(payload: unknown): Partial<RuntimeConfig> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {}
  }

  const root = payload as Record<string, unknown>
  const endpoints = root.endpoints

  if (!endpoints || typeof endpoints !== 'object' || Array.isArray(endpoints)) {
    return {}
  }

  const endpointMap = endpoints as Record<string, unknown>

  return {
    apiBaseUrl: normalizeBaseUrl(endpointMap.apiBaseUrl, runtimeConfig.apiBaseUrl),
    mapsBaseUrl: normalizeBaseUrl(
      endpointMap.mapsBaseUrl,
      runtimeConfig.mapsBaseUrl,
    ),
  }
}

export async function loadRuntimeConfig() {
  try {
    const response = await fetch('/content/site-config.json', {
      cache: 'no-store',
    })

    if (!response.ok) {
      return
    }

    const payload = (await response.json()) as unknown
    const endpoints = readConfigEndpoints(payload)

    runtimeConfig = {
      ...runtimeConfig,
      ...endpoints,
    }
  } catch {
    // use defaults
  }
}

export function getApiBaseUrl() {
  return runtimeConfig.apiBaseUrl
}

export function getMapsBaseUrl() {
  return runtimeConfig.mapsBaseUrl
}
