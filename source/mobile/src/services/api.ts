import {Artwork, ArtworkListResponse} from '../types/artwork';

const API_URL = 'http://localhost:8090'; // Change to your backend URL

export const fetchArtworks = async (): Promise<Artwork[]> => {
  try {
    const response = await fetch(`${API_URL}/api/v1/artworks`);
    if (!response.ok) {
      throw new Error('Failed to fetch artworks');
    }
    const data: ArtworkListResponse = await response.json();
    return data.artworks;
  } catch (error) {
    console.error('Error fetching artworks:', error);
    throw error;
  }
};

export const fetchArtwork = async (id: string): Promise<Artwork> => {
  try {
    const response = await fetch(`${API_URL}/api/v1/artworks/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch artwork');
    }
    const data: Artwork = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching artwork:', error);
    throw error;
  }
};

export const getImageUrl = (artworkId: string, filename: string): string => {
  return `${API_URL}/api/v1/artworks/${artworkId}/images/${filename}`;
};

export const getVideoUrl = (artworkId: string, filename: string): string => {
  return `${API_URL}/api/v1/artworks/${artworkId}/videos/${filename}`;
};

