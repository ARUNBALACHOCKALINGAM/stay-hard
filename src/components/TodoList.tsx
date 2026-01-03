import { useState } from "react";
import type { Task } from "../types/task";
import { getTodayDate } from "../utils/utils";
import { Check, Plus, Trash2 } from "lucide-react";
import { DateSelector } from "./DateSelector";

// TodoList Component
export const TodoList: React.FC<{
  tasks: Task[];
  onTaskToggle: (id: string) => void;
  onTaskAdd: (text: string) => void;
  onTaskDelete: (id: string) => void;
  onTaskEdit: (id: string, newText: string) => void;
  canCustomize: boolean;
  startDate: string;
  dailyProgress: Record<string, any>;
}> = ({ tasks, onTaskToggle, onTaskAdd, onTaskDelete, onTaskEdit, canCustomize, startDate, dailyProgress }) => {
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  
  const today = getTodayDate();
  const isViewingToday = selectedDate === today;
  const isViewingPastDay = selectedDate < today;
  
  // Get tasks for the selected date
  const displayedTasks = dailyProgress[selectedDate]?.tasks || [];

  const handleAdd = () => {
    if (newTask.trim()) {
      onTaskAdd(newTask.trim());
      setNewTask('');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const handleSaveEdit = (id: string) => {
    if (editText.trim()) {
      onTaskEdit(id, editText.trim());
    }
    setEditingId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const completedCount = displayedTasks.filter((t: Task) => t.completed).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      {/* Date Selector */}
      <DateSelector
        currentDate={selectedDate}
        startDate={startDate}
        dailyProgress={dailyProgress}
        onDateChange={setSelectedDate}
        today={today}
      />

      {/* Tasks List Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 mt-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          {isViewingPastDay ? 'Past Progress' : isViewingToday ? "Today's Tasks" : 'Tasks'}
        </h2>
        <span className="text-xs sm:text-sm text-gray-600">
          {completedCount} / {displayedTasks.length} completed
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {displayedTasks.map((task: Task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            {editingId === task.id ? (
              <>
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(task.id)}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveEdit(task.id)}
                  className="px-3 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors text-sm"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onTaskToggle(task.id)}
                  disabled={isViewingPastDay}
                  className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    task.completed
                      ? 'bg-green-600 border-green-600'
                      : isViewingPastDay
                      ? 'border-gray-300 opacity-50 cursor-not-allowed'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {task.completed && <Check size={16} className="text-white" />}
                </button>
                <span 
                  className={`flex-1 text-sm sm:text-base ${isViewingPastDay ? 'cursor-default' : 'cursor-pointer'} ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
                  onDoubleClick={canCustomize && isViewingToday ? () => handleEdit(task) : undefined}
                  title={canCustomize && isViewingToday ? "Double-click to edit" : ""}
                >
                  {task.text}
                </span>
                {canCustomize && isViewingToday && (
                  <button
                    onClick={() => onTaskDelete(task.id)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                  >
                    <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {canCustomize && isViewingToday && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Add a new task..."
            className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm sm:text-base"
          />
          <button
            onClick={handleAdd}
            className="px-3 sm:px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Add</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      )}
    </div>
  );
};
