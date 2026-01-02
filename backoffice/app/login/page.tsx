'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { setToken } from '@/lib/auth'

// Credenciales de prueba (TODO: cambiar a autenticación real)
const TEST_USER = 'admin'
const TEST_PASS = 'admin123'
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'f6b509373ffa88222c551d53f08deac9fd05d78896a9d21204c5bede98448304'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (user: string, pass: string) => {
    if (user === TEST_USER && pass === TEST_PASS) {
      setToken(ADMIN_TOKEN)
      router.push('/artworks')
    } else {
      setError('Usuario o contraseña incorrectos')
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    handleLogin(username.trim(), password)
  }

  const onTestLogin = () => {
    setUsername(TEST_USER)
    setPassword(TEST_PASS)
    handleLogin(TEST_USER, TEST_PASS)
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
          <button className="btn btnPrimary" type="submit" style={{ marginRight: 8 }}>
            Entrar
          </button>
          <button
            type="button"
            className="btn"
            onClick={onTestLogin}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            Usuario de Prueba
          </button>
        </form>
      </div>
    </div>
  )
}


