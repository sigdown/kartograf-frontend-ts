import type { BasemapId, BasemapOption } from '../../config/basemaps'

type BasemapSwitcherProps = {
  activeBasemap: BasemapId
  options: BasemapOption[]
  onChange: (basemapId: BasemapId) => void
}

export function BasemapSwitcher({
  activeBasemap,
  options,
  onChange,
}: BasemapSwitcherProps) {
  return (
    <div className="basemap-switcher" aria-label="Выбор подложки">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={
            option.id === activeBasemap
              ? 'basemap-switcher__button is-active'
              : 'basemap-switcher__button'
          }
          onClick={() => onChange(option.id)}
          aria-pressed={option.id === activeBasemap}
          aria-label={`Подложка: ${option.label}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}