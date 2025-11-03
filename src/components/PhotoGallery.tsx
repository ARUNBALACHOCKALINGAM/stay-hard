import { Camera, Trash2 } from "lucide-react";
import type { ProgressPhoto } from "../types/progressphoto";

// PhotoGallery Component
export const PhotoGallery: React.FC<{
  photos: ProgressPhoto[];
  onPhotoUpload: (dataUrl: string) => void;
  onPhotoDelete: (id: string) => void;
}> = ({ photos, onPhotoUpload, onPhotoDelete }) => {
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotoUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const groupedPhotos = photos.reduce((acc, photo) => {
    if (!acc[photo.date]) acc[photo.date] = [];
    acc[photo.date].push(photo);
    return acc;
  }, {} as Record<string, ProgressPhoto[]>);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Progress Photos</h2>
      
      <label className="block mb-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-amber-600 hover:bg-amber-50 transition-colors">
          <Camera size={48} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600">Click to upload today's progress photo</p>
        </div>
      </label>

      <div className="space-y-6">
        {Object.entries(groupedPhotos)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([date, datePhotos]) => (
            <div key={date}>
              <h3 className="text-lg font-medium text-gray-700 mb-3">{date}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {datePhotos.map(photo => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.dataUrl}
                      alt={`Progress ${photo.date}`}
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                    <button
                      onClick={() => onPhotoDelete(photo.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {photos.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          No photos yet. Upload your first progress photo!
        </p>
      )}
    </div>
  );
};