'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { setToken } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Credentials are verified server-side (/api/login). On success the server
  // sets an httpOnly session cookie; the real backend token never reaches the
  // browser. We only keep a non-secret client marker so the UI knows it's in.
  const handleLogin = async (user: string, pass: string) => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
      })
      if (res.ok) {
        setToken('1')
        router.push('/artworks')
      } else {
        setError('Usuario o contraseña incorrectos')
      }
    } catch {
      setError('No se pudo conectar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin(username.trim(), password)
  }

  return (
    <div className="container">
      <div className="card" style={{ padding: 18, maxWidth: 520, margin: '40px auto' }}>
        <h1 style={{ marginTop: 0 }}>Backoffice</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>
          Ingresa tus credenciales para acceder.
        </p>
        <form onSubmit={onSubmit}>
          <label>Usuario</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="usuario"
            style={{ marginTop: 8, marginBottom: 12 }}
          />
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="contraseña"
            style={{ marginTop: 8, marginBottom: 12 }}
          />
          {error && (
            <p style={{ color: '#ff6b6b', marginBottom: 12 }}>{error}</p>
          )}
          <button className="btn btnPrimary" type="submit" disabled={loading} style={{ marginRight: 8 }}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}


