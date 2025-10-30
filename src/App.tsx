import  { useState, useEffect } from 'react';
import { Camera, List} from 'lucide-react';
import type { ProgressPhoto } from './types/progressphoto';
import type { AppState } from './types/appstate';
import { getDefaultTasks, getTodayDate } from './utils';
import type { Task } from './types/task';
import { TodoList } from './components/TodoList';
import { Settings } from './components/Settings';
import { PhotoGallery } from './components/PhotoGallery';
import { ProgressGrid } from './components/ProgressGrid';









// Main App Component
export default function App() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'photos'>('tasks');
  const [state, setState] = useState<AppState>({
    days: 21,
    level: 'Soft',
    startDate: getTodayDate(),
    dailyProgress: {},
    photos: []
  });

  useEffect(() => {
    const today = getTodayDate();
    if (!state.dailyProgress[today]) {
      const tasks = getDefaultTasks(state.level);
      setState(prev => ({
        ...prev,
        dailyProgress: {
          ...prev.dailyProgress,
          [today]: {
            date: today,
            completionRate: 0,
            tasks
          }
        }
      }));
    }
  }, []);

  const todayTasks = state.dailyProgress[getTodayDate()]?.tasks || [];

  const handleDaysChange = (days: 21 | 45 | 60 | 75) => {
    setState(prev => ({ ...prev, days, startDate: getTodayDate() }));
  };

  const handleLevelChange = (level: 'Soft' | 'Hard' | 'Custom') => {
    const today = getTodayDate();
    const newTasks = level === 'Custom' 
      ? state.dailyProgress[today]?.tasks || getDefaultTasks('Soft')
      : getDefaultTasks(level);
    
    setState(prev => ({
      ...prev,
      level,
      dailyProgress: {
        ...prev.dailyProgress,
        [today]: {
          date: today,
          completionRate: 0,
          tasks: newTasks
        }
      }
    }));
  };

  const handleTaskToggle = (id: string) => {
    const today = getTodayDate();
    const updatedTasks = todayTasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    const completionRate = updatedTasks.filter(t => t.completed).length / updatedTasks.length;

    setState(prev => ({
      ...prev,
      dailyProgress: {
        ...prev.dailyProgress,
        [today]: {
          date: today,
          completionRate,
          tasks: updatedTasks
        }
      }
    }));
  };

  const handleTaskAdd = (text: string) => {
    const today = getTodayDate();
    const newTask: Task = {
      id: `task-${Date.now()}`,
      text,
      completed: false
    };
    const updatedTasks = [...todayTasks, newTask];
    const completionRate = updatedTasks.filter(t => t.completed).length / updatedTasks.length;

    setState(prev => ({
      ...prev,
      dailyProgress: {
        ...prev.dailyProgress,
        [today]: {
          date: today,
          completionRate,
          tasks: updatedTasks
        }
      }
    }));
  };

  const handleTaskDelete = (id: string) => {
    const today = getTodayDate();
    const updatedTasks = todayTasks.filter(t => t.id !== id);
    const completionRate = updatedTasks.length > 0
      ? updatedTasks.filter(t => t.completed).length / updatedTasks.length
      : 0;

    setState(prev => ({
      ...prev,
      dailyProgress: {
        ...prev.dailyProgress,
        [today]: {
          date: today,
          completionRate,
          tasks: updatedTasks
        }
      }
    }));
  };

  const handleTaskEdit = (id: string, newText: string) => {
    const today = getTodayDate();
    const updatedTasks = todayTasks.map(t =>
      t.id === id ? { ...t, text: newText } : t
    );

    setState(prev => ({
      ...prev,
      dailyProgress: {
        ...prev.dailyProgress,
        [today]: {
          ...prev.dailyProgress[today],
          tasks: updatedTasks
        }
      }
    }));
  };

  const handlePhotoUpload = (dataUrl: string) => {
    const newPhoto: ProgressPhoto = {
      id: `photo-${Date.now()}`,
      date: getTodayDate(),
      dataUrl
    };
    setState(prev => ({
      ...prev,
      photos: [...prev.photos, newPhoto]
    }));
  };

  const handlePhotoDelete = (id: string) => {
    setState(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== id)
    }));
  };

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-2 italic">
          STAY <span className="underline decoration-amber-600 decoration-4 underline-offset-4">HARD</span>
        </h1>
        <p className="text-center text-gray-600 mb-8">Mental Toughness Challenge Tracker</p>

        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow-md p-1 flex gap-1">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'tasks'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List size={20} />
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'photos'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Camera size={20} />
              Photos
            </button>
          </div>
        </div>

        {activeTab === 'tasks' ? (
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <Settings
                days={state.days}
                level={state.level}
                onDaysChange={handleDaysChange}
                onLevelChange={handleLevelChange}
              />
            </div>
            <div>
              <TodoList
                tasks={todayTasks}
                onTaskToggle={handleTaskToggle}
                onTaskAdd={handleTaskAdd}
                onTaskDelete={handleTaskDelete}
                onTaskEdit={handleTaskEdit}
                canCustomize={state.level === 'Custom'}
              />
            </div>
          </div>
        ) : (
          <PhotoGallery
            photos={state.photos}
            onPhotoUpload={handlePhotoUpload}
            onPhotoDelete={handlePhotoDelete}
          />
        )}

        {activeTab === 'tasks' && (
          <ProgressGrid
            days={state.days}
            startDate={state.startDate}
            dailyProgress={state.dailyProgress}
          />
        )}
      </div>
    </div>
  );
}