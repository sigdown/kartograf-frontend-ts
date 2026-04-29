import { useState, type Dispatch, type SetStateAction } from 'react'
import { MapView } from '../components/MapView'
import { useSiteContent } from '../content/siteContent'
import type { AuthSession } from '../types/auth'
import type { MapItem } from '../types/maps'
import type { PointPayload, RemotePoint } from '../types/points'
import type { WorkspaceState } from '../types/workspace'
import type {
  PointContextMenuState,
  PointFocusRequest,
  PointFormState,
} from '../types/mapWorkspace'
import { ActivePointModal } from '../workspace/components/ActivePointModal'
import { PointContextMenu } from '../workspace/components/PointContextMenu'
import { PointFormModal } from '../workspace/components/PointFormModal'
import { PointsPanel } from '../workspace/components/PointsPanel'
import { WorkspaceSidebar } from '../workspace/components/WorkspaceSidebar'

type ViewportState = NonNullable<WorkspaceState['viewport']>

type MapWorkspacePageProps = {
  authSession: AuthSession | null
  workspace: WorkspaceState
  setWorkspace: Dispatch<SetStateAction<WorkspaceState>>
  selectedMap: MapItem | null
  selectedMapTitle: string
  selectedMapDescription: string
  maps: MapItem[]
  filteredMaps: MapItem[]
  isLoadingMaps: boolean
  mapsError: string
  downloadError: string
  downloadingMapKey: string | null
  points: RemotePoint[]
  isLoadingPoints: boolean
  pointsError: string
  isPointsPanelOpen: boolean
  setIsPointsPanelOpen: Dispatch<SetStateAction<boolean>>
  pointContextMenu: PointContextMenuState | null
  setPointContextMenu: Dispatch<SetStateAction<PointContextMenuState | null>>
  activePoint: RemotePoint | null
  activePointId: string | null
  setActivePointId: Dispatch<SetStateAction<string | null>>
  pointFocusRequest: PointFocusRequest | null
  pointFormState: PointFormState | null
  setPointFormState: Dispatch<SetStateAction<PointFormState | null>>
  isSubmittingPoint: boolean
  onBackToHome: () => void
  onViewportChange: (viewport: ViewportState) => void
  onPointFocusHandled: () => void
  requestPointFocus: (pointKey: string) => void
  getPointKey: (point: RemotePoint) => string
  buildPointPayload: (point: RemotePoint) => PointPayload
  handleCatalogCardClick: (map: MapItem) => void
  handleDownloadMap: (map: MapItem) => Promise<void>
  handleCreatePoint: (payload: PointPayload) => Promise<void>
  handleUpdatePoint: (pointId: string, payload: PointPayload) => Promise<void>
  handleDeletePoint: (point: RemotePoint) => Promise<void>
}

