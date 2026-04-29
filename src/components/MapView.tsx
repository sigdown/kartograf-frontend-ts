import { useEffect, useRef } from 'react'
import maplibregl, {
  Marker,
  type Map as MapLibreMap,
} from 'maplibre-gl'
import { getBasemapStyleUrl, type BasemapId } from '../config/basemaps'
import type { RemotePoint } from '../types/points'
import type { MapViewport } from '../types/workspace'

type MapViewProps = {
  basemap: BasemapId
  selectedMapSlug?: string | null
  selectedMapOpacity?: number
  points?: RemotePoint[]
  initialViewport?: MapViewport | null
  activePointId?: string | null
  draftPoint?: {
    lat: number
    lon: number
  } | null
  focusedPointId?: string | null
  focusRequestNonce?: number
  onMapContextMenu?: (context: {
    lat: number
    lon: number
    x: number
    y: number
  }) => void
  onMapClick?: () => void
  onMapInteractionStart?: () => void
  onViewportChange?: (viewport: MapViewport) => void
  onPointFocusHandled?: () => void
  onPointSelect?: (point: RemotePoint) => void
}

const defaultCenter: [number, number] = [37.617635, 55.755814]
const defaultZoom = 10
const overlaySourceId = 'selected-map-overlay-source'
const overlayLayerId = 'selected-map-overlay-layer'
const defaultOverlayOpacity = 0.72
const overlaySourceMaxZoom = 14

function getPointKey(point: RemotePoint) {
  return point.id ?? `${point.name}:${point.lat}:${point.lon}`
}

function buildOverlayTilesUrl(slug: string) {
  return `https://maps.kartograf.xyz/old/${encodeURIComponent(slug)}/{z}/{x}/{y}.webp`
}

function buildViewportSnapshot(map: MapLibreMap): MapViewport {
  const center = map.getCenter()

  return {
    lng: center.lng,
    lat: center.lat,
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  }
}

function syncSelectedMapOverlay(
  map: MapLibreMap,
  selectedMapSlug: string | null | undefined,
  selectedMapOpacity: number,
) {
  if (!map.isStyleLoaded()) {
    return
  }

  if (map.getLayer(overlayLayerId)) {
    map.removeLayer(overlayLayerId)
  }

  if (map.getSource(overlaySourceId)) {
    map.removeSource(overlaySourceId)
  }

  if (!selectedMapSlug) {
    return
  }

  map.addSource(overlaySourceId, {
    type: 'raster',
    tiles: [buildOverlayTilesUrl(selectedMapSlug)],
    tileSize: 256,
    maxzoom: overlaySourceMaxZoom,
  })

  map.addLayer({
    id: overlayLayerId,
    type: 'raster',
    source: overlaySourceId,
    paint: {
      'raster-opacity': selectedMapOpacity,
      'raster-fade-duration': 0,
      'raster-resampling': 'linear',
    },
  })
}

