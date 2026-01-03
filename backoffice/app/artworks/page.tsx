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
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [titleError, setTitleError] = useState('')
  const [creating, setCreating] = useState(false)

  const token = getToken()

  useEffect(() => {
    if (!token) {
      router.replace('/login')
      return
    }
    loadArtworks()
  }, [router, token])

  async function loadArtworks() {
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
  }

  async function checkTitleAvailability(title: string) {
    if (!title.trim()) return
    try {
      const res = await fetch(
        `/api/v1/admin/artworks/check-title?title=${encodeURIComponent(title)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.ok) {
        const { available } = await res.json()
        if (!available) {
          setTitleError('Este nombre ya existe')
        } else {
          setTitleError('')
        }
      }
    } catch {}
  }

  async function handleCreate() {
    if (!newTitle.trim() || titleError) return
    setCreating(true)
    try {
      const res = await fetch('/api/v1/admin/artworks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle.trim() }),
      })
      if (res.status === 409) {
        setTitleError('Este nombre ya existe')
        setCreating(false)
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const artwork = await res.json()
      router.push(`/artworks/${encodeURIComponent(artwork.id)}`)
    } catch (e: any) {
      setTitleError(e?.message || 'Error al crear')
      setCreating(false)
    }
  }

  function getImageUrl(artwork: { id: string; primaryImage?: string; images: string[] }) {
    const img = artwork.primaryImage || artwork.images[0]
    if (!img) return null
    return `/api/v1/artworks/${encodeURIComponent(artwork.id)}/images/${encodeURIComponent(img)}`
  }

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Obras</h1>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            + Nueva Obra
          </button>
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
      </div>

      <div className="card" style={{ marginTop: 16, padding: 12 }}>
        {error ? (
          <div style={{ color: '#ffb4b4' }}>Error: {error}</div>
        ) : !data ? (
          <div style={{ color: 'rgba(255,255,255,0.7)' }}>Cargando...</div>
        ) : (
          <>
            <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>
              Total: {data.total}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.artworks.map((a) => {
                const imgUrl = getImageUrl(a)
                return (
                  <Link
                    key={a.id}
                    href={`/artworks/${encodeURIComponent(a.id)}`}
                    className="card"
                    style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}
                  >
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 6,
                        overflow: 'hidden',
                        backgroundColor: '#1a1a1a',
                        flexShrink: 0,
                      }}
                    >
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={a.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'rgba(255,255,255,0.3)',
                            fontSize: 10,
                          }}
                        >
                          Sin imagen
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>{a.title}</div>
                      <div style={{ opacity: 0.5, fontSize: 12 }}>
                        {a.startDate || 'Sin fecha'}
                      </div>
                    </div>
                    <div style={{ opacity: 0.7, fontSize: 12, flexShrink: 0 }}>
                      {a.inProgress ? 'EN PROGRESO' : a.endDate || ''}
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>Nueva Obra</h2>
            <label>
              Nombre de la obra
              <input
                type="text"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value)
                  setTitleError('')
                }}
                onBlur={() => checkTitleAvailability(newTitle)}
                placeholder="Ingresa el nombre"
                autoFocus
              />
            </label>
            {titleError && (
              <div style={{ color: '#ff6b6b', fontSize: 12, marginTop: 4 }}>{titleError}</div>
            )}
            <div className="row" style={{ marginTop: 16, justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={!newTitle.trim() || !!titleError || creating}
              >
                {creating ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
