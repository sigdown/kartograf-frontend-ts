import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import {
  deleteCurrentUserAccount,
  updateCurrentUser,
  type UpdateCurrentUserPayload,
} from '../api/auth'
import { saveAuthSession } from '../auth/session'
import { PointFormModal } from '../workspace/components/PointFormModal'
import type { AuthSession } from '../types/auth'
import type { PointPayload, RemotePoint } from '../types/points'

type AccountPanelProps = {
  session: AuthSession
  onBack: () => void
  onSessionChange: (session: AuthSession) => void
  onAccountDeleted: () => void
  points: RemotePoint[]
  isLoadingPoints: boolean
  pointsError: string
  onViewPoint: (point: RemotePoint) => void
  onUpdatePoint: (point: RemotePoint, payload: PointPayload) => Promise<void>
  onDeletePoint: (point: RemotePoint) => Promise<void>
}

type AccountFormState = {
  username: string
  display_name: string
  email: string
  password: string
}

function extractErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : 'Не удалось выполнить запрос.'
  }

  const responseData = error.response?.data

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData
  }

  if (responseData && typeof responseData === 'object') {
    if ('message' in responseData && typeof responseData.message === 'string') {
      return responseData.message
    }

    if ('error' in responseData && typeof responseData.error === 'string') {
      return responseData.error
    }
  }

  if (error.response?.status) {
    return `Запрос завершился ошибкой. HTTP ${error.response.status}.`
  }

  return error.message || 'Не удалось выполнить запрос.'
}

function getInitialFormState(session: AuthSession): AccountFormState {
  return {
    username: session.user.username,
    display_name: session.user.display_name ?? '',
    email: session.user.email ?? '',
    password: '',
  }
}

function buildUpdatePayload(form: AccountFormState): UpdateCurrentUserPayload {
  const payload: UpdateCurrentUserPayload = {
    username: form.username.trim(),
    display_name: form.display_name.trim(),
    email: form.email.trim(),
  }

  if (form.password.trim()) {
    payload.password = form.password
  }

  return payload
}

function getPointKey(point: RemotePoint) {
  return point.id ?? `${point.name}:${point.lat}:${point.lon}`
}

