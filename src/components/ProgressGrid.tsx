import type { DayProgress } from "../types/dayprogress";
import { formatDate, getCompletionColor, getTodayDate } from "../utils";

// ProgressGrid Component
export const ProgressGrid: React.FC<{
  days: number;
  startDate: string;
  dailyProgress: Record<string, DayProgress>;
}> = ({ days, startDate, dailyProgress }) => {
  const getGridData = () => {
    const grid = [];
    const start = new Date(startDate);
    
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = formatDate(date);
      const progress = dailyProgress[dateStr];
      
      grid.push({
        date: dateStr,
        completionRate: progress?.completionRate ?? 0,
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
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Progress Overview</h2>
      <div 
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {gridData.map(({ date, completionRate, isPast, isToday, isFuture }) => (
          <div
            key={date}
            className={`aspect-square rounded-md transition-all ${
              isFuture
                ? 'bg-gray-200'
                : getCompletionColor(completionRate)
            } ${isToday ? 'ring-2 ring-amber-600' : ''}`}
            title={`${date}: ${Math.round(completionRate * 100)}% completed`}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded"></div>
          <span>All done</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>None</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <span>Future</span>
        </div>
      </div>
    </div>
  );
};
