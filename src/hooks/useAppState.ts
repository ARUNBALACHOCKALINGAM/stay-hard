// src/hooks/useAppState.ts (New File)

import { useState, useCallback, useEffect } from 'react';

// You will need to import your types and utils here
import type { User } from '../types/user';
import type { Task } from '../types/task';
import type { AppState } from '../types/appstate';
import type { ProgressPhoto } from '../types/progressphoto';
import { getDefaultTasks, getTodayDate } from '../utils/utils';
import { challengeService } from '../services/challengeService';
import progressService from '../services/progressService';


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

  // Cast user for challenge-related logic, assuming existence is checked before usage
  const appUser = user as NonNullable<User>;
  const challengeId = appUser?.currentChallengeId;

  // Load all progress for the challenge to populate ProgressGrid and today's tasks from DB
  const loadAllProgressForChallenge = useCallback(async () => {
    if (!challengeId) return;
    try {
      const res = await progressService.getAllProgressForChallenge(challengeId);
      const items = Array.isArray(res?.items) ? res.items : [];

      // Build a map keyed by date
      const progressMap: Record<string, any> = {};
      items.forEach((p: any) => {
        const tasksFromServer: Task[] = Array.isArray(p.tasks)
          ? p.tasks.map((t: any) => ({
              id: t.id,
              text: t.text,
              completed: Boolean(t.completed),
              ...(t.completedAt ? { completedAt: new Date(t.completedAt) } : {}),
            }))
          : [];

        const completionRate = tasksFromServer.length
          ? tasksFromServer.filter(t => t.completed).length / tasksFromServer.length
          : 0;

        progressMap[p.date] = {
          date: p.date,
          completionRate: typeof p.completionRate === 'number' ? p.completionRate : completionRate,
          tasks: tasksFromServer,
          progressId: p._id,
        };
      });

      // Merge into state
      setState(prev => ({
        ...prev,
        dailyProgress: {
          ...prev.dailyProgress,
          ...progressMap,
        },
      }));
    } catch (error) {
      console.error('Failed to load all progress for challenge:', error);
    }
  }, [challengeId]);

  const initializeDailyProgress = useCallback(async (date: string) => {
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

    try {
      const progressData = await progressService.getTasksForDate({ userId: appUser._id, challengeId: challengeId!, date });
      if (progressData && Array.isArray(progressData.tasks)) {
        // Map API tasks into our Task[] shape (normalize completedAt null -> undefined)
        const tasksFromServer: Task[] = progressData.tasks.map((t: any) => ({
          id: t.id,
          text: t.text,
          completed: Boolean(t.completed),
          ...(t.completedAt ? { completedAt: new Date(t.completedAt) } : {})
        }));

        const completionRate = tasksFromServer.length
          ? tasksFromServer.filter(t => t.completed).length / tasksFromServer.length
          : 0;

        // Overwrite today's tasks with server data
        setState(prev => ({
          ...prev,
          dailyProgress: {
            ...prev.dailyProgress,
            [date]: {
              date,
              completionRate,
              tasks: tasksFromServer,
              progressId: progressData._id // Store the server-side document ID
            }
          }
        }));
      } else {
        console.log('No existing progress found for today - using default tasks');
      }
    } catch (error) {
      console.error('Error initializing daily progress:', error);
    }
  }, [state.level, challengeId]);

  // Initialize Daily Progress Effect (Moved from App.tsx)
  useEffect(() => {
    if (!user) return;
    if (!state.dailyProgress[today]) {
      initializeDailyProgress(today);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, state.level]); // Removed initializeDailyProgress as dependency for simplicity since state.level is already a dependency

  // Fetch entire challenge progress when user/challenge changes (for ProgressGrid and history)
  useEffect(() => {
    if (!user || !challengeId) return;
    loadAllProgressForChallenge();
  }, [user, challengeId, loadAllProgressForChallenge]);

  // --- Handlers: Task Management ---

  const handleTaskToggle = useCallback(async (id: string) => {
    const currentProgress = state.dailyProgress[today];
    if (!currentProgress) return;
    console.log(currentProgress);

    const progressId = currentProgress.progressId;
    if (!progressId) {
      console.error('No progressId available - cannot sync task toggle to server');
      return;
    }

    // Find the task to get its current completion status
    const task = currentProgress.tasks.find(t => t.id === id);
    if (!task) return;

    const newCompletedStatus = !task.completed;

    // 1. Optimistic UI Update
    setState(prev => {
      const currentProgress = prev.dailyProgress[today];
      if (!currentProgress) return prev;

      const updatedTasks = currentProgress.tasks.map(t =>
        t.id === id ? { ...t, completed: newCompletedStatus } : t
      );
      const completionRate = updatedTasks.filter(t => t.completed).length / (updatedTasks.length || 1);

      return {
        ...prev,
        dailyProgress: {
          ...prev.dailyProgress,
          [today]: {
            ...currentProgress,
            completionRate,
            tasks: updatedTasks
          }
        }
      };
    });

    // 2. API Write
    try {
      const updatedProgress = await progressService.updateTaskStatus(progressId, id, newCompletedStatus);
      
      // 3. Sync state with server response
      if (updatedProgress && Array.isArray(updatedProgress.tasks)) {
        const tasksFromServer: Task[] = updatedProgress.tasks.map((t: any) => ({
          id: t.id,
          text: t.text,
          completed: Boolean(t.completed),
          ...(t.completedAt ? { completedAt: new Date(t.completedAt) } : {})
        }));

        const completionRate = tasksFromServer.length
          ? tasksFromServer.filter(t => t.completed).length / tasksFromServer.length
          : 0;

        setState(prev => ({
          ...prev,
          dailyProgress: {
            ...prev.dailyProgress,
            [today]: {
              date: today,
              completionRate,
              tasks: tasksFromServer,
              progressId: updatedProgress._id
            }
          }
        }));
      }
    } catch (error) {
      console.error('Failed to update task status on server:', error);
      // Rollback optimistic update
      setState(prev => {
        const currentProgress = prev.dailyProgress[today];
        if (!currentProgress) return prev;

        const revertedTasks = currentProgress.tasks.map(t =>
          t.id === id ? { ...t, completed: !newCompletedStatus } : t
        );
        const completionRate = revertedTasks.filter(t => t.completed).length / (revertedTasks.length || 1);

        return {
          ...prev,
          dailyProgress: {
            ...prev.dailyProgress,
            [today]: {
              ...currentProgress,
              completionRate,
              tasks: revertedTasks
            }
          }
        };
      });
    }
  }, [today, state.dailyProgress]);

  const handleTaskAdd = useCallback(async (text: string) => {
    const currentProgress = state.dailyProgress[today];
    if (!currentProgress) return;

    const progressId = currentProgress.progressId;
    if (!progressId) {
      console.error('No progressId available - cannot sync task add to server');
      return;
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      text: text.trim(),
      completed: false
    };

    // 1. Optimistic UI Update
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
            ...currentProgress,
            completionRate,
            tasks: updatedTasks
          }
        }
      };
    });

    // 2. API Write
    try {
      const updatedProgress = await progressService.addTask(progressId, text.trim());
      
      // 3. Sync state with server response
      if (updatedProgress && Array.isArray(updatedProgress.tasks)) {
        const tasksFromServer: Task[] = updatedProgress.tasks.map((t: any) => ({
          id: t.id,
          text: t.text,
          completed: Boolean(t.completed),
          ...(t.completedAt ? { completedAt: new Date(t.completedAt) } : {})
        }));

        const completionRate = tasksFromServer.length
          ? tasksFromServer.filter(t => t.completed).length / tasksFromServer.length
          : 0;

        setState(prev => ({
          ...prev,
          dailyProgress: {
            ...prev.dailyProgress,
            [today]: {
              date: today,
              completionRate,
              tasks: tasksFromServer,
              progressId: updatedProgress._id
            }
          }
        }));
      }
    } catch (error) {
      console.error('Failed to add task on server:', error);
      // Rollback optimistic update
      setState(prev => {
        const currentProgress = prev.dailyProgress[today];
        if (!currentProgress) return prev;

        const revertedTasks = currentProgress.tasks.filter(t => t.id !== newTask.id);
        const completionRate = revertedTasks.length > 0
          ? revertedTasks.filter(t => t.completed).length / revertedTasks.length
          : 0;

        return {
          ...prev,
          dailyProgress: {
            ...prev.dailyProgress,
            [today]: {
              ...currentProgress,
              completionRate,
              tasks: revertedTasks
            }
          }
        };
      });
    }
  }, [today, state.dailyProgress]);

  const handleTaskDelete = useCallback(async (id: string) => {
    const currentProgress = state.dailyProgress[today];
    if (!currentProgress) return;

    const progressId = currentProgress.progressId;
    if (!progressId) {
      console.error('No progressId available - cannot sync task delete to server');
      return;
    }

    // Store the deleted task for potential rollback
    const deletedTask = currentProgress.tasks.find(t => t.id === id);
    if (!deletedTask) return;

    // 1. Optimistic UI Update
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
            ...currentProgress,
            completionRate,
            tasks: updatedTasks
          }
        }
      };
    });

    // 2. API Write
    try {
      const updatedProgress = await progressService.deleteTask(progressId, id);
      
      // 3. Sync state with server response
      if (updatedProgress && Array.isArray(updatedProgress.tasks)) {
        const tasksFromServer: Task[] = updatedProgress.tasks.map((t: any) => ({
          id: t.id,
          text: t.text,
          completed: Boolean(t.completed),
          ...(t.completedAt ? { completedAt: new Date(t.completedAt) } : {})
        }));

        const completionRate = tasksFromServer.length > 0
          ? tasksFromServer.filter(t => t.completed).length / tasksFromServer.length
          : 0;

        setState(prev => ({
          ...prev,
          dailyProgress: {
            ...prev.dailyProgress,
            [today]: {
              date: today,
              completionRate,
              tasks: tasksFromServer,
              progressId: updatedProgress._id
            }
          }
        }));
      }
    } catch (error) {
      console.error('Failed to delete task on server:', error);
      // Rollback optimistic update - restore the deleted task
      setState(prev => {
        const currentProgress = prev.dailyProgress[today];
        if (!currentProgress) return prev;

        const restoredTasks = [...currentProgress.tasks, deletedTask];
        const completionRate = restoredTasks.filter(t => t.completed).length / restoredTasks.length;

        return {
          ...prev,
          dailyProgress: {
            ...prev.dailyProgress,
            [today]: {
              ...currentProgress,
              completionRate,
              tasks: restoredTasks
            }
          }
        };
      });
    }
  }, [today, state.dailyProgress]);

  const handleTaskEdit = useCallback(async (id: string, newText: string) => {
    const currentProgress = state.dailyProgress[today];
    if (!currentProgress) return;

    const progressId = currentProgress.progressId;
    if (!progressId) {
      console.error('No progressId available - cannot sync task edit to server');
      return;
    }

    // Store the old text for potential rollback
    const oldTask = currentProgress.tasks.find(t => t.id === id);
    if (!oldTask) return;
    const oldText = oldTask.text;

    // 1. Optimistic UI Update
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

    // 2. API Write
    try {
      const updatedProgress = await progressService.updateTaskText(progressId, id, newText.trim());
      
      // 3. Sync state with server response
      if (updatedProgress && Array.isArray(updatedProgress.tasks)) {
        const tasksFromServer: Task[] = updatedProgress.tasks.map((t: any) => ({
          id: t.id,
          text: t.text,
          completed: Boolean(t.completed),
          ...(t.completedAt ? { completedAt: new Date(t.completedAt) } : {})
        }));

        const completionRate = tasksFromServer.length
          ? tasksFromServer.filter(t => t.completed).length / tasksFromServer.length
          : 0;

        setState(prev => ({
          ...prev,
          dailyProgress: {
            ...prev.dailyProgress,
            [today]: {
              date: today,
              completionRate,
              tasks: tasksFromServer,
              progressId: updatedProgress._id
            }
          }
        }));
      }
    } catch (error) {
      console.error('Failed to update task text on server:', error);
      // Rollback optimistic update - restore the old text
      setState(prev => {
        const currentProgress = prev.dailyProgress[today];
        if (!currentProgress) return prev;

        const revertedTasks = currentProgress.tasks.map(t =>
          t.id === id ? { ...t, text: oldText } : t
        );

        return {
          ...prev,
          dailyProgress: {
            ...prev.dailyProgress,
            [today]: {
              ...currentProgress,
              tasks: revertedTasks
            }
          }
        };
      });
    }
  }, [today, state.dailyProgress]);

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
      // 3. Refresh all progress to sync UI (grid + today)
      await loadAllProgressForChallenge();
    } catch (error) {
      console.error('Failed to update challenge difficulty on server:', error);
      // Optional: Rollback UI state or show error notification
    }
  }, [challengeId, state.dailyProgress, loadAllProgressForChallenge, today]);


  const handleResetProgress = useCallback(async () => {
    if (!challengeId) return console.error('No challenge ID available for reset');
    // 1. Optimistic UI Update
    setState(INITIAL_STATE);
    try {
      // 2. Immediate API Write
      await challengeService.resetProgress(challengeId);
      // 3. Refresh all progress to sync UI
      await loadAllProgressForChallenge();
    } catch (error) {
      console.error('Failed to reset challenge progress on server:', error);
      // Optional: Re-fetch or show error to the user
    }

  }, [challengeId, loadAllProgressForChallenge, today]);




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