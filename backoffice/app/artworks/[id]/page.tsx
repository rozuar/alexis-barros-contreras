'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getToken } from '@/lib/auth'
import type { AdminUpdate, Artwork } from '@/lib/api'

export default function ArtworkEditPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = useMemo(() => decodeURIComponent(params.id), [params.id])

  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [form, setForm] = useState<AdminUpdate>({
    paintedLocation: '',
    startDate: '',
    endDate: '',
    inProgress: false,
    detalle: '',
    bitacora: '',
  })
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace('/login')
      return
    }
    ;(async () => {
      const res = await fetch(`/api/v1/admin/artworks/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        setStatus(`Error cargando: HTTP ${res.status}`)
        return
      }
      const a = (await res.json()) as Artwork
      setArtwork(a)
      setForm({
        paintedLocation: a.paintedLocation || '',
        startDate: a.startDate || '',
        endDate: a.endDate || '',
        inProgress: !!a.inProgress,
        detalle: a.detalle || '',
        bitacora: a.bitacora || '',
      })
    })()
  }, [id, router])

  const save = async () => {
    const token = getToken()
    setStatus('Guardando…')
    const res = await fetch(`/api/v1/admin/artworks/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      setStatus(`Error guardando: HTTP ${res.status}`)
      return
    }
    const updated = (await res.json()) as Artwork
    setArtwork(updated)
    setStatus('Guardado ✓')
    setTimeout(() => setStatus(''), 2500)
  }

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>{artwork ? artwork.title : 'Cargando…'}</h1>
          <div style={{ opacity: 0.7, fontSize: 12 }}>{id}</div>
        </div>
        <div className="row" style={{ gap: 10, alignItems: 'center' }}>
          <Link className="btn" href="/artworks">
            Volver
          </Link>
          <button className="btn btnPrimary" onClick={save}>
            Guardar
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16, padding: 16 }}>
        {status ? <div style={{ marginBottom: 12, opacity: 0.8 }}>{status}</div> : null}

        <div className="row">
          <div style={{ flex: 1, minWidth: 280 }}>
            <label>Lugar donde se pintó</label>
            <input
              value={form.paintedLocation}
              onChange={(e) => setForm({ ...form, paintedLocation: e.target.value })}
              placeholder="Ej: Colina, Chile"
              style={{ marginTop: 8, marginBottom: 12 }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label>Fecha inicio (YYYY-MM-DD)</label>
            <input
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              placeholder="2025-12-01"
              style={{ marginTop: 8, marginBottom: 12 }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label>Fecha fin (YYYY-MM-DD)</label>
            <input
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              placeholder="2025-12-20"
              style={{ marginTop: 8, marginBottom: 12 }}
              disabled={form.inProgress}
            />
          </div>
        </div>

        <div className="row" style={{ alignItems: 'center' }}>
          <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={form.inProgress}
              onChange={(e) =>
                setForm({
                  ...form,
                  inProgress: e.target.checked,
                  endDate: e.target.checked ? '' : form.endDate,
                })
              }
              style={{ width: 18, height: 18 }}
            />
            Obra en progreso
          </label>
        </div>

        <div style={{ marginTop: 16 }}>
          <label>Detalle (explicación general)</label>
          <textarea
            value={form.detalle}
            onChange={(e) => setForm({ ...form, detalle: e.target.value })}
            rows={8}
            style={{ marginTop: 8 }}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <label>Bitácora</label>
          <textarea
            value={form.bitacora}
            onChange={(e) => setForm({ ...form, bitacora: e.target.value })}
            rows={8}
            style={{ marginTop: 8 }}
          />
        </div>
      </div>
    </div>
  )
}