export function MapView({
  basemap,
  selectedMapSlug,
  selectedMapOpacity = defaultOverlayOpacity,
  points = [],
  initialViewport,
  activePointId,
  draftPoint,
  focusedPointId,
  focusRequestNonce,
  onMapContextMenu,
  onMapClick,
  onMapInteractionStart,
  onViewportChange,
  onPointFocusHandled,
  onPointSelect,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const initialViewportRef = useRef<MapViewport | null>(initialViewport ?? null)
  const initialBasemapRef = useRef<BasemapId>(basemap)
  const activeBasemapRef = useRef<BasemapId>(basemap)
  const activeSelectedMapSlugRef = useRef<string | null>(selectedMapSlug ?? null)
  const activeSelectedMapOpacityRef = useRef<number>(selectedMapOpacity)
  const markersRef = useRef<Marker[]>([])
  const onMapContextMenuRef = useRef(onMapContextMenu)
  const onMapClickRef = useRef(onMapClick)
  const onMapInteractionStartRef = useRef(onMapInteractionStart)
  const onViewportChangeRef = useRef(onViewportChange)
  const onPointFocusHandledRef = useRef(onPointFocusHandled)
  const onPointSelectRef = useRef(onPointSelect)
  const overlaySyncRequestIdRef = useRef(0)
  const overlaySyncCleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    onMapContextMenuRef.current = onMapContextMenu
  }, [onMapContextMenu])

  useEffect(() => {
    onMapClickRef.current = onMapClick
  }, [onMapClick])

  useEffect(() => {
    onMapInteractionStartRef.current = onMapInteractionStart
  }, [onMapInteractionStart])

  useEffect(() => {
    onViewportChangeRef.current = onViewportChange
  }, [onViewportChange])

  useEffect(() => {
    onPointFocusHandledRef.current = onPointFocusHandled
  }, [onPointFocusHandled])

  useEffect(() => {
    onPointSelectRef.current = onPointSelect
  }, [onPointSelect])

  function scheduleOverlaySync(
    map: MapLibreMap,
    options?: { waitForNextStyleEvent?: boolean },
  ) {
    overlaySyncRequestIdRef.current += 1
    const requestId = overlaySyncRequestIdRef.current
    const waitForNextStyleEvent = options?.waitForNextStyleEvent ?? false

    overlaySyncCleanupRef.current?.()

    let rafId: number | null = null
    let styleEventReceived = !waitForNextStyleEvent

    const cleanup = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      map.off('style.load', onStyleUpdate)
      map.off('styledata', onStyleUpdate)
      map.off('idle', onStyleUpdate)
      if (overlaySyncCleanupRef.current === cleanup) {
        overlaySyncCleanupRef.current = null
      }
    }

    const trySync = () => {
      if (overlaySyncRequestIdRef.current !== requestId) {
        cleanup()
        return
      }

      if (!styleEventReceived) {
        return
      }

      if (map.isStyleLoaded()) {
        syncSelectedMapOverlay(
          map,
          activeSelectedMapSlugRef.current,
          activeSelectedMapOpacityRef.current,
        )
        cleanup()
        return
      }

      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          rafId = null
          trySync()
        })
      }
    }

    const onStyleUpdate = () => {
      styleEventReceived = true
      trySync()
    }

    map.on('style.load', onStyleUpdate)
    map.on('styledata', onStyleUpdate)
    map.on('idle', onStyleUpdate)
    overlaySyncCleanupRef.current = cleanup
    if (!waitForNextStyleEvent) {
      trySync()
    }
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return
    }

    const container = containerRef.current

    function preventBrowserContextMenu(event: MouseEvent) {
      event.preventDefault()
    }

    container.addEventListener('contextmenu', preventBrowserContextMenu)

    const map = new maplibregl.Map({
      container,
      style: getBasemapStyleUrl(initialBasemapRef.current),
      center: initialViewportRef.current
        ? [initialViewportRef.current.lng, initialViewportRef.current.lat]
        : defaultCenter,
      zoom: initialViewportRef.current?.zoom ?? defaultZoom,
      bearing: initialViewportRef.current?.bearing ?? 0,
      pitch: initialViewportRef.current?.pitch ?? 0,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.on('click', () => {
      onMapClickRef.current?.()
    })
    map.on('movestart', () => {
      onMapInteractionStartRef.current?.()
    })
    map.on('zoomstart', () => {
      onMapInteractionStartRef.current?.()
    })
    map.on('moveend', () => {
      onViewportChangeRef.current?.(buildViewportSnapshot(map))
    })
    map.on('contextmenu', (event) => {
      onMapContextMenuRef.current?.({
        lat: event.lngLat.lat,
        lon: event.lngLat.lng,
        x: event.point.x,
        y: event.point.y,
      })
    })
    scheduleOverlaySync(map)

    mapRef.current = map

    return () => {
      overlaySyncRequestIdRef.current += 1
      overlaySyncCleanupRef.current?.()
      container.removeEventListener('contextmenu', preventBrowserContextMenu)
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current

    if (!map || activeBasemapRef.current === basemap) {
      return
    }

    map.setStyle(getBasemapStyleUrl(basemap))
    activeBasemapRef.current = basemap
    scheduleOverlaySync(map, { waitForNextStyleEvent: true })
  }, [basemap])

  useEffect(() => {
    const map = mapRef.current
    const normalizedSlug = selectedMapSlug ?? null

    activeSelectedMapSlugRef.current = normalizedSlug

    if (!map) {
      return
    }

    scheduleOverlaySync(map)
  }, [selectedMapSlug])

  useEffect(() => {
    const map = mapRef.current

    activeSelectedMapOpacityRef.current = selectedMapOpacity

    if (!map || !map.isStyleLoaded()) {
      return
    }

    if (!map.getLayer(overlayLayerId)) {
      scheduleOverlaySync(map)
      return
    }

    map.setPaintProperty(overlayLayerId, 'raster-opacity', selectedMapOpacity)
  }, [selectedMapOpacity])

  useEffect(() => {
    const map = mapRef.current

    if (!map) {
      return
    }

    markersRef.current.forEach((marker) => marker.remove())
    const nextMarkers = points.map((point) => {
      const pointKey = getPointKey(point)
      const element = document.createElement('button')

      element.type = 'button'
      element.className =
        pointKey === activePointId
          ? 'map-point-marker map-point-marker--remote is-selected'
          : 'map-point-marker map-point-marker--remote'
      element.setAttribute(
        'aria-label',
        pointKey === activePointId
          ? `Выбранная точка: ${point.name}`
          : `Точка: ${point.name}`,
      )
      element.setAttribute(
        'aria-pressed',
        pointKey === activePointId ? 'true' : 'false',
      )
      element.dataset.pointKey = pointKey
      element.addEventListener('click', () => {
        onPointSelectRef.current?.(point)
      })

      const marker = new maplibregl.Marker({
        element,
      })
        .setLngLat([point.lon, point.lat])
        .addTo(map)

      return marker
    })

    if (draftPoint) {
      const draftElement = document.createElement('div')

      draftElement.className = 'map-point-marker map-point-marker--local'
      draftElement.setAttribute('role', 'img')
      draftElement.setAttribute('aria-label', 'Новая точка')

      nextMarkers.push(
        new maplibregl.Marker({
          element: draftElement,
        })
          .setLngLat([draftPoint.lon, draftPoint.lat])
          .addTo(map),
      )
    }

    markersRef.current = nextMarkers

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
    }
  }, [activePointId, draftPoint, points])

  useEffect(() => {
    const map = mapRef.current

    if (!map || !focusedPointId) {
      return
    }

    const point = points.find((item) => getPointKey(item) === focusedPointId)

    if (!point) {
      return
    }

    map.flyTo({
      center: [point.lon, point.lat],
      zoom: Math.max(map.getZoom(), 14),
      essential: true,
    })
    onPointFocusHandledRef.current?.()
  }, [focusRequestNonce, focusedPointId, points])

  return <div ref={containerRef} className="map-view" />
}
