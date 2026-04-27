export type AuthUser = {
  id?: string
  username: string
  display_name?: string
  email?: string
  role?: string
}

export type AuthResponse = {
  token: string
  user: AuthUser
}

export type AuthSession = AuthResponse
