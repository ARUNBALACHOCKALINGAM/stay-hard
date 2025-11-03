// src/hooks/useAppState.ts (New File)

import { useState, useCallback, useEffect } from 'react';

// You will need to import your types and utils here
import type { User } from '../types/user';
import type { Task } from '../types/task';
import type { AppState } from '../types/appstate';
import type { ProgressPhoto } from '../types/progressphoto';
import { getDefaultTasks, getTodayDate } from '../utils/utils'; 
import { challengeService } from '../services/challengeService';


// Constants
const INITIAL_STATE: AppState = {
  days: 21,
  level: 'Soft',
  startDate: getTodayDate(),
  dailyProgress: {},
  photos: []
};

/**
 * Custom hook to manage the core challenge state and all its modification handlers.
 * @param user The authenticated user object, used for triggering initial load/sync.
 */
export function useAppState(user: User | null) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<'tasks' | 'photos'>('tasks');
  
  // Derived State (Can be calculated directly inside the hook)
  const today = getTodayDate();
  const todayTasks = state.dailyProgress[today]?.tasks || [];

  // --- Handlers: Daily Progress Initialization ---

  const initializeDailyProgress = useCallback((date: string) => {
    const tasks = getDefaultTasks(state.level);
    setState(prev => ({
      ...prev,
      dailyProgress: {
        ...prev.dailyProgress,
        [date]: {
          date,
          completionRate: 0,
          tasks
        }
      }
    }));
  }, [state.level]);

  // Initialize Daily Progress Effect (Moved from App.tsx)
  useEffect(() => {
    if (!user) return;
    if (!state.dailyProgress[today]) {
      initializeDailyProgress(today);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, state.level]); // Removed initializeDailyProgress as dependency for simplicity since state.level is already a dependency

  // --- Handlers: Task Management ---

  const handleTaskToggle = useCallback((id: string) => {
    setState(prev => {
      const currentProgress = prev.dailyProgress[today];
      if (!currentProgress) return prev;

      const updatedTasks = currentProgress.tasks.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      const completionRate = updatedTasks.filter(t => t.completed).length / (updatedTasks.length || 1);

      return {
        ...prev,
        dailyProgress: {
          ...prev.dailyProgress,
          [today]: {
            date: today,
            completionRate,
            tasks: updatedTasks
          }
        }
      };
    });
  }, [today]);

  const handleTaskAdd = useCallback((text: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      text: text.trim(),
      completed: false
    };

    setState(prev => {
      const currentProgress = prev.dailyProgress[today];
      if (!currentProgress) return prev;

      const updatedTasks = [...currentProgress.tasks, newTask];
      const completionRate = updatedTasks.filter(t => t.completed).length / (updatedTasks.length || 1);

      return {
        ...prev,
        dailyProgress: {
          ...prev.dailyProgress,
          [today]: {
            date: today,
            completionRate,
            tasks: updatedTasks
          }
        }
      };
    });
  }, [today]);

  const handleTaskDelete = useCallback((id: string) => {
    setState(prev => {
      const currentProgress = prev.dailyProgress[today];
      if (!currentProgress) return prev;

      const updatedTasks = currentProgress.tasks.filter(t => t.id !== id);
      const completionRate = updatedTasks.length > 0
        ? updatedTasks.filter(t => t.completed).length / updatedTasks.length
        : 0;

      return {
        ...prev,
        dailyProgress: {
          ...prev.dailyProgress,
          [today]: {
            date: today,
            completionRate,
            tasks: updatedTasks
          }
        }
      };
    });
  }, [today]);

  const handleTaskEdit = useCallback((id: string, newText: string) => {
    setState(prev => {
      const currentProgress = prev.dailyProgress[today];
      if (!currentProgress) return prev;

      const updatedTasks = currentProgress.tasks.map(t =>
        t.id === id ? { ...t, text: newText.trim() } : t
      );

      return {
        ...prev,
        dailyProgress: {
          ...prev.dailyProgress,
          [today]: {
            ...currentProgress,
            tasks: updatedTasks
          }
        }
      };
    });
  }, [today]);

  // --- Handlers: Photo Management ---

  const handlePhotoUpload = useCallback((dataUrl: string) => {
    const newPhoto: ProgressPhoto = {
      id: `photo-${Date.now()}`,
      date: getTodayDate(),
      dataUrl
    };
    setState(prev => ({
      ...prev,
      photos: [...prev.photos, newPhoto]
    }));
  }, []);

  const handlePhotoDelete = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== id)
    }));
  }, []);



  // Cast user for challenge-related logic, assuming existence is checked before usage
  const appUser = user as User; 
  const challengeId = appUser?.currentChallengeId;

  // --- Handlers: Settings & State Reset (Now with API Calls) ---

  const handleDaysChange = useCallback(async (days: 21 | 45 | 60 | 75) => {
    if (!challengeId) return console.error('No challenge ID available for update');

    // 1. Optimistic UI Update
    setState(prev => ({ 
      ...prev, 
      days, 
      startDate: getTodayDate() 
    }));

    try {
      // 2. Immediate API Write
      await challengeService.updateDays(challengeId, days);
    } catch (error) {
      console.error('Failed to update challenge days on server:', error);
      // Optional: Rollback UI state or show error notification
    }
  }, [challengeId]);


  const handleLevelChange = useCallback(async (level: 'Soft' | 'Hard' | 'Custom') => {
    if (!challengeId) return console.error('No challenge ID available for update');
    
    // Get the tasks that will be sent to the API if level is Custom
    const tasksToSend = level === 'Custom' 
      ? state.dailyProgress[getTodayDate()]?.tasks 
      : undefined;

    // 1. Optimistic UI Update
    const today = getTodayDate();
    const newTasks = level === 'Custom'
      ? tasksToSend || getDefaultTasks('Soft')
      : getDefaultTasks(level);

    setState(prev => ({
      ...prev,
      level,
      dailyProgress: {
        ...prev.dailyProgress,
        [today]: {
          date: today,
          completionRate: newTasks.filter(t => t.completed).length / (newTasks.length || 1),
          tasks: newTasks
        }
      }
    }));

    try {
      // 2. Immediate API Write
      // Pass the current tasks if setting to 'Custom'
      await challengeService.updateDifficulty(challengeId, level, tasksToSend);
    } catch (error) {
      console.error('Failed to update challenge difficulty on server:', error);
      // Optional: Rollback UI state or show error notification
    }
  }, [challengeId, state.dailyProgress]);


  const handleResetProgress = useCallback(async () => {
    if (!challengeId) return console.error('No challenge ID available for reset');

    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      // 1. Optimistic UI Update
      setState(INITIAL_STATE);
      
      try {
        // 2. Immediate API Write
        await challengeService.resetProgress(challengeId);
      } catch (error) {
        console.error('Failed to reset challenge progress on server:', error);
        // Optional: Re-fetch or show error to the user
      }
    }
  }, [challengeId]);




  return {
    // State
    state,
    activeTab,
    todayTasks,
    // Setters
    setActiveTab,
    // Handlers
    handleDaysChange,
    handleLevelChange,
    handleResetProgress,
    handleTaskToggle,
    handleTaskAdd,
    handleTaskDelete,
    handleTaskEdit,
    handlePhotoUpload,
    handlePhotoDelete,
  };
}