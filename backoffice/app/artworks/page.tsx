'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearToken, getToken } from '@/lib/auth'
import type { ArtworkListResponse } from '@/lib/api'

export default function ArtworksPage() {
  const router = useRouter()
  const [data, setData] = useState<ArtworkListResponse | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace('/login')
      return
    }
    ;(async () => {
      try {
        const res = await fetch('/api/v1/admin/artworks', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as ArtworkListResponse
        setData(json)
      } catch (e: any) {
        setError(e?.message || 'Error')
      }
    })()
  }, [router])

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Obras</h1>
        <button
          className="btn"
          onClick={() => {
            clearToken()
            router.push('/login')
          }}
        >
          Salir
        </button>
      </div>

      <div className="card" style={{ marginTop: 16, padding: 12 }}>
        {error ? (
          <div style={{ color: '#ffb4b4' }}>Error: {error}</div>
        ) : !data ? (
          <div style={{ color: 'rgba(255,255,255,0.7)' }}>Cargando…</div>
        ) : (
          <>
            <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>
              Total: {data.total}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
              {data.artworks.map((a) => (
                <Link
                  key={a.id}
                  href={`/artworks/${encodeURIComponent(a.id)}`}
                  className="card"
                  style={{ padding: 12 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{a.title}</div>
                      <div style={{ opacity: 0.7, fontSize: 12 }}>{a.id}</div>
                    </div>
                    <div style={{ opacity: 0.7, fontSize: 12 }}>
                      {a.inProgress ? 'EN PROGRESO' : a.endDate ? a.endDate : ''}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}


