// src/hooks/useTaskManagement.ts
import { useCallback } from 'react';
import type { Task } from '../types/task';
import type { DayProgress } from '../types/dayprogress';
import { getTodayDate } from '../utils/utils';
import progressService from '../services/progressService';

interface UseTaskManagementProps {
  dailyProgress: Record<string, DayProgress>;
  setDailyProgress: (
    updater: (prev: Record<string, DayProgress>) => Record<string, DayProgress>
  ) => void;
  saveToCacheIfPossible?: (dailyProgress: Record<string, DayProgress>) => void;
}

/**
 * Optimistic task management (client is source of truth)
 */
export function useTaskManagement({
  dailyProgress,
  setDailyProgress,
  saveToCacheIfPossible
}: UseTaskManagementProps) {
  const today = getTodayDate();

  // ---------------- TOGGLE ----------------
  const handleTaskToggle = useCallback(async (id: string) => {
    const day = dailyProgress[today];
    if (!day?.progressId) return;

    const task = day.tasks.find(t => t.id === id);
    if (!task) return;

    const previous = task.completed;
    const next = !previous;

    // 1. Optimistic update
    setDailyProgress(prev => {
      const current = prev[today];
      if (!current) return prev;

      const tasks = current.tasks.map(t =>
        t.id === id ? { ...t, completed: next } : t
      );

      const completionRate =
        tasks.filter(t => t.completed).length / (tasks.length || 1);

      const updated = {
        ...prev,
        [today]: {
          ...current,
          tasks,
          completionRate,
          lastLocalUpdate: Date.now()
        }
      };

      saveToCacheIfPossible?.(updated);
      return updated;
    });

    // 2. Server confirmation
    try {
      await progressService.updateTaskStatus(day.progressId, id, next);
    } catch (err) {
      // 3. Rollback
      setDailyProgress(prev => {
        const current = prev[today];
        if (!current) return prev;

        const tasks = current.tasks.map(t =>
          t.id === id ? { ...t, completed: previous } : t
        );

        const completionRate =
          tasks.filter(t => t.completed).length / (tasks.length || 1);

        return {
          ...prev,
          [today]: {
            ...current,
            tasks,
            completionRate
          }
        };
      });
    }
  }, [dailyProgress, setDailyProgress, today, saveToCacheIfPossible]);

  // ---------------- ADD ----------------
  const handleTaskAdd = useCallback(async (text: string) => {
    const day = dailyProgress[today];
    if (!day?.progressId) return;

    const tempId = `temp-${Date.now()}`;
    const newTask: Task = { id: tempId, text, completed: false };

    // 1. Optimistic add
    setDailyProgress(prev => {
      const current = prev[today];
      if (!current) return prev;

      const tasks = [...current.tasks, newTask];

      return {
        ...prev,
        [today]: {
          ...current,
          tasks,
          completionRate:
            tasks.filter(t => t.completed).length / tasks.length,
          lastLocalUpdate: Date.now()
        }
      };
    });

    // 2. Server confirmation
    try {
      await progressService.addTask(day.progressId, text);
    } catch (err) {
      // 3. Rollback
      setDailyProgress(prev => {
        const current = prev[today];
        if (!current) return prev;

        const tasks = current.tasks.filter(t => t.id !== tempId);

        return {
          ...prev,
          [today]: {
            ...current,
            tasks,
            completionRate:
              tasks.length > 0
                ? tasks.filter(t => t.completed).length / tasks.length
                : 0
          }
        };
      });
    }
  }, [dailyProgress, setDailyProgress, today]);

  // ---------------- DELETE ----------------
  const handleTaskDelete = useCallback(async (id: string) => {
    const day = dailyProgress[today];
    if (!day?.progressId) return;

    const deleted = day.tasks.find(t => t.id === id);
    if (!deleted) return;

    // 1. Optimistic delete
    setDailyProgress(prev => {
      const current = prev[today];
      if (!current) return prev;

      const tasks = current.tasks.filter(t => t.id !== id);

      return {
        ...prev,
        [today]: {
          ...current,
          tasks,
          completionRate:
            tasks.length > 0
              ? tasks.filter(t => t.completed).length / tasks.length
              : 0,
          lastLocalUpdate: Date.now()
        }
      };
    });

    // 2. Server confirmation
    try {
      await progressService.deleteTask(day.progressId, id);
    } catch (err) {
      // 3. Rollback
      setDailyProgress(prev => {
        const current = prev[today];
        if (!current) return prev;

        const tasks = [...current.tasks, deleted];

        return {
          ...prev,
          [today]: {
            ...current,
            tasks,
            completionRate:
              tasks.filter(t => t.completed).length / tasks.length
          }
        };
      });
    }
  }, [dailyProgress, setDailyProgress, today]);

  // ---------------- EDIT ----------------
  const handleTaskEdit = useCallback(async (id: string, newText: string) => {
    const day = dailyProgress[today];
    if (!day?.progressId) return;

    const task = day.tasks.find(t => t.id === id);
    if (!task) return;

    const oldText = task.text;

    // 1. Optimistic edit
    setDailyProgress(prev => {
      const current = prev[today];
      if (!current) return prev;

      return {
        ...prev,
        [today]: {
          ...current,
          tasks: current.tasks.map(t =>
            t.id === id ? { ...t, text: newText } : t
          ),
          lastLocalUpdate: Date.now()
        }
      };
    });

    // 2. Server confirmation
    try {
      await progressService.updateTaskText(day.progressId, id, newText);
    } catch (err) {
      // 3. Rollback
      setDailyProgress(prev => {
        const current = prev[today];
        if (!current) return prev;

        return {
          ...prev,
          [today]: {
            ...current,
            tasks: current.tasks.map(t =>
              t.id === id ? { ...t, text: oldText } : t
            )
          }
        };
      });
    }
  }, [dailyProgress, setDailyProgress, today]);

  return {
    handleTaskToggle,
    handleTaskAdd,
    handleTaskDelete,
    handleTaskEdit
  };
}
