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
  primaryImage?: string
}

export type ArtworkListResponse = { artworks: Artwork[]; total: number }

export type AdminUpdate = {
  title: string
  paintedLocation: string
  startDate: string
  endDate: string
  inProgress: boolean
  detalle: string
  bitacora: string
  primaryImage: string
}

export type AdminCreate = {
  title: string
}
