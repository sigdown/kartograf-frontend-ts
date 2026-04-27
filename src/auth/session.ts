import { http } from '../api/client'
import type { AuthResponse, AuthSession } from '../types/auth'

const AUTH_STORAGE_KEY = 'kartograf.auth.session'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function applyAuthToken(token: string | null) {
  if (token) {
    http.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete http.defaults.headers.common.Authorization
}

export function loadAuthSession() {
  if (!canUseStorage()) {
    return null
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const session = JSON.parse(raw) as AuthSession

    if (!session.token || !session.user) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }

    applyAuthToken(session.token)
    return session
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function saveAuthSession(data: AuthResponse) {
  const session: AuthSession = {
    ...data,
  }

  if (canUseStorage()) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  }

  applyAuthToken(session.token)
  return session
}

export function clearAuthSession() {
  if (canUseStorage()) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  applyAuthToken(null)
}