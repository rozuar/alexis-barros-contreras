export type Artwork = {
  id: string
  title: string
  images: string[]
  videos?: string[]
  detalle?: string
  bitacora?: string
  paintedLocation?: string
  startDate?: string
  endDate?: string
  inProgress?: boolean
}

export type ArtworkListResponse = { artworks: Artwork[]; total: number }

export type AdminUpdate = {
  paintedLocation: string
  startDate: string
  endDate: string
  inProgress: boolean
  detalle: string
  bitacora: string
}


