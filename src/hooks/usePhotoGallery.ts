// src/hooks/usePhotoGallery.ts
import { useState, useCallback, useEffect } from 'react';
import type { User } from '../types/user';
import type { ProgressPhoto } from '../types/progressphoto';
import { getTodayDate } from '../utils/utils';
import galleryService from '../services/galleryService';
import type { BackendPhotoMeta } from '../services/galleryService';

/**
 * Hook to manage photo gallery operations
 */
export function usePhotoGallery(user: User | null, challengeId?: string) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);

  const appUser = user as NonNullable<User>;

  const handlePhotoUploadFile = useCallback(
    async (file: File) => {
      if (!appUser?._id || !challengeId) {
        console.error('Cannot upload photo: missing user or challenge');
        return;
      }

      const date = getTodayDate();
      const tempUrl = URL.createObjectURL(file);
      const tempId = `temp-photo-${Date.now()}`;

      // 1) Optimistic add with temporary object URL
      const tempPhoto: ProgressPhoto = {
        id: tempId,
        date,
        dataUrl: tempUrl,
        uploading: true
      };
      setPhotos(prev => [tempPhoto, ...prev]);

      try {
        // 2) API upload
        const uploaded = await galleryService.uploadProgressPhoto(file, appUser._id, challengeId, date);
        console.log('Upload response received:', uploaded);
        const backendId: string = uploaded?.file?.id;

        if (!backendId) {
          console.error('Upload response missing ID:', uploaded);
          throw new Error('No photo ID returned from server');
        }

        console.log('Streaming uploaded photo:', backendId);
        // 3) Stream from server to get a persistent object URL
        const serverUrl = await galleryService.streamPhoto(backendId);
        console.log('Photo streamed successfully, URL:', serverUrl);

        const uploadDate = uploaded?.file?.metadata?.date || date;
        const uploadTimestamp = new Date().toISOString();

        // Replace temp with server-backed photo
        const newPhoto = {
          id: backendId,
          backendId,
          date: uploadDate,
          dataUrl: serverUrl,
          uploading: false,
          uploadDate: uploadTimestamp
        };
        console.log('Replacing temp photo with:', newPhoto);
        setPhotos(prev => prev.map(p => (p.id === tempId ? newPhoto : p)));

        // Revoke the temporary object URL
        URL.revokeObjectURL(tempUrl);
        console.log('Upload complete, temp URL revoked');
      } catch (err) {
        console.error('Photo upload failed', err);
        // Rollback: remove the temp photo and revoke URL
        setPhotos(prev => prev.filter(p => p.id !== tempId));
        URL.revokeObjectURL(tempUrl);
      }
    },
    [appUser?._id, challengeId]
  );

  const handlePhotoDelete = useCallback(async (id: string) => {
    // Find the photo to get its backend ID and object URL
    const photo = photos.find(p => p.id === id);
    if (!photo) return;

    // 1. Optimistic removal from UI
    setPhotos(prev => prev.filter(p => p.id !== id));

    try {
      // 2. API delete (only if it has a backend ID)
      if (photo.backendId) {
        await galleryService.deletePhoto(photo.backendId);
        console.log('Photo deleted from server:', photo.backendId);
      }

      // 3. Revoke object URL to free memory
      if (photo.dataUrl.startsWith('blob:')) {
        URL.revokeObjectURL(photo.dataUrl);
      }
    } catch (err) {
      console.error('Failed to delete photo from server:', err);
      // Rollback: restore the photo
      setPhotos(prev => [...prev, photo].sort((a, b) => b.date.localeCompare(a.date)));
    }
  }, [photos]);

  // Load photos for a specific challenge
  const loadPhotos = useCallback(async (targetChallengeId: string) => {
    if (!targetChallengeId || !appUser?._id) return;
    try {
      const photos = await galleryService.getChallengePhotos(targetChallengeId);
      // Stream each photo to get authenticated blob URLs
      const mappedPhotos = await Promise.all(
        photos.map(async (photo) => {
          const url = await galleryService.streamPhoto(photo.id);
          return {
            id: photo.id,
            date: photo.metadata.date,
            dataUrl: url,
            uploadDate: photo.uploadDate
          };
        })
      );
      setPhotos(mappedPhotos);
    } catch (error) {
      console.error('Failed to load photos:', error);
      // Clear photos on error
      setPhotos([]);
    }
  }, [appUser?._id]);

  // Initial load of gallery photos for the current challenge
  useEffect(() => {
    (async () => {
      if (!appUser?._id) return;
      console.log('Loading photos for user:', appUser._id, 'challenge:', challengeId);
      try {
        const metas = await galleryService.getProgressPhotos({
          userId: appUser._id,
          challengeId: challengeId || undefined
        });
        console.log('Photo metas fetched:', metas.length, metas);
        
        // Stream each photo to get an object URL
        const photos: ProgressPhoto[] = await Promise.all(
          (metas as BackendPhotoMeta[])
            .filter(m => m.id)
            .map(async m => {
              console.log('Streaming photo:', m.id);
              const url = await galleryService.streamPhoto(m.id);
              return {
                id: m.id,
                backendId: m.id,
                date: m.metadata.date,
                dataUrl: url,
                uploadDate: m.uploadDate
              };
            })
        );
        console.log('Photos loaded and streamed:', photos.length);
        
        // Sort by date desc for display
        photos.sort((a, b) => b.date.localeCompare(a.date));
        setPhotos(photos);
      } catch (e) {
        console.error('Failed to load progress photos', e);
      }
    })();
  }, [appUser?._id, challengeId]);

  return {
    photos,
    handlePhotoUploadFile,
    handlePhotoDelete,
    loadPhotos
  };
}
