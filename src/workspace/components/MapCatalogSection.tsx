import { useSiteContent } from '../../content/siteContent'
import type { MapItem } from '../../types/maps'
import { MapCatalogCard } from './MapCatalogCard'

type MapCatalogSectionProps = {
  maps: MapItem[]
  filteredMaps: MapItem[]
  selectedMapSlug: string | null
  expandedMapSlug: string | null
  searchQuery: string
  isLoading: boolean
  mapsError: string
  downloadError: string
  downloadingMapKey: string | null
  isAuthenticated: boolean
  onSearchChange: (query: string) => void
  onCardClick: (map: MapItem) => void
  onDownload: (map: MapItem) => void
}

export function MapCatalogSection({
  maps,
  filteredMaps,
  selectedMapSlug,
  expandedMapSlug,
  searchQuery,
  isLoading,
  mapsError,
  downloadError,
  downloadingMapKey,
  isAuthenticated,
  onSearchChange,
  onCardClick,
  onDownload,
}: MapCatalogSectionProps) {
  const { workspace } = useSiteContent()

  return (
    <section className="sidebar__section">
      <p className="sidebar__label">{workspace.catalogLabel}</p>

      <label className="catalog-search">
        <span className="catalog-search__label">{workspace.catalogSearchLabel}</span>
        <input
          type="search"
          className="catalog-search__input"
          placeholder={workspace.catalogSearchPlaceholder}
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>

      {isLoading ? <p className="sidebar__text">{workspace.mapsLoading}</p> : null}

      {!isLoading && mapsError ? (
        <div className="sidebar__hint-box">
          <p className="sidebar__text">{mapsError}</p>
        </div>
      ) : null}

      {!mapsError && downloadError ? (
        <div className="sidebar__hint-box">
          <p className="sidebar__text">{downloadError}</p>
        </div>
      ) : null}

      {!isLoading && !mapsError && maps.length === 0 ? (
        <p className="sidebar__text">{workspace.mapsEmpty}</p>
      ) : null}

      {!isLoading && !mapsError && maps.length > 0 && filteredMaps.length === 0 ? (
        <p className="sidebar__text">{workspace.mapsNoResults}</p>
      ) : null}

      {!isLoading && !mapsError && filteredMaps.length > 0 ? (
        <div className="catalog-list">
          {filteredMaps.map((map) => {
            const mapKey = map.id ?? map.slug

            return (
              <MapCatalogCard
                key={mapKey}
                map={map}
                isSelected={selectedMapSlug === map.slug}
                isExpanded={expandedMapSlug === map.slug}
                isAuthenticated={isAuthenticated}
                isDownloading={downloadingMapKey === mapKey}
                onSelect={onCardClick}
                onDownload={onDownload}
              />
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
