import { RotateCcw } from "lucide-react";

export const Settings: React.FC<{
  days: number;
  level: string;
  onDaysChange: (days: 21 | 45 | 60 | 75) => void;
  onLevelChange: (level: 'Soft' | 'Hard' | 'Custom') => void;
  onResetProgress?: () => void; // 👈 optional prop
}> = ({ days, level, onDaysChange, onLevelChange, onResetProgress }) => {
  const dayOptions: (21 | 45 | 60 | 75)[] = [21, 45, 60, 75];
  const levelOptions: ('Soft' | 'Hard' | 'Custom')[] = ['Soft', 'Hard', 'Custom'];

  const handleResetClick = () => {
      onResetProgress?.();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Challenge Settings</h2>
      
      {/* Days Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Days
        </label>
        <div className="grid grid-cols-4 gap-2">
          {dayOptions.map(d => (
            <button
              key={d}
              onClick={() => onDaysChange(d)}
              className={`py-2 px-4 rounded-md font-medium transition-colors ${
                days === d
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Difficulty Level
        </label>
        <div className="grid grid-cols-3 gap-2">
          {levelOptions.map(l => (
            <button
              key={l}
              onClick={() => onLevelChange(l)}
              className={`py-2 px-4 rounded-md font-medium transition-colors ${
                level === l
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* 🧸 Cute Reset Progress Button */}
      <div className="flex justify-center">
        <button
          onClick={handleResetClick}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium 
                     bg-rose-100 text-rose-700 hover:bg-rose-200 transition-all 
                     shadow-sm hover:shadow-md"
        >
          <RotateCcw size={16} />
          Reset Progress
        </button>
      </div>
    </div>
  );
};
