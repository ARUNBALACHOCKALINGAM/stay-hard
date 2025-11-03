import { useState } from "react";
import type { Task } from "../types/task";
import { getTodayDate } from "../utils/utils";
import { Check, Plus, Trash2 } from "lucide-react";

// TodoList Component
export const TodoList: React.FC<{
  tasks: Task[];
  onTaskToggle: (id: string) => void;
  onTaskAdd: (text: string) => void;
  onTaskDelete: (id: string) => void;
  onTaskEdit: (id: string, newText: string) => void;
  canCustomize: boolean;
}> = ({ tasks, onTaskToggle, onTaskAdd, onTaskDelete, onTaskEdit, canCustomize }) => {
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

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

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {getTodayDate()}
        </h2>
        <span className="text-sm text-gray-600">
          {completedCount} / {tasks.length} completed
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {tasks.map(task => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
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
                  className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    task.completed
                      ? 'bg-green-600 border-green-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {task.completed && <Check size={16} className="text-white" />}
                </button>
                <span 
                  className={`flex-1 cursor-pointer ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
                  onDoubleClick={canCustomize ? () => handleEdit(task) : undefined}
                  title={canCustomize ? "Double-click to edit" : ""}
                >
                  {task.text}
                </span>
                {canCustomize && (
                  <button
                    onClick={() => onTaskDelete(task.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {canCustomize && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add
          </button>
        </div>
      )}
    </div>
  );
};
