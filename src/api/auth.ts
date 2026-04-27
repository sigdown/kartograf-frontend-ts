import { http } from './client'
import type { AuthResponse, AuthUser } from '../types/auth'

export type LoginPayload = {
  login: string
  password: string
}

export type RegisterPayload = {
  username: string
  display_name: string
  email: string
  password: string
}

export async function login(payload: LoginPayload) {
  const response = await http.post<AuthResponse>('/auth/login', payload)
  return response.data
}

export async function register(payload: RegisterPayload) {
  const response = await http.post<AuthResponse>('/auth/register', payload)
  return response.data
}

export type UpdateCurrentUserPayload = {
  username?: string
  display_name?: string
  email?: string
  password?: string
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function pickUser(value: unknown): AuthUser | null {
  if (isObject(value) && 'username' in value) {
    return value as AuthUser
  }

  if (isObject(value)) {
    if (isObject(value.user)) {
      return value.user as AuthUser
    }

    if (isObject(value.data)) {
      return value.data as AuthUser
    }
  }

  return null
}

export async function updateCurrentUser(payload: UpdateCurrentUserPayload) {
  const response = await http.patch('/account', payload)
  return pickUser(response.data)
}

export async function deleteCurrentUserAccount() {
  const response = await http.delete('/account')
  return response.data
}