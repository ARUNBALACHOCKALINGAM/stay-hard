import { Camera, Trash2, Loader2 } from "lucide-react";
import type { ProgressPhoto } from "../types/progressphoto";

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
}> = ({ photos, onPhotoUpload, onPhotoDelete }) => {
  console.log('PhotoGallery rendering with photos:', photos.length, photos);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoUpload(file);
    }
  };

  const groupedPhotos = photos.reduce((acc, photo) => {
    if (!acc[photo.date]) acc[photo.date] = [];
    acc[photo.date].push(photo);
    return acc;
  }, {} as Record<string, ProgressPhoto[]>);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Progress Photos</h2>
      
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

      <div className="space-y-6">
        {Object.entries(groupedPhotos)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([date, datePhotos]) => (
            <div key={date}>
              {/* <h3 className="text-lg font-medium text-gray-700 mb-3">{date}</h3> */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {datePhotos.map(photo => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.dataUrl}
                      alt={`Progress ${photo.date}`}
                      className="w-full h-40 sm:h-48 object-cover rounded-lg shadow-md"
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
                      onClick={() => onPhotoDelete(photo.id)}
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
  );
};