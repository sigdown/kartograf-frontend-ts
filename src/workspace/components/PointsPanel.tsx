import { useSiteContent } from '../../content/siteContent'
import type { RemotePoint } from '../../types/points'

type PointsPanelProps = {
  isOpen: boolean
  points: RemotePoint[]
  activePointId: string | null
  isLoading: boolean
  error: string
  getPointKey: (point: RemotePoint) => string
  onOpen: () => void
  onClose: () => void
  onSelectPoint: (point: RemotePoint) => void
}

export function PointsPanel({
  isOpen,
  points,
  activePointId,
  isLoading,
  error,
  getPointKey,
  onOpen,
  onClose,
  onSelectPoint,
}: PointsPanelProps) {
  const { workspace } = useSiteContent()

  return (
    <>
      <button
        type="button"
        className={
          isOpen
            ? 'points-panel-toggle points-panel-toggle--hidden'
            : 'points-panel-toggle'
        }
        onClick={onOpen}
        aria-label={workspace.pointsToggleAria}
      >
        {workspace.pointsToggle}
      </button>

      <aside className={isOpen ? 'points-panel is-open' : 'points-panel'}>
        <div className="points-panel__inner">
          <div className="points-panel__top">
            <div>
              <p className="sidebar__eyebrow">{workspace.pointsEyebrow}</p>
              <h2 className="points-panel__title">{workspace.pointsTitle}</h2>
            </div>
            <button
              type="button"
              className="points-panel__close"
              onClick={onClose}
              aria-label={workspace.pointsCloseAria}
            >
              {workspace.pointsClose}
            </button>
          </div>

          {error ? <div className="admin-status is-error">{error}</div> : null}

          {isLoading ? <p className="sidebar__text">{workspace.pointsLoading}</p> : null}

          {!isLoading && points.length === 0 ? (
            <div className="points-panel__empty" aria-live="polite">
              <span className="points-panel__empty-icon" aria-hidden="true">
                ◌
              </span>
              <strong>{workspace.pointsEmptyTitle}</strong>
              <p className="sidebar__text">{workspace.pointsEmptyText}</p>
            </div>
          ) : null}

          {!isLoading && points.length > 0 ? (
            <div className="points-panel__list">
              {points.map((point) => {
                const pointKey = getPointKey(point)

                return (
                  <button
                    key={pointKey}
                    type="button"
                    className={
                      activePointId === pointKey
                        ? 'point-row-card is-active'
                        : 'point-row-card'
                    }
                    onClick={() => onSelectPoint(point)}
                  >
                    <div className="point-row-card__head">
                      <strong>{point.name}</strong>
                      <span>
                        {point.lat.toFixed(4)}, {point.lon.toFixed(4)}
                      </span>
                    </div>
                    <p>{point.description || workspace.pointDescriptionEmpty}</p>
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>
      </aside>
    </>
  )
}