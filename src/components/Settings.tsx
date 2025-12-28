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

  // Motivational quotes
  const motivationalQuotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "You miss 100% of the shots you don't take. - Wayne Gretzky",
    "The best way to predict the future is to create it. - Peter Drucker",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "The only limit to our realization of tomorrow will be our doubts of today. - Franklin D. Roosevelt",
    "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill"
  ];

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

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

      {/* Motivational Content */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 sm:p-6 border border-amber-100">
        {isExpanded ? (
          // Motivational Quote when expanded
          <div className="text-center">
            <div className="mb-3">
              <span className="text-2xl">💪</span>
            </div>
            <blockquote className="text-gray-700 italic text-sm sm:text-base leading-relaxed">
              "{randomQuote}"
            </blockquote>
            <div className="mt-3 text-xs text-gray-500">
              Stay motivated • Keep pushing
            </div>
          </div>
        ) : (
          // Motivational Video when collapsed
          <div className="text-center">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Daily Motivation</h4>
            <div className="aspect-video rounded-lg overflow-hidden shadow-md">
              <iframe
                src="https://www.youtube.com/embed/8Sm0A1IQZNY"
                title="Motivational Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Watch this short video to boost your motivation
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
