import { auth } from '../firebaseConfig';
import { API_URL } from '../utils/config';

interface GetPhotosParams {
  userId: string;
  challengeId?: string;
  startDate?: string;
  endDate?: string;
}

// Shape from actual backend response
export interface BackendPhotoMeta {
  id: string; // GridFS or Mongo ID (backend uses 'id' not '_id')
  filename: string;
  uploadDate: string; // ISO timestamp
  metadata: {
    userId: string;
    challengeId: string;
    date: string; // YYYY-MM-DD stored in metadata
  };
  url: string;
}

export const galleryService = {
  async uploadProgressPhoto(file: File, userId: string, challengeId: string, date: string) {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('Not authenticated');

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('userId', userId);
    formData.append('challengeId', challengeId);
    formData.append('date', date);

    const res = await fetch(`${API_URL}/gallery/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
        // NOTE: Do NOT set Content-Type manually when sending FormData
      },
      body: formData
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Upload failed:', res.status, errorText);
      throw new Error(`Failed to upload progress photo: ${res.status}`);
    }
    
    const contentType = res.headers.get('content-type');
    console.log('Upload response content-type:', contentType);
    
    // Check if response is JSON
    if (contentType?.includes('application/json')) {
      const result = await res.json();
      console.log('Upload response (JSON):', result);
      return result;
    } else {
      // If not JSON, it might be returning the image itself or another format
      const text = await res.text();
      console.log('Upload response (non-JSON):', text);
      throw new Error('Upload endpoint did not return JSON');
    }
  },

  async getProgressPhotos(params: GetPhotosParams): Promise<BackendPhotoMeta[]> {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('Not authenticated');

    const query = new URLSearchParams();
    query.append('userId', params.userId);
    if (params.challengeId) query.append('challengeId', params.challengeId);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);

    const res = await fetch(`${API_URL}/gallery?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to fetch progress photos');
    const data = await res.json();
    console.log('getProgressPhotos response:', data); // Debug logging
    // Expect shape: { items: BackendPhotoMeta[] } or array directly
    if (Array.isArray(data)) return data as BackendPhotoMeta[];
    if (Array.isArray(data?.items)) return data.items as BackendPhotoMeta[];
    console.warn('Unexpected response structure:', data);
    return [];
  },

  async streamPhoto(photoId: string): Promise<string> {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_URL}/gallery/${photoId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to stream photo');
    const blob = await res.blob();
    return URL.createObjectURL(blob); // Object URL for <img src>
  },

  async deletePhoto(photoId: string): Promise<void> {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_URL}/gallery/${photoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Delete failed:', res.status, errorText);
      throw new Error(`Failed to delete photo: ${res.status}`);
    }
    
    console.log('Photo deleted successfully:', photoId);
  }
};

export default galleryService;
