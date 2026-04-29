import { useSiteContent } from '../../content/siteContent'
import { basemapOptions } from '../../config/basemaps'
import type { BasemapId } from '../../config/basemaps'
import type { MapItem } from '../../types/maps'
import { BasemapSwitcher } from './BasemapSwitcher'
import { MapCatalogSection } from './MapCatalogSection'
import { OverlayControl } from './OverlayControl'

type WorkspaceSidebarProps = {
  selectedMap: MapItem | null
  selectedMapTitle: string
  selectedMapDescription: string
  maps: MapItem[]
  filteredMaps: MapItem[]
  selectedMapSlug: string | null
  expandedMapSlug: string | null
  searchQuery: string
  basemap: BasemapId
  overlayOpacity: number
  isLoadingMaps: boolean
  mapsError: string
  downloadError: string
  downloadingMapKey: string | null
  isAuthenticated: boolean
  isOpen: boolean
  onBackToHome: () => void
  onClose: () => void
  onOverlayOpacityChange: (opacity: number) => void
  onBasemapChange: (basemap: BasemapId) => void
  onSearchChange: (query: string) => void
  onCatalogCardClick: (map: MapItem) => void
  onDownloadMap: (map: MapItem) => void
}

export function WorkspaceSidebar({
  selectedMap,
  selectedMapTitle,
  selectedMapDescription,
  maps,
  filteredMaps,
  selectedMapSlug,
  expandedMapSlug,
  searchQuery,
  basemap,
  overlayOpacity,
  isLoadingMaps,
  mapsError,
  downloadError,
  downloadingMapKey,
  isAuthenticated,
  isOpen,
  onBackToHome,
  onClose,
  onOverlayOpacityChange,
  onBasemapChange,
  onSearchChange,
  onCatalogCardClick,
  onDownloadMap,
}: WorkspaceSidebarProps) {
  const { workspace } = useSiteContent()

  return (
    <aside className={isOpen ? 'sidebar is-open' : 'sidebar'}>
      <div className="sidebar__inner">
        <header className="sidebar__header">
          <div className="points-panel__top">
            <button
              type="button"
              className="back-link"
              onClick={onBackToHome}
            >
              {workspace.backToHome}
            </button>
            <button
              type="button"
              className="points-panel__close"
              onClick={onClose}
              aria-label="Свернуть панель настроек"
            >
              {workspace.pointsClose}
            </button>
          </div>
          <h1 className="sidebar__title">{selectedMapTitle}</h1>
          <p className="sidebar__text">{selectedMapDescription}</p>
        </header>

        <OverlayControl
          selectedMap={selectedMap}
          opacity={overlayOpacity}
          onOpacityChange={onOverlayOpacityChange}
        />

        <section className="sidebar__section">
          <p className="sidebar__label">{workspace.basemapLabel}</p>
          <BasemapSwitcher
            activeBasemap={basemap}
            options={basemapOptions}
            onChange={onBasemapChange}
          />
        </section>

        <MapCatalogSection
          maps={maps}
          filteredMaps={filteredMaps}
          selectedMapSlug={selectedMapSlug}
          expandedMapSlug={expandedMapSlug}
          searchQuery={searchQuery}
          isLoading={isLoadingMaps}
          mapsError={mapsError}
          downloadError={downloadError}
          downloadingMapKey={downloadingMapKey}
          isAuthenticated={isAuthenticated}
          onSearchChange={onSearchChange}
          onCardClick={onCatalogCardClick}
          onDownload={onDownloadMap}
        />
      </div>
    </aside>
  )
}
