import { RotateCcw, ChevronDown, ChevronUp, Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";

export const Settings: React.FC<{
  days: number;
  level: string;
  onDaysChange: (days: 21 | 45 | 60 | 75) => void;
  onLevelChange: (level: 'Soft' | 'Hard' | 'Custom') => void;
  onResetProgress?: () => void;
}> = ({ days, level, onDaysChange, onLevelChange, onResetProgress }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const dayOptions: (21 | 45 | 60 | 75)[] = [21, 45, 60, 75];
  const levelOptions: ('Soft' | 'Hard' | 'Custom')[] = ['Soft', 'Hard', 'Custom'];

  const handleResetClick = () => {
    onResetProgress?.();
  };

  return (
    <div className="space-y-4">
      {/* Minimized Header */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
              <SettingsIcon size={20} className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Challenge Settings</h3>
              <p className="text-xs sm:text-sm text-gray-500">
                {days} Days • {level} Mode
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-4 border-t border-gray-100">
            {/* Days Selection */}
            <div className="pt-4">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Challenge Duration
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {dayOptions.map(d => (
                  <button
                    key={d}
                    onClick={() => onDaysChange(d)}
                    className={`py-2.5 px-3 rounded-lg font-semibold transition-all duration-200 text-center text-sm sm:text-base ${
                      days === d
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-105'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-105 border border-gray-200'
                    }`}
                  >
                    <div className="text-base sm:text-lg">{d}</div>
                    <div className="text-xs opacity-75">days</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Difficulty Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {levelOptions.map(l => (
                  <button
                    key={l}
                    onClick={() => onLevelChange(l)}
                    className={`py-2.5 sm:py-3 px-3 rounded-lg font-semibold transition-all duration-200 text-center text-sm sm:text-base ${
                      level === l
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-105'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-105 border border-gray-200'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Progress Button */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Reset Challenge
              </label>
              <button
                onClick={handleResetClick}
                className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 
                           rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base
                           bg-rose-50 text-rose-600 border-2 border-rose-200
                           hover:bg-rose-100 hover:border-rose-300 hover:scale-105
                           active:scale-95"
              >
                <RotateCcw size={18} />
                Reset Progress
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
