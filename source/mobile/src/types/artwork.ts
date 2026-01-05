export interface Artwork {
  id: string;
  title: string;
  images: string[];
  videos?: string[];
  bitacora?: string;
}

export interface ArtworkListResponse {
  artworks: Artwork[];
  total: number;
}

