import { useEffect, useMemo, useState } from 'react'
import { useSiteContent } from '../../content/siteContent'
import type { RemotePoint } from '../../types/points'

type PointsPanelProps = {
  isOpen: boolean
  isAuthenticated: boolean
  points: RemotePoint[]
  activePointId: string | null
  isLoading: boolean
  error: string
  getPointKey: (point: RemotePoint) => string
  onOpen: () => void
  onClose: () => void
  onRequestAuth: () => void
  onSelectPoint: (point: RemotePoint) => void
}

export function PointsPanel({
  isOpen,
  isAuthenticated,
  points,
  activePointId,
  isLoading,
  error,
  getPointKey,
  onOpen,
  onClose,
  onRequestAuth,
  onSelectPoint,
}: PointsPanelProps) {
  const { header, workspace } = useSiteContent()
  const pageSize = 10
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const visiblePoints = useMemo(
    () => points.slice(0, visibleCount),
    [points, visibleCount],
  )
  const canShowMore = visibleCount < points.length

  useEffect(() => {
    setVisibleCount((current) => {
      if (points.length === 0) {
        return pageSize
      }

      return Math.min(Math.max(current, pageSize), points.length)
    })
  }, [points.length])

  useEffect(() => {
    if (!activePointId) {
      return
    }

    const activeIndex = points.findIndex((point) => getPointKey(point) === activePointId)

    if (activeIndex === -1 || activeIndex < visibleCount) {
      return
    }

    setVisibleCount(activeIndex + 1)
  }, [activePointId, getPointKey, points, visibleCount])

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

          {isAuthenticated && error ? <div className="admin-status is-error">{error}</div> : null}

          {isAuthenticated && isLoading ? <p className="sidebar__text">{workspace.pointsLoading}</p> : null}

          {!isAuthenticated ? (
            <div className="points-panel__empty" aria-live="polite">
              <strong>Войдите, чтобы работать с точками</strong>
              <p className="sidebar__text">
                После входа можно добавлять точки на карте и сохранять их в аккаунт.
              </p>
              <button
                type="button"
                className="entry-card__button entry-card__button--primary"
                onClick={onRequestAuth}
              >
                {header.login}
              </button>
            </div>
          ) : null}

          {isAuthenticated && !isLoading && points.length === 0 ? (
            <div className="points-panel__empty" aria-live="polite">
              <span className="points-panel__empty-icon" aria-hidden="true">
                *
              </span>
              <strong>{workspace.pointsEmptyTitle}</strong>
              <p className="sidebar__text">{workspace.pointsEmptyText}</p>
            </div>
          ) : null}

          {isAuthenticated && !isLoading && points.length > 0 ? (
            <div className="points-panel__list">
              {visiblePoints.map((point) => {
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
                    <p className="point-row-card__preview">
                      {point.description || workspace.pointDescriptionEmpty}
                    </p>
                  </button>
                )
              })}
              {canShowMore ? (
                <button
                  type="button"
                  className="entry-card__button"
                  onClick={() => setVisibleCount((current) => Math.min(current + pageSize, points.length))}
                >
                  Показать еще
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </aside>
    </>
  )
}
