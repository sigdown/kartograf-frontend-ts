import axios from 'axios'
import { useState } from 'react'
import { login, register } from '../api/auth'
import { saveAuthSession } from '../auth/session'
import type { AuthSession } from '../types/auth'

type AuthTab = 'login' | 'register'

type AuthDialogProps = {
  onCancel: () => void
  onSuccess: (session: AuthSession) => void
}

type ErrorInfo = {
  message: string
  details: string
}

function stringifyErrorData(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  if (value && typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return 'Не удалось сериализовать ответ с ошибкой.'
    }
  }

  return ''
}

function extractErrorInfo(error: unknown, fallback: string): ErrorInfo {
  if (!axios.isAxiosError(error)) {
    return {
      message: fallback,
      details: '',
    }
  }

  const responseData = error.response?.data
  const responsePayload = stringifyErrorData(responseData)

  if (typeof responseData === 'string' && responseData.trim()) {
    return {
      message: responseData,
      details: error.response?.status
        ? `HTTP ${error.response.status}`
        : '',
    }
  }

  if (responseData && typeof responseData === 'object') {
    const message =
      'message' in responseData && typeof responseData.message === 'string'
        ? responseData.message
        : 'error' in responseData && typeof responseData.error === 'string'
          ? responseData.error
          : null

    if (message) {
      return {
        message,
        details: responsePayload,
      }
    }
  }

  if (error.response?.status) {
    return {
      message: `${fallback} (HTTP ${error.response.status})`,
      details: responsePayload,
    }
  }

  return {
    message: 'Запрос не дошёл до сервера.',
    details:
      error.message ||
      'Возможна проблема сети, блокировка запроса или ошибка CORS.',
  }
}

export function AuthDialog({ onCancel, onSuccess }: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>('login')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null)
  const [loginForm, setLoginForm] = useState({
    login: '',
    password: '',
  })
  const [registerForm, setRegisterForm] = useState({
    username: '',
    display_name: '',
    email: '',
    password: '',
  })

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorInfo(null)

    try {
      const response = await login({
        login: loginForm.login.trim(),
        password: loginForm.password,
      })
      const session = saveAuthSession(response)
      onSuccess(session)
    } catch (error) {
      setErrorInfo(
        extractErrorInfo(
          error,
          'Не удалось войти. Проверьте логин и пароль.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRegisterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorInfo(null)

    try {
      const response = await register({
        username: registerForm.username.trim(),
        display_name: registerForm.display_name.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
      })
      const session = saveAuthSession(response)
      onSuccess(session)
    } catch (error) {
      setErrorInfo(
        extractErrorInfo(
          error,
          'Не удалось создать аккаунт. Проверьте поля формы.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-panel">
      <div className="auth-panel__box">
        <div className="auth-panel__tabs">
          <button
            type="button"
            className={activeTab === 'login' ? 'auth-tab is-active' : 'auth-tab'}
            onClick={() => setActiveTab('login')}
          >
            Вход
          </button>
          <button
            type="button"
            className={activeTab === 'register' ? 'auth-tab is-active' : 'auth-tab'}
            onClick={() => setActiveTab('register')}
          >
            Регистрация
          </button>
        </div>

        <p className="auth-placeholder__eyebrow">Доступ</p>
        <h2 className="auth-placeholder__title">
          {activeTab === 'login' ? 'Войдите в аккаунт' : 'Создайте аккаунт'}
        </h2>
        <p className="auth-placeholder__text">
          Токен хранится локально 7 дней. Обновления сессии пока нет.
        </p>

        {errorInfo ? (
          <div className="auth-panel__error-box">
            <p className="auth-panel__error">{errorInfo.message}</p>
            {errorInfo.details ? (
              <pre className="auth-panel__error-details">{errorInfo.details}</pre>
            ) : null}
          </div>
        ) : null}

        {activeTab === 'login' ? (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <label className="auth-field">
              <span className="auth-field__label">Email или username</span>
              <input
                type="text"
                className="auth-field__input"
                value={loginForm.login}
                onChange={(event) =>
                  setLoginForm((current) => ({
                    ...current,
                    login: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="auth-field">
              <span className="auth-field__label">Пароль</span>
              <input
                type="password"
                className="auth-field__input"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                required
              />
            </label>

            <div className="auth-form__actions">
              <button
                type="submit"
                className="entry-card__button entry-card__button--primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Входим...' : 'Войти'}
              </button>
              <button
                type="button"
                className="entry-card__button"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                На главную
              </button>
            </div>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <label className="auth-field">
              <span className="auth-field__label">Username</span>
              <input
                type="text"
                className="auth-field__input"
                value={registerForm.username}
                onChange={(event) =>
                  setRegisterForm((current) => ({
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
                value={registerForm.display_name}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    display_name: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="auth-field">
              <span className="auth-field__label">Email</span>
              <input
                type="email"
                className="auth-field__input"
                value={registerForm.email}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="auth-field">
              <span className="auth-field__label">Пароль</span>
              <input
                type="password"
                className="auth-field__input"
                value={registerForm.password}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                required
              />
            </label>

            <div className="auth-form__actions">
              <button
                type="submit"
                className="entry-card__button entry-card__button--primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Создаём...' : 'Создать аккаунт'}
              </button>
              <button
                type="button"
                className="entry-card__button"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                На главную
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
