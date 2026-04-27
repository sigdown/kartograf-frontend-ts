import { useSiteContent } from '../../content/siteContent'
import type { MapItem } from '../../types/maps'

type OverlayControlProps = {
  selectedMap: MapItem | null
  opacity: number
  onOpacityChange: (opacity: number) => void
}

export function OverlayControl({
  selectedMap,
  opacity,
  onOpacityChange,
}: OverlayControlProps) {
  const { workspace } = useSiteContent()

  return (
    <section className="sidebar__section">
      <p className="sidebar__label">{workspace.overlayLabel}</p>
      <div className="overlay-control">
        <div className="overlay-control__head">
          <span className="overlay-control__title">{workspace.overlayTitle}</span>
          <span className="overlay-control__value">
            {Math.round(opacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          className="overlay-control__slider"
          min="0"
          max="1"
          step="0.01"
          value={opacity}
          onChange={(event) => onOpacityChange(Number(event.target.value))}
        />
        <p className="overlay-control__hint">
          {selectedMap
            ? workspace.overlaySelectedTemplate.replace('{title}', selectedMap.title)
            : workspace.overlayEmptyHint}
        </p>
      </div>
    </section>
  )
}