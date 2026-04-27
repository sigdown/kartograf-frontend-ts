import type { RemotePoint } from '../../types/points'

type ActivePointModalProps = {
  point: RemotePoint
  isSubmitting: boolean
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

export function ActivePointModal({
  point,
  isSubmitting,
  onEdit,
  onDelete,
  onClose,
}: ActivePointModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card modal-card--narrow">
        <p className="sidebar__eyebrow">Точка</p>
        <h2 className="modal-card__title">{point.name}</h2>
        <p className="sidebar__text">
          {point.description || 'Описание не заполнено.'}
        </p>
        <p className="sidebar__text">
          {point.lat.toFixed(5)}, {point.lon.toFixed(5)}
        </p>
        <div className="auth-form__actions">
          <button
            type="button"
            className="entry-card__button entry-card__button--primary"
            onClick={onEdit}
          >
            Редактировать
          </button>
          <button
            type="button"
            className="entry-card__button entry-card__button--danger"
            onClick={onDelete}
            disabled={isSubmitting}
          >
            Удалить
          </button>
          <button
            type="button"
            className="entry-card__button"
            onClick={onClose}
          >
            Закрыть
          </button>
        </div>
      </section>
    </div>
  )
}