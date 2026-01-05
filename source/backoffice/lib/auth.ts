const KEY = 'backoffice.adminToken'

export function getToken(): string {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(KEY) || ''
}

export function setToken(token: string) {
  window.localStorage.setItem(KEY, token)
}

export function clearToken() {
  window.localStorage.removeItem(KEY)
}


