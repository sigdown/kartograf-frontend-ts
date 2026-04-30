import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getMapDownloadUrl, getMaps } from '../api/maps'
import {
  createPoint,
  deletePoint,
  getPoints,
  updatePoint,
} from '../api/points'
import { clearAuthSession, loadAuthSession } from '../auth/session'
import { useSiteContent } from '../content/siteContent'
import {
  loadScreenMode,
  saveScreenMode,
  type ScreenMode,
} from '../screen/screenMode'
import { pathToScreenMode, screenModeToPath } from '../screen/routes'
import type { AuthSession } from '../types/auth'
import type { MapItem } from '../types/maps'
import type { PointPayload, RemotePoint } from '../types/points'
import type {
  PointContextMenuState,
  PointFocusRequest,
  PointFormState,
} from '../types/mapWorkspace'
import {
  buildPointPayload,
  findPointByKey,
  getPointKey,
} from '../workspace/utils/pointUtils'
import { isSameViewport } from '../workspace/utils/viewportUtils'
import {
  loadWorkspaceState,
  saveWorkspaceState,
} from '../workspace/utils/workspaceStorage'

export function useAppController() {
  const location = useLocation()
  const navigate = useNavigate()
  const siteContent = useSiteContent()
  const [authSession, setAuthSession] = useState<AuthSession | null>(() =>
    loadAuthSession(),
  )
  const [workspace, setWorkspace] = useState(() => loadWorkspaceState())
  const [isAuthOpen, setIsAuthOpen] = useState(() => {
    const persistedScreenMode = loadScreenMode()

    return persistedScreenMode === 'auth'
  })
  const [maps, setMaps] = useState<MapItem[]>([])
  const [isLoadingMaps, setIsLoadingMaps] = useState(true)
  const [mapsError, setMapsError] = useState('')
  const [downloadError, setDownloadError] = useState('')
  const [downloadingMapKey, setDownloadingMapKey] = useState<string | null>(null)
  const [points, setPoints] = useState<RemotePoint[]>([])
  const [isLoadingPoints, setIsLoadingPoints] = useState(false)
  const [pointsError, setPointsError] = useState('')
  const [isPointsPanelOpen, setIsPointsPanelOpen] = useState(true)
  const [pointContextMenu, setPointContextMenu] =
    useState<PointContextMenuState | null>(null)
  const [activePointId, setActivePointId] = useState<string | null>(null)
  const [pointFocusRequest, setPointFocusRequest] =
    useState<PointFocusRequest | null>(null)
  const [pointFormState, setPointFormState] = useState<PointFormState | null>(null)
  const [isSubmittingPoint, setIsSubmittingPoint] = useState(false)

  const isAdmin = authSession?.user.role === 'ADMIN'
  const routeScreenMode = pathToScreenMode(location.pathname) ?? 'home'
  const screenMode: ScreenMode =
    isAuthOpen && routeScreenMode === 'home' ? 'auth' : routeScreenMode
  const effectiveScreenMode: ScreenMode =
    screenMode === 'account' && !authSession
      ? 'home'
      : screenMode === 'admin' && (!authSession || !isAdmin)
        ? 'home'
        : screenMode

  function setScreenMode(mode: ScreenMode) {
    if (mode === 'auth') {
      setIsAuthOpen(true)
      return
    }

    setIsAuthOpen(false)
    navigate(screenModeToPath(mode))
  }

  function handleLogout() {
    clearAuthSession()
    setAuthSession(null)
    setScreenMode('home')
  }

  function closeAuthDialog() {
    setIsAuthOpen(false)
  }

  useEffect(() => {
    const saveTimeoutId = window.setTimeout(() => {
      saveWorkspaceState(workspace)
    }, 120)

    return () => {
      window.clearTimeout(saveTimeoutId)
    }
  }, [workspace])

  useEffect(() => {
    void refreshMaps()
  }, [])

  useEffect(() => {
    saveScreenMode(effectiveScreenMode)
  }, [effectiveScreenMode])

  useEffect(() => {
    if (!authSession) {
      setPoints([])
      return
    }

    let isMounted = true

    async function loadInitialPoints() {
      setIsLoadingPoints(true)
      setPointsError('')

      try {
        const data = await getPoints()

        if (!isMounted) {
          return
        }

        setPoints(data)
      } catch {
        if (!isMounted) {
          return
        }

        setPoints([])
        setPointsError(siteContent.workspace.pointsLoadError)
      } finally {
        if (isMounted) {
          setIsLoadingPoints(false)
        }
      }
    }

    void loadInitialPoints()

    return () => {
      isMounted = false
    }
  }, [authSession, siteContent.workspace.pointsLoadError])

  const filteredMaps = useMemo(() => {
    const normalizedQuery = workspace.searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return maps
    }

    return maps.filter((map) => {
      const title = map.title.toLowerCase()
      const slug = map.slug.toLowerCase()
      const description = map.description?.toLowerCase() ?? ''

      return (
        title.includes(normalizedQuery) ||
        slug.includes(normalizedQuery) ||
        description.includes(normalizedQuery)
      )
    })
  }, [maps, workspace.searchQuery])

  const selectedMap = useMemo(() => {
    if (!workspace.selectedMapSlug) {
      return null
    }

    return maps.find((map) => map.slug === workspace.selectedMapSlug) ?? null
  }, [maps, workspace.selectedMapSlug])

  const activePoint = useMemo(() => {
    if (!activePointId) {
      return null
    }

    return findPointByKey(points, activePointId)
  }, [activePointId, points])

  const selectedMapTitle =
    selectedMap?.title ?? workspace.selectedMapSlug ?? siteContent.workspace.fallbackMapTitle
  const selectedMapDescription =
    selectedMap?.description ??
    (workspace.selectedMapSlug
      ? siteContent.workspace.selectedMapDescriptionTemplate.replace(
          '{slug}',
          workspace.selectedMapSlug,
        )
      : siteContent.workspace.fallbackMapDescription)

  function requestPointFocus(pointKey: string) {
    setPointFocusRequest({
      pointId: pointKey,
      nonce: Date.now(),
    })
  }

  async function refreshMaps(preferredSelectedMapSlug?: string) {
    setIsLoadingMaps(true)
    setMapsError('')

    try {
      const data = await getMaps()

      setMaps(data)
      setWorkspace((current) => {
        const nextSelectedMapSlug =
          preferredSelectedMapSlug && data.some((map) => map.slug === preferredSelectedMapSlug)
            ? preferredSelectedMapSlug
            : current.selectedMapSlug === null ||
                data.some((map) => map.slug === current.selectedMapSlug)
              ? current.selectedMapSlug
              : null

        const nextExpandedMapSlug =
          preferredSelectedMapSlug && data.some((map) => map.slug === preferredSelectedMapSlug)
            ? preferredSelectedMapSlug
            : current.expandedMapSlug === null ||
                data.some((map) => map.slug === current.expandedMapSlug)
              ? current.expandedMapSlug
              : null

        return {
          ...current,
          selectedMapSlug: nextSelectedMapSlug,
          expandedMapSlug: nextExpandedMapSlug,
        }
      })
    } catch {
      setMaps([])
      setMapsError(siteContent.workspace.mapsLoadError)
    } finally {
      setIsLoadingMaps(false)
    }
  }

  async function handleDownloadMap(map: MapItem) {
    if (!authSession || !map.id) {
      return
    }

    const mapKey = map.id ?? map.slug

    setDownloadingMapKey(mapKey)
    setDownloadError('')

    try {
      const downloadUrl = await getMapDownloadUrl(map.id)
      const link = document.createElement('a')

      link.href = downloadUrl
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.append(link)
      link.click()
      link.remove()
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : siteContent.workspace.pointDownloadError,
      )
    } finally {
      setDownloadingMapKey(null)
    }
  }

  async function loadPoints() {
    if (!authSession) {
      setPoints([])
      return
    }

    setIsLoadingPoints(true)
    setPointsError('')

    try {
      const data = await getPoints()
      setPoints(data)
    } catch {
      setPoints([])
      setPointsError(siteContent.workspace.pointsLoadError)
    } finally {
      setIsLoadingPoints(false)
    }
  }

  async function handleCreatePoint(payload: PointPayload) {
    setIsSubmittingPoint(true)

    try {
      const createdPoint = await createPoint(payload)

      if (createdPoint) {
        const pointKey = getPointKey(createdPoint)

        setPoints((current) => [createdPoint, ...current])
        setActivePointId(pointKey)
        requestPointFocus(pointKey)
      } else {
        await loadPoints()
      }

      setPointContextMenu(null)
      setPointFormState(null)
    } finally {
      setIsSubmittingPoint(false)
    }
  }

  async function handleUpdatePoint(pointId: string, payload: PointPayload) {
    setIsSubmittingPoint(true)

    try {
      const updatedPoint = await updatePoint(pointId, payload)

      if (updatedPoint) {
        const updatedPointKey = getPointKey(updatedPoint)

        setPoints((current) =>
          current.map((point) =>
            getPointKey(point) === pointId
              ? {
                  ...point,
                  ...updatedPoint,
                }
              : point,
          ),
        )
        setActivePointId(updatedPointKey)
        requestPointFocus(updatedPointKey)
      } else {
        await loadPoints()
      }

      setPointFormState(null)
    } finally {
      setIsSubmittingPoint(false)
    }
  }

  async function handleDeletePoint(point: RemotePoint) {
    const pointId = point.id

    if (!pointId) {
      return
    }

    const pointKey = getPointKey(point)

    setIsSubmittingPoint(true)

    try {
      await deletePoint(pointId)
      setPoints((current) => current.filter((item) => getPointKey(item) !== pointKey))

      if (activePointId === pointKey) {
        setActivePointId(null)
      }

      if (pointFocusRequest?.pointId === pointKey) {
        setPointFocusRequest(null)
      }

      if (pointFormState?.pointId === pointKey) {
        setPointFormState(null)
      }
    } finally {
      setIsSubmittingPoint(false)
    }
  }

  function handleCatalogCardClick(map: MapItem) {
    if (workspace.selectedMapSlug === map.slug) {
      setWorkspace((current) => ({
        ...current,
        selectedMapSlug: null,
        expandedMapSlug: null,
      }))
      return
    }

    setWorkspace((current) => ({
      ...current,
      selectedMapSlug: map.slug,
      expandedMapSlug: map.slug,
    }))
  }

  function handleViewportChange(viewport: NonNullable<typeof workspace.viewport>) {
    setWorkspace((current) =>
      isSameViewport(current.viewport, viewport)
        ? current
        : {
            ...current,
            viewport,
          },
    )
  }

  return {
    authSession,
    setAuthSession,
    workspace,
    setWorkspace,
    screenMode,
    isAuthOpen,
    closeAuthDialog,
    setScreenMode,
    effectiveScreenMode,
    isAdmin,
    maps,
    filteredMaps,
    selectedMap,
    selectedMapTitle,
    selectedMapDescription,
    isLoadingMaps,
    mapsError,
    downloadError,
    downloadingMapKey,
    points,
    isLoadingPoints,
    pointsError,
    isPointsPanelOpen,
    setIsPointsPanelOpen,
    pointContextMenu,
    setPointContextMenu,
    activePoint,
    activePointId,
    setActivePointId,
    pointFocusRequest,
    setPointFocusRequest,
    pointFormState,
    setPointFormState,
    isSubmittingPoint,
    handleLogout,
    refreshMaps,
    requestPointFocus,
    getPointKey,
    buildPointPayload,
    handleCatalogCardClick,
    handleDownloadMap,
    handleCreatePoint,
    handleUpdatePoint,
    handleDeletePoint,
    handleViewportChange,
  }
}

export type AppController = ReturnType<typeof useAppController>