export function AccountPanel({
  session,
  onBack,
  onSessionChange,
  onAccountDeleted,
  points,
  isLoadingPoints,
  pointsError,
  onViewPoint,
  onUpdatePoint,
  onDeletePoint,
}: AccountPanelProps) {
  const pageSize = 10
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [form, setForm] = useState<AccountFormState>(() =>
    getInitialFormState(session),
  )
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const [expandedPointId, setExpandedPointId] = useState<string | null>(null)
  const [editingPoint, setEditingPoint] = useState<RemotePoint | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusTone, setStatusTone] = useState<'neutral' | 'success' | 'error'>(
    'neutral',
  )
  const visiblePoints = useMemo(
    () => points.slice(0, visibleCount),
    [points, visibleCount],
  )
  const canShowMorePoints = visibleCount < points.length

  useEffect(() => {
    setVisibleCount((current) => {
      if (points.length === 0) {
        return pageSize
      }

      return Math.min(Math.max(current, pageSize), points.length)
    })
  }, [points.length])

  useEffect(() => {
    if (!expandedPointId) {
      return
    }

    const expandedIndex = points.findIndex((point) => getPointKey(point) === expandedPointId)

    if (expandedIndex === -1 || expandedIndex < visibleCount) {
      return
    }

    setVisibleCount(expandedIndex + 1)
  }, [expandedPointId, points, visibleCount])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setIsSubmitting(true)
    setStatusTone('neutral')
    setStatusMessage('Сохраняем данные аккаунта...')

    try {
      const payload = buildUpdatePayload(form)
      const updatedUser = await updateCurrentUser(payload)
      const nextSession = saveAuthSession({
        token: session.token,
        user: updatedUser
          ? {
              ...session.user,
              ...updatedUser,
            }
          : {
              ...session.user,
              username: payload.username ?? session.user.username,
              display_name: payload.display_name,
              email: payload.email,
            },
      })

      onSessionChange(nextSession)
      setStatusTone('success')
      setStatusMessage('Данные аккаунта обновлены.')
      setForm(getInitialFormState(nextSession))
      setMode('view')
    } catch (error) {
      setStatusTone('error')
      setStatusMessage(extractErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handlePointUpdate(payload: PointPayload) {
    if (!editingPoint) {
      return
    }

    await onUpdatePoint(editingPoint, payload)
    setEditingPoint(null)
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      'Удалить аккаунт без возможности восстановления?',
    )

    if (!confirmed) {
      return
    }

    setIsSubmitting(true)
    setStatusTone('neutral')
    setStatusMessage('Удаляем аккаунт...')

    try {
      await deleteCurrentUserAccount()
      onAccountDeleted()
    } catch (error) {
      setStatusTone('error')
      setStatusMessage(extractErrorMessage(error))
      setIsSubmitting(false)
    }
  }

  return (
    <main className="account-screen">
      <section className="account-shell account-shell--narrow">
        <div className="account-shell__top">
          <button type="button" className="back-link" onClick={onBack}>
            На главную
          </button>
          <p className="sidebar__eyebrow">Профиль</p>
          <h1 className="account-shell__title">
            {mode === 'view' ? 'Данные аккаунта' : 'Изменение аккаунта'}
          </h1>
          <p className="sidebar__text">
            {mode === 'view'
              ? 'Проверьте текущие данные, а затем откройте форму редактирования при необходимости.'
              : 'Измените нужные поля. Оставьте пароль пустым, если менять его не нужно.'}
          </p>
        </div>

        <article className="account-card account-card--form">
          {mode === 'view' ? (
            <>
              <dl className="account-details">
                <div className="account-details__row">
                  <dt>ID</dt>
                  <dd>{session.user.id || 'Не указан'}</dd>
                </div>
                <div className="account-details__row">
                  <dt>Username</dt>
                  <dd>{session.user.username}</dd>
                </div>
                <div className="account-details__row">
                  <dt>Отображаемое имя</dt>
                  <dd>{session.user.display_name || 'Не указано'}</dd>
                </div>
                <div className="account-details__row">
                  <dt>Email</dt>
                  <dd>{session.user.email || 'Не указан'}</dd>
                </div>
                <div className="account-details__row">
                  <dt>Роль</dt>
                  <dd>{session.user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}</dd>
                </div>
              </dl>

              {statusMessage ? (
                <div
                  className={
                    statusTone === 'success'
                      ? 'admin-status is-success'
                      : statusTone === 'error'
                        ? 'admin-status is-error'
                        : 'admin-status'
                  }
                >
                  {statusMessage}
                </div>
              ) : null}

              <div className="account-actions">
                <button
                  type="button"
                  className="account-action-button account-action-button--primary"
                  onClick={() => {
                    setForm(getInitialFormState(session))
                    setStatusMessage('')
                    setStatusTone('neutral')
                    setMode('edit')
                  }}
                  disabled={isSubmitting}
                >
                  Изменить
                </button>
              </div>
            </>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-field">
                <span className="auth-field__label">Username</span>
                <input
                  type="text"
                  className="auth-field__input"
                  value={form.username}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label className="auth-field">
                <span className="auth-field__label">Отображаемое имя</span>
                <input
                  type="text"
                  className="auth-field__input"
                  value={form.display_name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      display_name: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="auth-field">
                <span className="auth-field__label">Email</span>
                <input
                  type="email"
                  className="auth-field__input"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label className="auth-field">
                <span className="auth-field__label">Новый пароль</span>
                <input
                  type="password"
                  className="auth-field__input"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Оставьте пустым, чтобы не менять текущий пароль"
                />
              </label>

              {statusMessage ? (
                <div
                  className={
                    statusTone === 'success'
                      ? 'admin-status is-success'
                      : statusTone === 'error'
                        ? 'admin-status is-error'
                        : 'admin-status'
                  }
                >
                  {statusMessage}
                </div>
              ) : null}

              <div className="account-actions">
                <button
                  type="submit"
                  className="account-action-button account-action-button--primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Сохраняем...' : 'Сохранить'}
                </button>
                <button
                  type="button"
                  className="account-action-button"
                  onClick={() => {
                    setForm(getInitialFormState(session))
                    setStatusMessage('')
                    setStatusTone('neutral')
                    setMode('view')
                  }}
                  disabled={isSubmitting}
                >
                  Отмена
                </button>
              </div>
            </form>
          )}
        </article>

        {mode === 'view' ? (
          <article className="account-card account-danger-zone">
            <p className="sidebar__eyebrow">Опасная зона</p>
            <h2 className="account-card__title">Удаление аккаунта</h2>
            <p className="sidebar__text">
              Это действие удалит аккаунт и завершит текущую сессию.
            </p>
            <div className="account-actions">
              <button
                type="button"
                className="account-action-button account-action-button--danger"
                onClick={() => void handleDelete()}
                disabled={isSubmitting}
              >
                Удалить аккаунт
              </button>
            </div>
          </article>
        ) : null}

        {mode === 'view' ? (
          <article className="account-card account-card--form">
            <p className="sidebar__eyebrow">Точки</p>
            <h2 className="account-card__title">Сохранённые точки</h2>

            {pointsError ? (
              <div className="admin-status is-error">{pointsError}</div>
            ) : null}

            {isLoadingPoints ? (
              <p className="sidebar__text">Загружаем точки...</p>
            ) : null}

            {!isLoadingPoints && points.length === 0 ? (
              <div className="account-empty-state">
                <strong>Сохранённых точек пока нет</strong>
                <p className="sidebar__text">
                  Откройте карту и добавьте первую точку через правый клик по подложке.
                </p>
              </div>
            ) : null}

            {!isLoadingPoints && points.length > 0 ? (
              <div className="account-points-list">
                {visiblePoints.map((point) => {
                  const pointKey = getPointKey(point)
                  const isExpanded = expandedPointId === pointKey

                  return (
                    <article
                      key={pointKey}
                      className={isExpanded ? 'account-point-card is-expanded' : 'account-point-card'}
                    >
                      <button
                        type="button"
                        className="account-point-card__summary"
                        onClick={() =>
                          setExpandedPointId((current) =>
                            current === pointKey ? null : pointKey,
                          )
                        }
                      >
                        <div className="account-point-card__head">
                          <strong>{point.name}</strong>
                          <span>
                            {point.lat.toFixed(4)}, {point.lon.toFixed(4)}
                          </span>
                        </div>
                        <p>{point.description || 'Описание не заполнено.'}</p>
                      </button>

                      {isExpanded ? (
                        <div className="account-point-card__actions">
                          <button
                            type="button"
                            className="account-action-button account-action-button--primary"
                            onClick={() => onViewPoint(point)}
                          >
                            Открыть на карте
                          </button>
                          <button
                            type="button"
                            className="account-action-button"
                            onClick={() => setEditingPoint(point)}
                          >
                            Изменить
                          </button>
                          <button
                            type="button"
                            className="account-action-button account-action-button--danger"
                            onClick={() => void onDeletePoint(point)}
                          >
                            Удалить
                          </button>
                        </div>
                      ) : null}
                    </article>
                  )
                })}
                {canShowMorePoints ? (
                  <button
                    type="button"
                    className="entry-card__button"
                    onClick={() => setVisibleCount((current) => Math.min(current + pageSize, points.length))}
                  >
                    Показать ещё
                  </button>
                ) : null}
              </div>
            ) : null}
          </article>
        ) : null}
      </section>

      {editingPoint ? (
        <PointFormModal
          key={getPointKey(editingPoint)}
          title="Изменение точки"
          submitLabel="Сохранить"
          initialValue={{
            name: editingPoint.name,
            description: editingPoint.description ?? '',
            lat: editingPoint.lat,
            lon: editingPoint.lon,
          }}
          isSubmitting={isSubmitting}
          onClose={() => setEditingPoint(null)}
          onSubmit={handlePointUpdate}
        />
      ) : null}
    </main>
  )
}
