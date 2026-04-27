import { useSiteContent } from '../../content/siteContent'
import type { MapItem } from '../../types/maps'

type MapCatalogCardProps = {
  map: MapItem
  isSelected: boolean
  isExpanded: boolean
  isAuthenticated: boolean
  isDownloading: boolean
  onSelect: (map: MapItem) => void
  onDownload: (map: MapItem) => void
}

export function MapCatalogCard({
  map,
  isSelected,
  isExpanded,
  isAuthenticated,
  isDownloading,
  onSelect,
  onDownload,
}: MapCatalogCardProps) {
  const { workspace } = useSiteContent()

  return (
    <article
      className={
        [
          'catalog-card',
          isSelected ? 'is-active' : '',
          isExpanded ? 'is-expanded' : '',
        ]
          .filter(Boolean)
          .join(' ')
      }
    >
      <button
        type="button"
        className="catalog-card__summary"
        onClick={() => onSelect(map)}
        aria-expanded={isExpanded}
      >
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

          <span
            className="catalog-card__toggle"
            aria-label={
              isExpanded
                ? workspace.mapToggleCollapseAria
                : workspace.mapToggleExpandAria
            }
          >
            {isExpanded ? workspace.mapToggleCollapse : workspace.mapToggleExpand}
          </span>
        </div>
        <p className="catalog-card__preview">
          {map.description || workspace.mapDescriptionEmpty}
        </p>
      </button>

      <div
        className={isExpanded ? 'catalog-card__panel is-open' : 'catalog-card__panel'}
        aria-hidden={!isExpanded}
      >
        <div className="catalog-card__panel-inner">
          <div className="catalog-card__body">
            <p className="catalog-card__description">
              {map.description || workspace.mapDescriptionEmpty}
            </p>
            <dl className="catalog-card__details">
              <div className="catalog-card__detail">
                <dt>Slug</dt>
                <dd>{map.slug}</dd>
              </div>
              <div className="catalog-card__detail">
                <dt>{workspace.mapDetailYear}</dt>
                <dd>{map.year ?? workspace.mapYearUnknown}</dd>
              </div>
              <div className="catalog-card__detail">
                <dt>{workspace.mapDetailStatus}</dt>
                <dd>{isSelected ? workspace.mapStatusSelected : workspace.mapStatusAvailable}</dd>
              </div>
            </dl>
            {isAuthenticated ? (
              <div className="catalog-card__actions">
                <button
                  type="button"
                  className="entry-card__button entry-card__button--secondary"
                  onClick={() => onDownload(map)}
                  disabled={!map.id || isDownloading}
                >
                  {isDownloading ? workspace.downloadPending : workspace.downloadAction}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
