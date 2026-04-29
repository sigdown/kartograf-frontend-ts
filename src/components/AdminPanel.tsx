import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { getMaps } from '../api/maps'
import {
  createMapArchiveUpload,
  createMapUpload,
  deleteMap,
  finalizeMapArchiveReplacement,
  finalizeMapCreation,
  updateMapMetadata,
  uploadMapArchive,
} from '../api/admin'
import type { AuthSession } from '../types/auth'
import type { MapItem } from '../types/maps'

type AdminPanelProps = {
  session: AuthSession
  onClose: () => void
  onMapsChanged?: (preferredSlug?: string) => void
}

type AdminSection = 'overview' | 'new-map' | 'edit-map'

type MapUploadFormState = {
  slug: string
  title: string
  description: string
  year: string
  file: File | null
}

type MapMetadataFormState = {
  title: string
  description: string
  year: string
}

const initialUploadFormState: MapUploadFormState = {
  slug: '',
  title: '',
  description: '',
  year: '',
  file: null,
}

const initialMetadataFormState: MapMetadataFormState = {
  title: '',
  description: '',
  year: '',
}

function formatDebugError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseData =
      typeof error.response?.data === 'string'
        ? error.response.data
        : error.response?.data
          ? JSON.stringify(error.response.data, null, 2)
          : ''

    return [
      `message: ${error.message}`,
      error.code ? `code: ${error.code}` : '',
      error.response?.status ? `status: ${error.response.status}` : '',
      responseData ? `response: ${responseData}` : '',
    ]
      .filter(Boolean)
      .join('\n')
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}

function mapToMetadataFormState(map: MapItem): MapMetadataFormState {
  return {
    title: map.title,
    description: map.description ?? '',
    year: map.year?.toString() ?? '',
  }
}

function getMapKey(map: MapItem) {
  return map.id ?? map.slug
}

function upsertMapInList(maps: MapItem[], nextMap: MapItem) {
  const nextMaps = [...maps]
  const existingIndex = nextMaps.findIndex((map) => getMapKey(map) === getMapKey(nextMap))

  if (existingIndex === -1) {
    nextMaps.unshift(nextMap)
    return nextMaps
  }

  nextMaps[existingIndex] = {
    ...nextMaps[existingIndex],
    ...nextMap,
  }

  return nextMaps
}

