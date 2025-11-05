import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { formatDate } from "../utils/utils";
import { useState, useRef, useEffect } from "react";

interface DateSelectorProps {
  currentDate: string;
  startDate: string;
  dailyProgress: Record<string, { dayNumber?: number; completionRate: number }>;
  onDateChange: (date: string) => void;
  today: string;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  currentDate,
  startDate,
  dailyProgress,
  onDateChange,
  today,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  if (!startDate) return null; // Don't render until startDate is loaded

  const currentDateObj = new Date(currentDate);
  const startDateObj = new Date(startDate);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Calculate day number from the start
  const daysSinceStart = Math.floor(
    (currentDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)
  );
  const currentDayNumber = daysSinceStart + 1;

  // Get completion rate for current date
  const currentProgress = dailyProgress[currentDate];
  const completionRate = currentProgress?.completionRate ?? 0;
  const dayNumber = currentProgress?.dayNumber ?? currentDayNumber;

  // Check if we can navigate
  const canGoPrevious = currentDate > startDate;
  const canGoNext = currentDate < today;

  const handlePrevious = () => {
    if (!canGoPrevious) return;
    const prevDate = new Date(currentDateObj);
    prevDate.setDate(prevDate.getDate() - 1);
    onDateChange(formatDate(prevDate));
  };

  const handleNext = () => {
    if (!canGoNext) return;
    const nextDate = new Date(currentDateObj);
    nextDate.setDate(nextDate.getDate() + 1);
    onDateChange(formatDate(nextDate));
  };

  const handleToday = () => {
    onDateChange(today);
    setIsDropdownOpen(false);
  };

  const handleDateSelect = (date: string) => {
    onDateChange(date);
    setIsDropdownOpen(false);
  };

  // Generate list of all valid dates (from start to today)
  const getValidDates = () => {
    const dates = [];
    const current = new Date(startDateObj);
    const end = new Date(today);
    
    while (current <= end) {
      dates.push(formatDate(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const validDates = getValidDates();

  // Format the date for display
  const formattedDate = currentDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const isToday = currentDate === today;

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-lg p-4 text-white relative" ref={dropdownRef}>
      <div className="flex items-center justify-between gap-4">
        {/* Previous Day Button */}
        <button
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className={`p-2 rounded-full transition-all ${
            canGoPrevious
              ? 'hover:bg-white/20 active:scale-95'
              : 'opacity-30 cursor-not-allowed'
          }`}
          title="Previous day"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Date Display */}
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="hover:bg-white/20 p-1 rounded transition-all active:scale-95"
              title="Select a date"
            >
              <Calendar size={20} />
            </button>
            <span className="text-2xl font-bold">Day {dayNumber}</span>
          </div>
          <div className="text-sm opacity-90 mb-2">{formattedDate}</div>
          
          {/* Progress Bar */}
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${completionRate * 100}%` }}
            />
          </div>
          <div className="text-xs mt-1 opacity-90">
            {Math.round(completionRate * 100)}% completed
          </div>
        </div>

        {/* Next Day Button */}
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`p-2 rounded-full transition-all ${
            canGoNext
              ? 'hover:bg-white/20 active:scale-95'
              : 'opacity-30 cursor-not-allowed'
          }`}
          title="Next day"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Jump to Today Button */}
      {!isToday && (
        <button
          onClick={handleToday}
          className="mt-3 w-full py-2 bg-white/20 hover:bg-white/30 rounded-md text-sm font-medium transition-all active:scale-95"
        >
          Jump to Today
        </button>
      )}

      {/* Date Picker Dropdown */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl p-4 text-gray-800 z-10 max-h-80 overflow-y-auto">
          <h3 className="font-semibold text-sm mb-3 text-gray-700">Select a Day</h3>
          <div className="space-y-1">
            {validDates.map((date) => {
              const dateObj = new Date(date);
              const progress = dailyProgress[date];
              const dayNum = progress?.dayNumber ?? validDates.indexOf(date) + 1;
              const completionRate = progress?.completionRate ?? 0;
              const isSelected = date === currentDate;
              const isTodayDate = date === today;

              return (
                <button
                  key={date}
                  onClick={() => handleDateSelect(date)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500 text-white font-semibold'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Day {dayNum}</span>
                    <span className="text-xs opacity-75">
                      {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    {isTodayDate && (
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-medium">
                    {Math.round(completionRate * 100)}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
