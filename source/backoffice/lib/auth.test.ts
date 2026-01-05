import { clearToken, getToken, setToken } from './auth'

describe('backoffice/lib/auth', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns empty string when token is not set', () => {
    expect(getToken()).toBe('')
  })

  it('setToken + getToken roundtrip', () => {
    setToken('abc123')
    expect(getToken()).toBe('abc123')
  })

  it('clearToken removes the token', () => {
    setToken('abc123')
    clearToken()
    expect(getToken()).toBe('')
  })
})


