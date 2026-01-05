'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getToken } from '@/lib/auth'
import type { AdminUpdate, Artwork } from '@/lib/api'

export default function ArtworkEditPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = useMemo(() => decodeURIComponent(params.id), [params.id])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [form, setForm] = useState<AdminUpdate>({
    title: '',
    paintedLocation: '',
    startDate: '',
    endDate: '',
    inProgress: false,
    detalle: '',
    bitacora: '',
    primaryImage: '',
  })
  const [status, setStatus] = useState<string>('')
  const [titleError, setTitleError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; filename: string }>({
    open: false,
    filename: '',
  })

  const token = getToken()

  useEffect(() => {
    if (!token) {
      router.replace('/login')
      return
    }
    loadArtwork()
  }, [id, router, token])

  const loadArtwork = async () => {
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
      title: a.title || '',
      paintedLocation: a.paintedLocation || '',
      startDate: a.startDate || '',
      endDate: a.endDate || '',
      inProgress: !!a.inProgress,
      detalle: a.detalle || '',
      bitacora: a.bitacora || '',
      primaryImage: a.primaryImage || '',
    })
  }

  const checkTitleAvailability = async (title: string) => {
    if (!title.trim()) {
      setTitleError('El nombre es requerido')
      return
    }
    try {
      const res = await fetch(
        `/api/v1/admin/artworks/check-title?title=${encodeURIComponent(title)}&excludeId=${encodeURIComponent(id)}`,
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

  const save = async () => {
    if (!form.title.trim()) {
      setTitleError('El nombre es requerido')
      return
    }
    if (titleError) return

    setStatus('Guardando...')
    const res = await fetch(`/api/v1/admin/artworks/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    })
    if (res.status === 409) {
      setTitleError('Este nombre ya existe')
      setStatus('')
      return
    }
    if (!res.ok) {
      setStatus(`Error guardando: HTTP ${res.status}`)
      return
    }
    const updated = (await res.json()) as Artwork
    setArtwork(updated)
    setStatus('Guardado!')
    setTimeout(() => setStatus(''), 2500)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setStatus('Subiendo imagenes...')

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('image', file)

      try {
        const res = await fetch(`/api/v1/admin/artworks/${encodeURIComponent(id)}/images`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        if (!res.ok) {
          const err = await res.json()
          setStatus(`Error: ${err.error || res.status}`)
          setUploading(false)
          return
        }
        const updated = (await res.json()) as Artwork
        setArtwork(updated)
        // Update primary image in form if not set
        if (!form.primaryImage && updated.images.length > 0) {
          setForm((f) => ({ ...f, primaryImage: updated.primaryImage || updated.images[0] }))
        }
      } catch (err) {
        setStatus(`Error subiendo: ${err}`)
        setUploading(false)
        return
      }
    }

    setStatus('Imagenes subidas!')
    setUploading(false)
    setTimeout(() => setStatus(''), 2500)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (filename: string, deleteFromDisk: boolean) => {
    setStatus('Eliminando imagen...')
    setDeleteModal({ open: false, filename: '' })

    const url = `/api/v1/admin/artworks/${encodeURIComponent(id)}/images/${encodeURIComponent(filename)}${deleteFromDisk ? '?deleteFile=true' : ''}`
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      const err = await res.json()
      setStatus(`Error: ${err.error || res.status}`)
      return
    }

    const updated = (await res.json()) as Artwork
    setArtwork(updated)

    // Update primary image if deleted
    if (form.primaryImage === filename) {
      const newPrimary = updated.images.length > 0 ? updated.images[0] : ''
      setForm((f) => ({ ...f, primaryImage: newPrimary }))
    }

    setStatus('Imagen eliminada!')
    setTimeout(() => setStatus(''), 2500)
  }

  const setPrimaryImage = (filename: string) => {
    setForm((f) => ({ ...f, primaryImage: filename }))
  }

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ opacity: 0.5, fontSize: 12, marginBottom: 4 }}>ID: {id}</div>
        </div>
        <div className="row" style={{ gap: 10, alignItems: 'center' }}>
          <Link className="btn" href="/artworks">
            Volver
          </Link>
          <button className="btn btn-primary" onClick={save} disabled={!!titleError}>
            Guardar
          </button>
        </div>
      </div>

      {/* Nombre editable */}
      <div className="card" style={{ marginTop: 16, padding: 16 }}>
        <label>Nombre de la obra</label>
        <input
          value={form.title}
          onChange={(e) => {
            setForm({ ...form, title: e.target.value })
            setTitleError('')
          }}
          onBlur={() => checkTitleAvailability(form.title)}
          placeholder="Nombre de la obra"
          style={{ marginTop: 8, fontSize: 18, fontWeight: 600 }}
        />
        {titleError && (
          <div style={{ color: '#ff6b6b', fontSize: 12, marginTop: 4 }}>{titleError}</div>
        )}
      </div>

      {/* Galeria de Imagenes */}
      <div className="card" style={{ marginTop: 16, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <label style={{ margin: 0 }}>Imagenes ({artwork?.images?.length || 0})</label>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              multiple
              onChange={handleUpload}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="btn btn-primary"
              style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}
            >
              {uploading ? 'Subiendo...' : 'Subir imagenes'}
            </label>
          </div>
        </div>

        <div style={{ marginBottom: 12, fontSize: 12, opacity: 0.7 }}>
          Haz clic en una imagen para seleccionarla como imagen principal
        </div>

        {artwork?.images && artwork.images.length > 0 ? (
          <div className="imageGrid">
            {artwork.images.map((img) => {
              const isPrimary = form.primaryImage === img
              return (
                <div
                  key={img}
                  className="imageCard"
                  onClick={() => setPrimaryImage(img)}
                  style={{
                    cursor: 'pointer',
                    border: isPrimary ? '3px solid #4CAF50' : '3px solid transparent',
                    borderRadius: 8,
                  }}
                >
                  <img
                    src={`/api/v1/artworks/${encodeURIComponent(id)}/images/${encodeURIComponent(img)}`}
                    alt={img}
                  />
                  {isPrimary && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 4,
                        left: 4,
                        background: '#4CAF50',
                        color: 'white',
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontWeight: 600,
                      }}
                    >
                      PRINCIPAL
                    </div>
                  )}
                  <button
                    className="imageDeleteBtn"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteModal({ open: true, filename: img })
                    }}
                    title="Eliminar imagen"
                  >
                    x
                  </button>
                  <div className="imageFilename">{img}</div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ opacity: 0.5, padding: '20px 0', textAlign: 'center' }}>
            No hay imagenes. Sube algunas para comenzar.
          </div>
        )}
      </div>

      {/* Modal de confirmacion */}
      {deleteModal.open && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ open: false, filename: '' })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Eliminar imagen</h3>
            <p style={{ opacity: 0.8 }}>
              Que deseas hacer con <strong>{deleteModal.filename}</strong>?
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                className="btn"
                onClick={() => handleDelete(deleteModal.filename, false)}
                style={{ flex: 1 }}
              >
                Solo remover
              </button>
              <button
                className="btn"
                onClick={() => handleDelete(deleteModal.filename, true)}
                style={{ flex: 1, backgroundColor: '#ff4444', color: 'white' }}
              >
                Eliminar del servidor
              </button>
            </div>
            <button
              className="btn"
              onClick={() => setDeleteModal({ open: false, filename: '' })}
              style={{ width: '100%', marginTop: 8 }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 16, padding: 16 }}>
        {status ? <div style={{ marginBottom: 12, opacity: 0.8 }}>{status}</div> : null}

        <div className="row">
          <div style={{ flex: 1, minWidth: 280 }}>
            <label>Lugar donde se pinto</label>
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
          <label>Detalle (explicacion general)</label>
          <textarea
            value={form.detalle}
            onChange={(e) => setForm({ ...form, detalle: e.target.value })}
            rows={8}
            style={{ marginTop: 8 }}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <label>Bitacora</label>
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
