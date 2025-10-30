// Settings Component
export const Settings: React.FC<{
  days: number;
  level: string;
  onDaysChange: (days: 21 | 45 | 60 | 75) => void;
  onLevelChange: (level: 'Soft' | 'Hard' | 'Custom') => void;
}> = ({ days, level, onDaysChange, onLevelChange }) => {
  const dayOptions: (21 | 45 | 60 | 75)[] = [21, 45, 60, 75];
  const levelOptions: ('Soft' | 'Hard' | 'Custom')[] = ['Soft', 'Hard', 'Custom'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Challenge Settings</h2>
      
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

      <div>
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
    </div>
  );
};