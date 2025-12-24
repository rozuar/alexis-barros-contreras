'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { setToken } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [token, setTokenState] = useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setToken(token.trim())
    router.push('/artworks')
  }

  return (
    <div className="container">
      <div className="card" style={{ padding: 18, maxWidth: 520, margin: '40px auto' }}>
        <h1 style={{ marginTop: 0 }}>Backoffice</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>
          Ingresa el <code>ADMIN_TOKEN</code> (Bearer).
        </p>
        <form onSubmit={onSubmit}>
          <label>Token</label>
          <input
            value={token}
            onChange={(e) => setTokenState(e.target.value)}
            placeholder="pega aquí el token"
            style={{ marginTop: 8, marginBottom: 12 }}
          />
          <button className="btn btnPrimary" type="submit">
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}