export function MapWorkspacePage({
  authSession,
  workspace,
  setWorkspace,
  selectedMap,
  selectedMapTitle,
  selectedMapDescription,
  maps,
  filteredMaps,
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
  pointFormState,
  setPointFormState,
  isSubmittingPoint,
  onBackToHome,
  onViewportChange,
  onPointFocusHandled,
  requestPointFocus,
  getPointKey,
  buildPointPayload,
  handleCatalogCardClick,
  handleDownloadMap,
  handleCreatePoint,
  handleUpdatePoint,
  handleDeletePoint,
}: MapWorkspacePageProps) {
  const { workspace: workspaceContent } = useSiteContent()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const shellClassName = [
    'app-shell',
    'app-shell--with-header',
    authSession ? '' : 'app-shell--guest',
    isSidebarOpen ? 'app-shell--sidebar-open' : 'app-shell--sidebar-closed',
    isPointsPanelOpen ? 'app-shell--points-open' : 'app-shell--points-closed',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <main className={shellClassName}>
      <MapView
        basemap={workspace.basemap}
        selectedMapSlug={workspace.selectedMapSlug}
        selectedMapOpacity={workspace.overlayOpacity}
        points={authSession ? points : []}
        initialViewport={workspace.viewport}
        activePointId={activePointId}
        draftPoint={
          pointContextMenu
            ? {
                lat: pointContextMenu.lat,
                lon: pointContextMenu.lon,
              }
            : pointFormState?.mode === 'create'
              ? {
                  lat: pointFormState.value.lat,
                  lon: pointFormState.value.lon,
                }
              : null
        }
        focusedPointId={pointFocusRequest?.pointId ?? null}
        focusRequestNonce={pointFocusRequest?.nonce}
        onMapContextMenu={(context) => {
          if (!authSession) {
            return
          }

          setPointContextMenu(context)
          setActivePointId(null)
        }}
        onMapClick={() => setPointContextMenu(null)}
        onMapInteractionStart={() => setPointContextMenu(null)}
        onViewportChange={onViewportChange}
        onPointFocusHandled={onPointFocusHandled}
        onPointSelect={(point) => {
          const pointKey = getPointKey(point)

          setPointContextMenu(null)
          setActivePointId(pointKey)
        }}
      />

      <WorkspaceSidebar
        selectedMap={selectedMap}
        selectedMapTitle={selectedMapTitle}
        selectedMapDescription={selectedMapDescription}
        maps={maps}
        filteredMaps={filteredMaps}
        selectedMapSlug={workspace.selectedMapSlug}
        expandedMapSlug={workspace.expandedMapSlug}
        searchQuery={workspace.searchQuery}
        basemap={workspace.basemap}
        overlayOpacity={workspace.overlayOpacity}
        isLoadingMaps={isLoadingMaps}
        mapsError={mapsError}
        downloadError={downloadError}
        downloadingMapKey={downloadingMapKey}
        isAuthenticated={Boolean(authSession)}
        isOpen={isSidebarOpen}
        onBackToHome={onBackToHome}
        onClose={() => setIsSidebarOpen(false)}
        onOverlayOpacityChange={(overlayOpacity) =>
          setWorkspace((current) => ({
            ...current,
            overlayOpacity,
          }))
        }
        onBasemapChange={(basemap) =>
          setWorkspace((current) => ({
            ...current,
            basemap,
          }))
        }
        onSearchChange={(searchQuery) =>
          setWorkspace((current) => ({
            ...current,
            searchQuery,
          }))
        }
        onCatalogCardClick={handleCatalogCardClick}
        onDownloadMap={(map) => void handleDownloadMap(map)}
      />

      <button
        type="button"
        className={
          isSidebarOpen
            ? 'points-panel-toggle workspace-sidebar-toggle points-panel-toggle--hidden'
            : 'points-panel-toggle workspace-sidebar-toggle'
        }
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Открыть панель настроек"
      >
        Настройки
      </button>

      {authSession ? (
        <PointsPanel
          isOpen={isPointsPanelOpen}
          points={points}
          activePointId={activePointId}
          isLoading={isLoadingPoints}
          error={pointsError}
          getPointKey={getPointKey}
          onOpen={() => setIsPointsPanelOpen(true)}
          onClose={() => setIsPointsPanelOpen(false)}
          onSelectPoint={(point) => {
            const pointKey = getPointKey(point)

            requestPointFocus(pointKey)
            setActivePointId(pointKey)
          }}
        />
      ) : null}

      {authSession && pointContextMenu ? (
        <PointContextMenu
          menu={pointContextMenu}
          onCreatePoint={() => {
            setPointContextMenu(null)
            setPointFormState({
              mode: 'create',
              value: {
                name: '',
                description: '',
                lat: pointContextMenu.lat,
                lon: pointContextMenu.lon,
              },
            })
          }}
        />
      ) : null}

      {activePoint && !pointFormState ? (
        <ActivePointModal
          point={activePoint}
          isSubmitting={isSubmittingPoint}
          onEdit={() =>
            setPointFormState({
              mode: 'edit',
              pointId: activePoint.id ?? getPointKey(activePoint),
              value: buildPointPayload(activePoint),
            })
          }
          onDelete={() => void handleDeletePoint(activePoint)}
          onClose={() => setActivePointId(null)}
        />
      ) : null}

      {pointFormState ? (
        <PointFormModal
          key={
            pointFormState.mode === 'create'
              ? `create:${pointFormState.value.lat}:${pointFormState.value.lon}`
              : `edit:${pointFormState.pointId ?? 'point'}`
          }
          title={
            pointFormState.mode === 'create'
              ? workspaceContent.pointCreateTitle
              : workspaceContent.pointEditTitle
          }
          submitLabel={workspaceContent.pointSave}
          initialValue={pointFormState.value}
          isSubmitting={isSubmittingPoint}
          onClose={() => setPointFormState(null)}
          onSubmit={(value) => {
            if (pointFormState.mode === 'create') {
              return handleCreatePoint(value)
            }

            if (pointFormState.pointId) {
              return handleUpdatePoint(pointFormState.pointId, value)
            }

            return Promise.resolve()
          }}
        />
      ) : null}
    </main>
  )
}