export function AdminPanel({ session, onClose, onMapsChanged }: AdminPanelProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>('edit-map')
  const [uploadForm, setUploadForm] = useState<MapUploadFormState>(
    initialUploadFormState,
  )
  const [editForm, setEditForm] = useState<MapMetadataFormState>(
    initialMetadataFormState,
  )
  const [maps, setMaps] = useState<MapItem[]>([])
  const [selectedEditMapKey, setSelectedEditMapKey] = useState('')
  const [archiveFile, setArchiveFile] = useState<File | null>(null)
  const [archiveInputKey, setArchiveInputKey] = useState(0)
  const [isLoadingMaps, setIsLoadingMaps] = useState(true)
  const [mapsError, setMapsError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusTone, setStatusTone] = useState<'neutral' | 'success' | 'error'>(
    'neutral',
  )
  const [debugLog, setDebugLog] = useState<string[]>([])

  const selectedEditMap =
    maps.find((map) => getMapKey(map) === selectedEditMapKey) ?? null

  useEffect(() => {
    setStatusMessage('')
    setStatusTone('neutral')
    setDebugLog([])
  }, [activeSection])

  useEffect(() => {
    if (!maps.length) {
      setSelectedEditMapKey('')
      return
    }

    if (selectedEditMapKey && maps.some((map) => getMapKey(map) === selectedEditMapKey)) {
      return
    }

    setSelectedEditMapKey(getMapKey(maps[0]))
  }, [maps, selectedEditMapKey])

  useEffect(() => {
    if (!selectedEditMap) {
      setEditForm(initialMetadataFormState)
      return
    }

    setEditForm(mapToMetadataFormState(selectedEditMap))
  }, [selectedEditMap])

  const loadMaps = useCallback(async (preferredKey?: string) => {
    setIsLoadingMaps(true)
    setMapsError('')

    try {
      const data = await getMaps()
      setMaps(data)

      if (!data.length) {
        setSelectedEditMapKey('')
        return
      }

      setSelectedEditMapKey((current) => {
        if (preferredKey && data.some((map) => getMapKey(map) === preferredKey)) {
          return preferredKey
        }

        if (current && data.some((map) => getMapKey(map) === current)) {
          return current
        }

        return getMapKey(data[0])
      })
    } catch {
      setMaps([])
      setSelectedEditMapKey('')
      setMapsError('Не удалось загрузить карты для админки.')
    } finally {
      setIsLoadingMaps(false)
    }
  }, [])

  useEffect(() => {
    void loadMaps()
  }, [loadMaps])

  async function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!uploadForm.file) {
      setStatusTone('error')
      setStatusMessage('Выберите архив .pmtiles перед загрузкой.')
      return
    }

    const year = Number(uploadForm.year)

    if (!Number.isInteger(year)) {
      setStatusTone('error')
      setStatusMessage('Год должен быть целым числом.')
      return
    }

    setIsSubmitting(true)
    setStatusTone('neutral')
    setStatusMessage('Готовим загрузку...')
    setDebugLog([])

    try {
      const normalizedSlug = uploadForm.slug.trim()
      const normalizedTitle = uploadForm.title.trim()
      const normalizedDescription = uploadForm.description.trim()
      const mimeType = uploadForm.file.type || 'application/pmtiles'

      setDebugLog((current) => [
        ...current,
        'step: request upload URL',
        `slug: ${normalizedSlug}`,
        `title: ${normalizedTitle}`,
        `file: ${uploadForm.file?.name ?? '-'}`,
        `mime: ${mimeType}`,
      ])

      const upload = await createMapUpload({
        slug: normalizedSlug,
        title: normalizedTitle,
        description: normalizedDescription,
        year,
        archive_name: uploadForm.file.name,
        archive_mime_type: mimeType,
      })

      setDebugLog((current) => [
        ...current,
        'step: upload URL received',
        `uploadUrl: ${upload.uploadUrl}`,
        `mapId: ${upload.mapId}`,
        `archiveId: ${upload.archiveId}`,
        `storageKey: ${upload.storageKey}`,
      ])

      setStatusMessage('Загружаем архив...')
      setDebugLog((current) => [...current, 'step: PUT archive to storage'])

      await uploadMapArchive(upload.uploadUrl, uploadForm.file, mimeType)

      setStatusMessage('Завершаем создание карты...')
      setDebugLog((current) => [...current, 'step: finalize map creation'])

      await finalizeMapCreation({
        map_id: upload.mapId,
        archive_id: upload.archiveId,
        storage_key: upload.storageKey,
        slug: normalizedSlug,
        title: normalizedTitle,
        description: normalizedDescription,
        year,
      })

      setStatusTone('success')
      setStatusMessage(`Карта «${normalizedTitle}» успешно загружена.`)
      setDebugLog((current) => [...current, 'step: done'])
      setUploadForm(initialUploadFormState)
      await loadMaps(normalizedSlug)
      setSelectedEditMapKey(normalizedSlug)
      onMapsChanged?.(normalizedSlug)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось загрузить карту.'

      setStatusTone('error')
      setStatusMessage(message)
      setDebugLog((current) => [
        ...current,
        'step: failed',
        formatDebugError(error),
      ])
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedEditMap) {
      setStatusTone('error')
      setStatusMessage('Сначала выберите карту для редактирования.')
      return
    }

    const year = Number(editForm.year)

    if (!Number.isInteger(year)) {
      setStatusTone('error')
      setStatusMessage('Год должен быть целым числом.')
      return
    }

    setIsSubmitting(true)
    setStatusTone('neutral')
    setStatusMessage('Обновляем данные карты...')
    setDebugLog([])

    try {
      const mapIdentifier = selectedEditMap.id ?? selectedEditMap.slug
      const normalizedTitle = editForm.title.trim()
      const normalizedDescription = editForm.description.trim()

      setDebugLog([
        'step: patch map metadata',
        `mapIdentifier: ${mapIdentifier}`,
        `slug: ${selectedEditMap.slug}`,
        `title: ${normalizedTitle}`,
        `year: ${year}`,
      ])

      const updatedMap = await updateMapMetadata(mapIdentifier, {
        title: normalizedTitle,
        description: normalizedDescription,
        year,
      })

      if (updatedMap) {
        setMaps((current) => upsertMapInList(current, updatedMap))
        setSelectedEditMapKey(getMapKey(updatedMap))
        setEditForm(mapToMetadataFormState(updatedMap))
      }

      setStatusTone('success')
      setStatusMessage(`Карта «${normalizedTitle}» успешно обновлена.`)
      setDebugLog((current) => [
        ...current,
        'step: done',
        updatedMap ? `updatedSlug: ${updatedMap.slug}` : '',
      ].filter(Boolean))

      if (!updatedMap) {
        await loadMaps(selectedEditMapKey)
      }

      onMapsChanged?.(selectedEditMap.slug)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось обновить карту.'

      setStatusTone('error')
      setStatusMessage(message)
      setDebugLog((current) => [
        ...current,
        'step: failed',
        formatDebugError(error),
      ])
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleArchiveReplace() {
    if (!selectedEditMap) {
      setStatusTone('error')
      setStatusMessage('Сначала выберите карту для замены архива.')
      return
    }

    if (!archiveFile) {
      setStatusTone('error')
      setStatusMessage('Выберите архив .pmtiles перед заменой.')
      return
    }

    setIsSubmitting(true)
    setStatusTone('neutral')
    setStatusMessage('Готовим замену архива...')
    setDebugLog([])

    try {
      const mapIdentifier = selectedEditMap.id ?? selectedEditMap.slug
      const mimeType = archiveFile.type || 'application/pmtiles'

      setDebugLog([
        'step: request archive upload URL',
        `mapIdentifier: ${mapIdentifier}`,
        `slug: ${selectedEditMap.slug}`,
        `file: ${archiveFile.name}`,
        `mime: ${mimeType}`,
      ])

      const upload = await createMapArchiveUpload(mapIdentifier, {
        archive_name: archiveFile.name,
        archive_mime_type: mimeType,
      })

      setDebugLog((current) => [
        ...current,
        'step: upload URL received',
        `uploadUrl: ${upload.uploadUrl}`,
        `archiveId: ${upload.archiveId}`,
        `storageKey: ${upload.storageKey}`,
      ])

      setStatusMessage('Загружаем новый архив...')
      await uploadMapArchive(upload.uploadUrl, archiveFile, mimeType)

      setDebugLog((current) => [...current, 'step: finalize archive replacement'])
      setStatusMessage('Завершаем замену архива...')

      await finalizeMapArchiveReplacement(mapIdentifier, {
        archive_id: upload.archiveId,
        storage_key: upload.storageKey,
      })

      setArchiveFile(null)
      setArchiveInputKey((current) => current + 1)
      setStatusTone('success')
      setStatusMessage(`Архив для карты «${selectedEditMap.title}» успешно заменён.`)
      setDebugLog((current) => [...current, 'step: done'])
      await loadMaps(selectedEditMapKey)
      onMapsChanged?.(selectedEditMap.slug)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось заменить архив.'

      setStatusTone('error')
      setStatusMessage(message)
      setDebugLog((current) => [
        ...current,
        'step: failed',
        formatDebugError(error),
      ])
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteMap() {
    if (!selectedEditMap) {
      setStatusTone('error')
      setStatusMessage('Сначала выберите карту для удаления.')
      return
    }

    const confirmed = window.confirm(
      `Удалить карту «${selectedEditMap.title}» без возможности восстановления?`,
    )

    if (!confirmed) {
      return
    }

    setIsSubmitting(true)
    setStatusTone('neutral')
    setStatusMessage('Удаляем карту...')
    setDebugLog([])

    try {
      const mapIdentifier = selectedEditMap.id ?? selectedEditMap.slug

      setDebugLog([
        'step: delete map',
        `mapIdentifier: ${mapIdentifier}`,
        `slug: ${selectedEditMap.slug}`,
      ])

      await deleteMap(mapIdentifier)

      setArchiveFile(null)
      setArchiveInputKey((current) => current + 1)
      setStatusTone('success')
      setStatusMessage(`Карта «${selectedEditMap.title}» удалена.`)
      setDebugLog((current) => [...current, 'step: done'])
      await loadMaps()
      onMapsChanged?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось удалить карту.'

      setStatusTone('error')
      setStatusMessage(message)
      setDebugLog((current) => [
        ...current,
        'step: failed',
        formatDebugError(error),
      ])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="admin-screen">
      <div className="admin-shell">
        <aside className="admin-nav">
          <div className="admin-nav__top">
            <button type="button" className="back-link" onClick={onClose}>
              На главную
            </button>
            <p className="sidebar__eyebrow">Админка</p>
            <h1 className="admin-nav__title">Управление картами</h1>
            <p className="sidebar__text">
              Вы вошли как{' '}
              <strong>
                {session.user.display_name || session.user.username || 'admin'}
              </strong>
              .
            </p>
          </div>

          <nav className="admin-menu" aria-label="Навигация админки">
            <button
              type="button"
              className={
                activeSection === 'overview'
                  ? 'admin-menu__item is-active'
                  : 'admin-menu__item'
              }
              onClick={() => setActiveSection('overview')}
            >
              Обзор
            </button>
            <button
              type="button"
              className={
                activeSection === 'edit-map'
                  ? 'admin-menu__item is-active'
                  : 'admin-menu__item'
              }
              onClick={() => setActiveSection('edit-map')}
            >
              Редактирование
            </button>
            <button
              type="button"
              className={
                activeSection === 'new-map'
                  ? 'admin-menu__item is-active'
                  : 'admin-menu__item'
              }
              onClick={() => setActiveSection('new-map')}
            >
              Новая карта
            </button>
          </nav>
        </aside>

        <section className="admin-content">
          {activeSection === 'overview' ? (
            <div className="admin-card">
              <p className="sidebar__eyebrow">Обзор</p>
              <h2 className="admin-card__title">Рабочее пространство администратора</h2>
              <p className="sidebar__text">
                Здесь доступны загрузка новых архивов, обновление метаданных,
                замена активного архива и удаление карт.
              </p>
            </div>
          ) : null}

          {activeSection === 'edit-map' ? (
            <div className="admin-card">
              <p className="sidebar__eyebrow">Редактирование</p>
              <h2 className="admin-card__title">Данные выбранной карты</h2>
              <p className="sidebar__text">
                Выберите карту, обновите её метаданные, замените архив или удалите запись из каталога.
              </p>

              <div className="admin-form">
                <label className="auth-field">
                  <span className="auth-field__label">Карта</span>
                  <select
                    className="auth-field__input"
                    value={selectedEditMapKey}
                    onChange={(event) => setSelectedEditMapKey(event.target.value)}
                    disabled={isLoadingMaps || maps.length === 0}
                  >
                    {maps.length === 0 ? (
                      <option value="">
                        {isLoadingMaps ? 'Загружаем карты...' : 'Карты недоступны'}
                      </option>
                    ) : null}
                    {maps.map((map) => (
                      <option key={map.id ?? map.slug} value={map.id ?? map.slug}>
                        {map.title} ({map.slug})
                      </option>
                    ))}
                  </select>
                </label>

                {mapsError ? (
                  <div className="admin-status is-error">{mapsError}</div>
                ) : null}

                {selectedEditMap ? (
                  <div className="admin-map-preview">
                    <div className="admin-map-preview__meta">
                      <span>{selectedEditMap.year ?? 'Год не указан'}</span>
                      <span>{selectedEditMap.slug}</span>
                    </div>
                    <h3 className="admin-map-preview__title">{selectedEditMap.title}</h3>
                    <p className="admin-map-preview__description">
                      {selectedEditMap.description || 'Описание карты пока не заполнено.'}
                    </p>
                  </div>
                ) : null}

                <form className="admin-form" onSubmit={handleUpdateSubmit}>
                  <label className="auth-field">
                    <span className="auth-field__label">Slug</span>
                    <input
                      type="text"
                      className="auth-field__input"
                      value={selectedEditMap?.slug ?? ''}
                      readOnly
                    />
                  </label>

                  <label className="auth-field">
                    <span className="auth-field__label">Название</span>
                    <input
                      type="text"
                      className="auth-field__input"
                      value={editForm.title}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>

                  <label className="auth-field">
                    <span className="auth-field__label">Описание</span>
                    <textarea
                      className="auth-field__input auth-field__input--textarea"
                      value={editForm.description}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      rows={4}
                      required
                    />
                  </label>

                  <label className="auth-field">
                    <span className="auth-field__label">Год</span>
                    <input
                      type="number"
                      className="auth-field__input"
                      value={editForm.year}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          year: event.target.value,
                        }))
                      }
                      required
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

                  {debugLog.length > 0 ? (
                    <div className="admin-debug">
                      <p className="sidebar__label">Отладка</p>
                      <pre className="admin-debug__output">
                        {debugLog.join('\n\n')}
                      </pre>
                    </div>
                  ) : null}

                  <div className="auth-form__actions">
                    <button
                      type="submit"
                      className="entry-card__button entry-card__button--primary"
                      disabled={isSubmitting || !selectedEditMap}
                    >
                      {isSubmitting ? 'Сохраняем...' : 'Сохранить изменения'}
                    </button>
                    <button
                      type="button"
                      className="entry-card__button"
                      onClick={() =>
                        setEditForm(
                          selectedEditMap
                            ? mapToMetadataFormState(selectedEditMap)
                            : initialMetadataFormState,
                        )
                      }
                      disabled={isSubmitting || !selectedEditMap}
                    >
                      Сбросить
                    </button>
                  </div>
                </form>

                <section className="admin-subsection">
                  <div className="admin-subsection__top">
                    <div>
                      <p className="sidebar__eyebrow">Архив</p>
                      <h3 className="admin-subsection__title">Замена активного архива</h3>
                    </div>
                    <p className="sidebar__text">
                      Загрузите новый `.pmtiles`-архив для выбранной карты.
                    </p>
                  </div>

                  <label className="auth-field">
                    <span className="auth-field__label">Новый архив (.pmtiles)</span>
                    <input
                      key={archiveInputKey}
                      type="file"
                      className="auth-field__input"
                      accept=".pmtiles"
                      onChange={(event) => setArchiveFile(event.target.files?.[0] ?? null)}
                      disabled={isSubmitting || !selectedEditMap}
                    />
                  </label>

                  <div className="auth-form__actions">
                    <button
                      type="button"
                      className="entry-card__button entry-card__button--secondary"
                      onClick={() => void handleArchiveReplace()}
                      disabled={isSubmitting || !selectedEditMap || !archiveFile}
                    >
                      {isSubmitting ? 'Загружаем...' : 'Заменить архив'}
                    </button>
                  </div>
                </section>

                <section className="admin-subsection admin-subsection--danger">
                  <div className="admin-subsection__top">
                    <div>
                      <p className="sidebar__eyebrow">Опасная зона</p>
                      <h3 className="admin-subsection__title">Удаление карты</h3>
                    </div>
                    <p className="sidebar__text">
                      Карта будет удалена из каталога.
                    </p>
                  </div>

                  <div className="auth-form__actions">
                    <button
                      type="button"
                      className="entry-card__button entry-card__button--danger admin-danger-button"
                      onClick={() => void handleDeleteMap()}
                      disabled={isSubmitting || !selectedEditMap}
                    >
                      {isSubmitting ? 'Удаляем...' : 'Удалить карту'}
                    </button>
                  </div>
                </section>
              </div>
            </div>
          ) : null}

          {activeSection === 'new-map' ? (
            <div className="admin-card">
              <p className="sidebar__eyebrow">Новая карта</p>
              <h2 className="admin-card__title">Загрузка архива карты</h2>
              <p className="sidebar__text">
                Сценарий создаёт upload URL, загружает файл в storage и завершает создание карты.
              </p>

              <form className="admin-form" onSubmit={handleCreateSubmit}>
                <label className="auth-field">
                  <span className="auth-field__label">Slug</span>
                  <input
                    type="text"
                    className="auth-field__input"
                    value={uploadForm.slug}
                    onChange={(event) =>
                      setUploadForm((current) => ({
                        ...current,
                        slug: event.target.value,
                      }))
                    }
                    placeholder="old-map"
                    required
                  />
                </label>

                <label className="auth-field">
                  <span className="auth-field__label">Название</span>
                  <input
                    type="text"
                    className="auth-field__input"
                    value={uploadForm.title}
                    onChange={(event) =>
                      setUploadForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label className="auth-field">
                  <span className="auth-field__label">Описание</span>
                  <textarea
                    className="auth-field__input auth-field__input--textarea"
                    value={uploadForm.description}
                    onChange={(event) =>
                      setUploadForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    rows={4}
                    required
                  />
                </label>

                <label className="auth-field">
                  <span className="auth-field__label">Год</span>
                  <input
                    type="number"
                    className="auth-field__input"
                    value={uploadForm.year}
                    onChange={(event) =>
                      setUploadForm((current) => ({
                        ...current,
                        year: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label className="auth-field">
                  <span className="auth-field__label">Архив (.pmtiles)</span>
                  <input
                    type="file"
                    className="auth-field__input"
                    accept=".pmtiles"
                    onChange={(event) =>
                      setUploadForm((current) => ({
                        ...current,
                        file: event.target.files?.[0] ?? null,
                      }))
                    }
                    required
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

                {debugLog.length > 0 ? (
                  <div className="admin-debug">
                    <p className="sidebar__label">Отладка</p>
                    <pre className="admin-debug__output">
                      {debugLog.join('\n\n')}
                    </pre>
                  </div>
                ) : null}

                <div className="auth-form__actions">
                  <button
                    type="submit"
                    className="entry-card__button entry-card__button--primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Загружаем...' : 'Загрузить карту'}
                  </button>
                </div>
              </form>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  )
}
