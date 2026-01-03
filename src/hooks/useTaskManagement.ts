// src/hooks/useTaskManagement.ts
import { useCallback } from 'react';
import type { Task } from '../types/task';
import type { DayProgress } from '../types/dayprogress';
import { getTodayDate } from '../utils/utils';
import progressService from '../services/progressService';

interface UseTaskManagementProps {
  dailyProgress: Record<string, DayProgress>;
  setDailyProgress: (updater: (prev: Record<string, DayProgress>) => Record<string, DayProgress>) => void;
  saveToCacheIfPossible?: (dailyProgress: Record<string, DayProgress>) => void;
}

/**
 * Hook to manage task operations with optimistic UI updates
 */
export function useTaskManagement({ dailyProgress, setDailyProgress, saveToCacheIfPossible }: UseTaskManagementProps) {
  const today = getTodayDate();

  const handleTaskToggle = useCallback(
    async (id: string) => {
      const currentProgress = dailyProgress[today];
      if (!currentProgress) return;

      const progressId = currentProgress.progressId;
      if (!progressId) {
        console.error('No progressId available - cannot sync task toggle to server');
        return;
      }

      const task = currentProgress.tasks.find(t => t.id === id);
      if (!task) return;

      const newCompletedStatus = !task.completed;

      // 1. Optimistic UI Update
      setDailyProgress(prev => {
        const currentProgress = prev[today];
        if (!currentProgress) return prev;

        const updatedTasks = currentProgress.tasks.map(t =>
          t.id === id ? { ...t, completed: newCompletedStatus } : t
        );
        const completionRate = updatedTasks.filter(t => t.completed).length / (updatedTasks.length || 1);

        const updated = {
          ...prev,
          [today]: {
            ...currentProgress,
            completionRate,
            tasks: updatedTasks,
            // mark local optimistic update time to avoid immediate overwrite from background sync
            lastLocalUpdate: Date.now()
          }
        };

        // Save to cache immediately for instant persistence
        if (saveToCacheIfPossible) {
          saveToCacheIfPossible(updated);
        }

        return updated;
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

          setDailyProgress(prev => ({
            ...prev,
            [today]: {
              date: today,
              completionRate,
              tasks: tasksFromServer,
              progressId: updatedProgress._id
            }
          }));
        }
      } catch (error) {
        console.error('Failed to update task status on server:', error);
        // Rollback optimistic update
        setDailyProgress(prev => {
          const currentProgress = prev[today];
          if (!currentProgress) return prev;

          const revertedTasks = currentProgress.tasks.map(t =>
            t.id === id ? { ...t, completed: !newCompletedStatus } : t
          );
          const completionRate = revertedTasks.filter(t => t.completed).length / (revertedTasks.length || 1);

          return {
            ...prev,
            [today]: {
              ...currentProgress,
              completionRate,
              tasks: revertedTasks
            }
          };
        });
      }
    },
    [today, dailyProgress, setDailyProgress]
  );

  const handleTaskAdd = useCallback(
    async (text: string) => {
      const currentProgress = dailyProgress[today];
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
      setDailyProgress(prev => {
        const currentProgress = prev[today];
        if (!currentProgress) return prev;

        const updatedTasks = [...currentProgress.tasks, newTask];
        const completionRate = updatedTasks.filter(t => t.completed).length / (updatedTasks.length || 1);

        return {
          ...prev,
          [today]: {
            ...currentProgress,
            completionRate,
            tasks: updatedTasks,
            lastLocalUpdate: Date.now()
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

          setDailyProgress(prev => ({
            ...prev,
            [today]: {
              date: today,
              completionRate,
              tasks: tasksFromServer,
              progressId: updatedProgress._id
            }
          }));
        }
      } catch (error) {
        console.error('Failed to add task on server:', error);
        // Rollback optimistic update
        setDailyProgress(prev => {
          const currentProgress = prev[today];
          if (!currentProgress) return prev;

          const revertedTasks = currentProgress.tasks.filter(t => t.id !== newTask.id);
          const completionRate =
            revertedTasks.length > 0 ? revertedTasks.filter(t => t.completed).length / revertedTasks.length : 0;

          return {
            ...prev,
            [today]: {
              ...currentProgress,
              completionRate,
              tasks: revertedTasks
            }
          };
        });
      }
    },
    [today, dailyProgress, setDailyProgress]
  );

  const handleTaskDelete = useCallback(
    async (id: string) => {
      const currentProgress = dailyProgress[today];
      if (!currentProgress) return;

      const progressId = currentProgress.progressId;
      if (!progressId) {
        console.error('No progressId available - cannot sync task delete to server');
        return;
      }

      const deletedTask = currentProgress.tasks.find(t => t.id === id);
      if (!deletedTask) return;

      // 1. Optimistic UI Update
      setDailyProgress(prev => {
        const currentProgress = prev[today];
        if (!currentProgress) return prev;

        const updatedTasks = currentProgress.tasks.filter(t => t.id !== id);
        const completionRate =
          updatedTasks.length > 0 ? updatedTasks.filter(t => t.completed).length / updatedTasks.length : 0;

        return {
          ...prev,
          [today]: {
            ...currentProgress,
            completionRate,
            tasks: updatedTasks,
            lastLocalUpdate: Date.now()
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

          const completionRate =
            tasksFromServer.length > 0 ? tasksFromServer.filter(t => t.completed).length / tasksFromServer.length : 0;

          setDailyProgress(prev => ({
            ...prev,
            [today]: {
              date: today,
              completionRate,
              tasks: tasksFromServer,
              progressId: updatedProgress._id
            }
          }));
        }
      } catch (error) {
        console.error('Failed to delete task on server:', error);
        // Rollback optimistic update
        setDailyProgress(prev => {
          const currentProgress = prev[today];
          if (!currentProgress) return prev;

          const restoredTasks = [...currentProgress.tasks, deletedTask];
          const completionRate = restoredTasks.filter(t => t.completed).length / restoredTasks.length;

          return {
            ...prev,
            [today]: {
              ...currentProgress,
              completionRate,
              tasks: restoredTasks
            }
          };
        });
      }
    },
    [today, dailyProgress, setDailyProgress]
  );

  const handleTaskEdit = useCallback(
    async (id: string, newText: string) => {
      const currentProgress = dailyProgress[today];
      if (!currentProgress) return;

      const progressId = currentProgress.progressId;
      if (!progressId) {
        console.error('No progressId available - cannot sync task edit to server');
        return;
      }

      const oldTask = currentProgress.tasks.find(t => t.id === id);
      if (!oldTask) return;
      const oldText = oldTask.text;

      // 1. Optimistic UI Update
      setDailyProgress(prev => {
        const currentProgress = prev[today];
        if (!currentProgress) return prev;

        const updatedTasks = currentProgress.tasks.map(t => (t.id === id ? { ...t, text: newText.trim() } : t));

        return {
          ...prev,
          [today]: {
            ...currentProgress,
            tasks: updatedTasks,
            lastLocalUpdate: Date.now()
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

          setDailyProgress(prev => ({
            ...prev,
            [today]: {
              date: today,
              completionRate,
              tasks: tasksFromServer,
              progressId: updatedProgress._id
            }
          }));
        }
      } catch (error) {
        console.error('Failed to update task text on server:', error);
        // Rollback optimistic update
        setDailyProgress(prev => {
          const currentProgress = prev[today];
          if (!currentProgress) return prev;

          const revertedTasks = currentProgress.tasks.map(t => (t.id === id ? { ...t, text: oldText } : t));

          return {
            ...prev,
            [today]: {
              ...currentProgress,
              tasks: revertedTasks
            }
          };
        });
      }
    },
    [today, dailyProgress, setDailyProgress]
  );

  return {
    handleTaskToggle,
    handleTaskAdd,
    handleTaskDelete,
    handleTaskEdit
  };
}
