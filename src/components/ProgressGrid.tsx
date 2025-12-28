import type { DayProgress } from "../types/dayprogress";
import { formatDate, getCompletionColor, getTodayDate } from "../utils/utils";
import { useState } from "react";

// ProgressGrid Component
export const ProgressGrid: React.FC<{
  days: number;
  startDate: string;
  dailyProgress: Record<string, DayProgress>;
  history: any[];
}> = ({ days, startDate, dailyProgress, history }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  // Don't render until startDate is loaded from backend
  if (!startDate) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Progress Overview</h2>
        <div className="text-center py-8 text-gray-500">
          Loading challenge progress...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'overview'
              ? 'border-b-2 border-orange-500 text-orange-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Progress Overview
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'history'
              ? 'border-b-2 border-orange-500 text-orange-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Challenge History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <OverviewTab days={days} startDate={startDate} dailyProgress={dailyProgress} />
      ) : (
        <HistoryTab history={history} />
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{
  days: number;
  startDate: string;
  dailyProgress: Record<string, DayProgress>;
}> = ({ days, startDate, dailyProgress }) => {
  const getGridData = () => {
    const grid = [];
    const start = new Date(startDate);
    
    // Add challenge days starting from Day 1
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = formatDate(date);
      const progress = dailyProgress[dateStr];
      
      grid.push({
        date: dateStr,
        completionRate: progress?.completionRate ?? 0,
        dayNumber: progress?.dayNumber ?? (i + 1), // Use server dayNumber or calculate
        isPast: date < new Date(getTodayDate()),
        isToday: dateStr === getTodayDate(),
        isFuture: date > new Date(getTodayDate())
      });
    }
    
    return grid;
  };

  const gridData = getGridData();
  const cols = days === 21 ? 7 : days === 45 ? 9 : days === 60 ? 10 : 15;

  return (
    <>
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Progress Overview</h2>
      <div 
        className="grid gap-1.5 sm:gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {gridData.map(({ date, completionRate, dayNumber, isToday, isFuture }) => (
          <div
            key={date}
            className={`aspect-square rounded-md transition-all flex items-center justify-center font-semibold text-xs sm:text-sm ${
              isFuture
                ? 'bg-gray-200 text-gray-500'
                : getCompletionColor(completionRate) + ' text-white'
            } ${isToday ? 'ring-2 ring-amber-600' : ''}`}
            title={`Day ${dayNumber} (${date}): ${Math.round(completionRate * 100)}% completed`}
          >
            {dayNumber}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 rounded"></div>
          <span>All done</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-500 rounded"></div>
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded"></div>
          <span>Incomplete</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded"></div>
          <span>Future</span>
        </div>
      </div>
    </>
  );
};

// History Tab Component
const HistoryTab: React.FC<{
  history: any[];
}> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Challenge History</h2>
        <p>No previous challenges found.</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Challenge History</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((challenge) => (
          <div key={challenge.challengeId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900">{challenge.challengeDays} Days</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                challenge.challengeLevel === 'Soft' ? 'bg-green-100 text-green-800' :
                challenge.challengeLevel === 'Hard' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {challenge.challengeLevel}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Started: {new Date(challenge.startDate).toLocaleDateString()}</p>
              {challenge.expectedEndDate && (
                <p>Expected End: {new Date(challenge.expectedEndDate).toLocaleDateString()}</p>
              )}
              {challenge.avgCompletionRate !== undefined && (
                <p>Avg Completion: {Math.round(challenge.avgCompletionRate * 100)}%</p>
              )}
              <p>Status: <span className="capitalize">{challenge.status}</span></p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
