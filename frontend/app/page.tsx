'use client'

import { useEffect, useState } from 'react'
import ArtworkGrid from '@/components/ArtworkGrid'
import ArtworkModal from '@/components/ArtworkModal'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Contact from '@/components/Contact'

export interface Artwork {
  id: string
  title: string
  images: string[]
  videos?: string[]
  detalle?: string
  paintedLocation?: string
  startDate?: string
  endDate?: string
  inProgress?: boolean
  bitacora?: string
}

const HERO_ARTWORK_IDS = ['ciego', 'cisne', 'eland', 'indigenas', 'indio'] as const

export default function Home() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArtworks()
  }, [])

  const fetchArtworks = async () => {
    try {
      const response = await fetch(`/api/v1/artworks`)
      if (!response.ok) throw new Error('Failed to fetch artworks')
      const data = await response.json()
      setArtworks(data.artworks || [])
    } catch (error) {
      console.error('Error fetching artworks:', error)
    } finally {
      setLoading(false)
    }
  }

  const openArtwork = (artwork: Artwork) => {
    setSelectedArtwork(artwork)
  }

  const closeArtwork = () => {
    setSelectedArtwork(null)
  }

  return (
    <main>
      <Hero
        slides={HERO_ARTWORK_IDS
          .map((id) => artworks.find((a) => a.id === id))
          .filter((a): a is Artwork => !!a && a.images?.length > 0)
          .map((a) => ({
            id: a.id,
            title: a.title,
            imageUrl: `/api/v1/artworks/${a.id}/images/${a.images[0]}`,
          }))}
      />
      <About />
      <ArtworkGrid 
        artworks={artworks} 
        onArtworkClick={openArtwork}
        loading={loading}
      />

      <Contact />
      {selectedArtwork && (
        <ArtworkModal 
          artwork={selectedArtwork} 
          onClose={closeArtwork}
        />
      )}
    </main>
  )
}

