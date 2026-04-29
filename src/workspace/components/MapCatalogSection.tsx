import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useSiteContent } from '../../content/siteContent'
import type { MapItem } from '../../types/maps'
import { MapCatalogCard } from './MapCatalogCard'

type MapCatalogSectionProps = {
  maps: MapItem[]
  filteredMaps: MapItem[]
  selectedMapSlug: string | null
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
  const [previewMap, setPreviewMap] = useState<MapItem | null>(null)
  const previewMapKey = previewMap ? previewMap.id ?? previewMap.slug : null
  const isPreviewDownloading = Boolean(
    previewMapKey && downloadingMapKey === previewMapKey,
  )

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
                isAuthenticated={isAuthenticated}
                isDownloading={downloadingMapKey === mapKey}
                onSelect={onCardClick}
                onPreview={setPreviewMap}
                onDownload={onDownload}
              />
            )
          })}
        </div>
      ) : null}

      {previewMap
        ? createPortal(
            <div
              className="modal-backdrop"
              role="dialog"
              aria-modal="true"
              aria-label="Детали карты"
              onClick={() => setPreviewMap(null)}
            >
              <article
                className="modal-card catalog-preview-modal"
                onClick={(event) => event.stopPropagation()}
              >
                <h2 className="modal-card__title">{previewMap.title}</h2>
                <dl className="catalog-card__details">
                  <div className="catalog-card__detail">
                    <dt>Slug</dt>
                    <dd>{previewMap.slug}</dd>
                  </div>
                  <div className="catalog-card__detail">
                    <dt>{workspace.mapDetailYear}</dt>
                    <dd>{previewMap.year ?? workspace.mapYearUnknown}</dd>
                  </div>
                  <div className="catalog-card__detail">
                    <dt>{workspace.mapDetailStatus}</dt>
                    <dd>
                      {selectedMapSlug === previewMap.slug
                        ? workspace.mapStatusSelected
                        : workspace.mapStatusAvailable}
                    </dd>
                  </div>
                </dl>
                <p className="catalog-preview-modal__description">
                  {previewMap.description || workspace.mapDescriptionEmpty}
                </p>
                <div className="catalog-card__actions catalog-card__actions--modal">
                  <button
                    type="button"
                    className="entry-card__button"
                    onClick={() => {
                      onCardClick(previewMap)
                      setPreviewMap(null)
                    }}
                  >
                    Выбрать на карте
                  </button>
                  {isAuthenticated ? (
                    <button
                      type="button"
                      className="entry-card__button entry-card__button--secondary"
                      onClick={() => onDownload(previewMap)}
                      disabled={!previewMap.id || isPreviewDownloading}
                    >
                      {isPreviewDownloading
                        ? workspace.downloadPending
                        : workspace.downloadAction}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="entry-card__button entry-card__button--secondary"
                    onClick={() => setPreviewMap(null)}
                  >
                    Закрыть
                  </button>
                </div>
              </article>
            </div>,
            document.body,
          )
        : null}
    </section>
  )
}
