import { useSiteContent } from '../../content/siteContent'
import type { MapItem } from '../../types/maps'

type MapCatalogCardProps = {
  map: MapItem
  isSelected: boolean
  isAuthenticated: boolean
  isDownloading: boolean
  onSelect: (map: MapItem) => void
  onPreview: (map: MapItem) => void
  onDownload: (map: MapItem) => void
}

export function MapCatalogCard({
  map,
  isSelected,
  isAuthenticated,
  isDownloading,
  onSelect,
  onPreview,
  onDownload,
}: MapCatalogCardProps) {
  const { workspace } = useSiteContent()
  const previewText = map.description || workspace.mapDescriptionEmpty

  return (
    <article
      className={['catalog-card', isSelected ? 'is-active' : '']
        .filter(Boolean)
        .join(' ')}
      onClick={() => onSelect(map)}
    >
      <div className="catalog-card__summary">
        <div className="catalog-card__head">
          <div className="catalog-card__title-group">
            <div className="catalog-card__meta">
              <span className="catalog-card__year">
                {map.year ?? workspace.mapYearUnknown}
              </span>
              <span className="catalog-card__slug">{map.slug}</span>
            </div>
            <h2 className="catalog-card__title">{map.title}</h2>
          </div>
        </div>
        <p className="catalog-card__preview">{previewText}</p>
      </div>
      <div className="catalog-card__actions catalog-card__actions--inline">
        <button
          type="button"
          className="entry-card__button entry-card__button--secondary"
          onClick={(event) => {
            event.stopPropagation()
            onPreview(map)
          }}
        >
          Посмотреть
        </button>
        {isAuthenticated ? (
          <button
            type="button"
            className="entry-card__button entry-card__button--secondary"
            onClick={(event) => {
              event.stopPropagation()
              onDownload(map)
            }}
            disabled={!map.id || isDownloading}
          >
            {isDownloading ? workspace.downloadPending : workspace.downloadAction}
          </button>
        ) : null}
      </div>
    </article>
  )
}
