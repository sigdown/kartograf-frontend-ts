import type { PointContextMenuState } from '../../types/mapWorkspace'

type PointContextMenuProps = {
  menu: PointContextMenuState
  onCreatePoint: () => void
}

export function PointContextMenu({
  menu,
  onCreatePoint,
}: PointContextMenuProps) {
  return (
    <div
      className="map-context-menu"
      style={{
        left: `${menu.x}px`,
        top: `${menu.y}px`,
      }}
    >
      <div className="map-context-menu__inner">
        <p className="map-context-menu__coords">
          {menu.lat.toFixed(5)}, {menu.lon.toFixed(5)}
        </p>
        <button
          type="button"
          className="map-context-menu__action"
          onClick={onCreatePoint}
        >
          Добавить точку
        </button>
      </div>
    </div>
  )
}