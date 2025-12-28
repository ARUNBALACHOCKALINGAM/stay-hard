import { Camera, Trash2, Loader2, X } from "lucide-react";
import type { ProgressPhoto } from "../types/progressphoto";
import { useState } from "react";

// Format upload date/time in user's local timezone
const formatUploadTime = (uploadDate?: string) => {
  if (!uploadDate) return '';
  const date = new Date(uploadDate);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// PhotoGallery Component
export const PhotoGallery: React.FC<{
  photos: ProgressPhoto[];
  onPhotoUpload: (file: File) => void;
  onPhotoDelete: (id: string) => void;
  history: any[];
  currentChallenge: any;
  selectedChallengeId: string;
  onChallengeSelect: (challengeId: string) => void;
}> = ({ photos, onPhotoUpload, onPhotoDelete, history, currentChallenge, selectedChallengeId, onChallengeSelect }) => {
  console.log('PhotoGallery rendering with photos:', photos.length, photos);

  // Modal state for full-screen photo view
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);

  // Construct challenges list
  const challenges = [
    { ...currentChallenge, label: `${currentChallenge.challengeDays} Days - ${currentChallenge.challengeLevel} (Current)` },
    ...history.map(challenge => ({
      ...challenge,
      label: `${challenge.challengeDays} Days - ${challenge.challengeLevel} (${new Date(challenge.startDate).toLocaleDateString()})`
    }))
  ];

  // Check if selected challenge is active (current challenge)
  const isActiveChallenge = selectedChallengeId === currentChallenge.challengeId;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoUpload(file);
    }
  };

  const openPhotoModal = (photo: ProgressPhoto) => {
    setSelectedPhoto(photo);
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  const groupedPhotos = photos.reduce((acc, photo) => {
    if (!acc[photo.date]) acc[photo.date] = [];
    acc[photo.date].push(photo);
    return acc;
  }, {} as Record<string, ProgressPhoto[]>);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Progress Photos</h2>
      
      {/* Challenge Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Challenge</label>
        <select
          value={selectedChallengeId}
          onChange={(e) => onChallengeSelect(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        >
          {challenges.map(challenge => (
            <option key={challenge.challengeId} value={challenge.challengeId}>
              {challenge.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Upload Section - Only for active challenge */}
      {isActiveChallenge && (
        <label className="block mb-6">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-amber-600 hover:bg-amber-50 transition-colors">
            <Camera size={40} className="sm:w-12 sm:h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm sm:text-base text-gray-600">Click to upload today's progress photo</p>
          </div>
        </label>
      )}

      {/* Show message for inactive challenges */}
      {!isActiveChallenge && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">Photo upload is only available for the current active challenge.</p>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedPhotos)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([date, datePhotos]) => (
            <div key={date}>
              {/* <h3 className="text-lg font-medium text-gray-700 mb-3">{date}</h3> */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {datePhotos.map(photo => (
                  <div 
                    key={photo.id} 
                    className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/50"
                    onClick={() => openPhotoModal(photo)}
                  >
                    <img
                      src={photo.dataUrl}
                      alt={`Progress ${photo.date}`}
                      className="w-full h-40 sm:h-48 object-cover rounded-lg shadow-md group-hover:brightness-110 transition-all duration-300"
                    />
                    {/* Upload time badge */}
                    {photo.uploadDate && (
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                        {formatUploadTime(photo.uploadDate)}
                      </div>
                    )}
                    {/* Uploading overlay */}
                    {photo.uploading && (
                      <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                        <Loader2 className="animate-spin text-white" size={20} />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPhotoDelete(photo.id);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 sm:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete photo"
                      title="Delete photo"
                    >
                      <Trash2 size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {photos.length === 0 && (
        <p className="text-center text-gray-500 mt-8 text-sm sm:text-base">
          No photos yet. Upload your first progress photo!
        </p>
      )}
    </div>

    {/* Full-screen Photo Modal */}
    {selectedPhoto && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
        onClick={closePhotoModal}
      >
        <div className="relative max-w-4xl max-h-full p-4">
          <img
            src={selectedPhoto.dataUrl}
            alt={`Progress ${selectedPhoto.date}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={closePhotoModal}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            aria-label="Close photo"
          >
            <X size={24} />
          </button>
          {/* Photo info */}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded">
            <p className="text-sm">{new Date(selectedPhoto.date).toLocaleDateString()}</p>
            {selectedPhoto.uploadDate && (
              <p className="text-xs opacity-75">{formatUploadTime(selectedPhoto.uploadDate)}</p>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};