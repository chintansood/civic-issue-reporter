'use client'

export interface User {
  user_id: number
  name: string
  email: string
  phone?: string | null
  role: 'citizen' | 'staff' | 'admin'
  department_id?: number | null
  department_name?: string | null
  created_at: string
}

const TOKEN_KEY = 'civicscan_token'
const USER_KEY = 'civicscan_user'

export function setAuth(token: string, user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    // Also set document cookie for http/ssr compatibility
    document.cookie = `access_token=${token}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(USER_KEY)
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
