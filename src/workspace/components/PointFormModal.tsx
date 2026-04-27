import { useState } from 'react'
import type { PointPayload } from '../../types/points'

type PointFormModalProps = {
  title: string
  submitLabel: string
  initialValue: PointPayload
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (value: PointPayload) => void | Promise<void>
}

export function PointFormModal({
  title,
  submitLabel,
  initialValue,
  isSubmitting,
  onClose,
  onSubmit,
}: PointFormModalProps) {
  const [form, setForm] = useState<PointPayload>(initialValue)

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card modal-card--narrow">
        <p className="sidebar__eyebrow">Точка</p>
        <h2 className="modal-card__title">{title}</h2>

        <form
          className="auth-form"
          onSubmit={(event) => {
            event.preventDefault()
            void onSubmit(form)
          }}
        >
          <label className="auth-field">
            <span className="auth-field__label">Название</span>
            <input
              type="text"
              className="auth-field__input"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              required
            />
          </label>

          <label className="auth-field">
            <span className="auth-field__label">Описание</span>
            <textarea
              className="auth-field__input auth-field__input--textarea"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={4}
            />
          </label>

          <div className="point-form__coords">
            <label className="auth-field">
              <span className="auth-field__label">Широта</span>
              <input
                type="number"
                step="0.000001"
                className="auth-field__input"
                value={form.lat}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    lat: Number(event.target.value),
                  }))
                }
                required
              />
            </label>

            <label className="auth-field">
              <span className="auth-field__label">Долгота</span>
              <input
                type="number"
                step="0.000001"
                className="auth-field__input"
                value={form.lon}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    lon: Number(event.target.value),
                  }))
                }
                required
              />
            </label>
          </div>

          <div className="auth-form__actions">
            <button
              type="submit"
              className="entry-card__button entry-card__button--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Сохраняем...' : submitLabel}
            </button>
            <button
              type="button"
              className="entry-card__button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Отмена
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
