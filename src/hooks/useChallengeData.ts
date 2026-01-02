// src/hooks/useChallengeData.ts
import { useState, useCallback, useEffect } from 'react';
import type { User } from '../types/user';
import type { Task } from '../types/task';
import type { DayProgress } from '../types/dayprogress';
import { getDefaultTasks, getTodayDate } from '../utils/utils';
import { challengeService } from '../services/challengeService';
import progressService from '../services/progressService';
import { useLocalTaskCache } from './useLocalTaskCache';

interface ChallengeData {
  days: 21 | 45 | 60 | 75;
  level: 'Soft' | 'Hard' | 'Custom';
  startDate: string;
  dailyProgress: Record<string, DayProgress>;
}

/**
 * Hook to manage challenge progress data loading and synchronization
 */
export function useChallengeData(
  user: User | null,
  updateUser?: (newChallengeId: string) => void
) {
  const [data, setData] = useState<ChallengeData>({
    days: 21,
    level: 'Soft',
    startDate: '',
    dailyProgress: {}
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const appUser = user as NonNullable<User>;
  const challengeId = appUser?.currentChallengeId;
  const today = getTodayDate();

  const { saveDailyProgress, loadDailyProgress, clearCache } = useLocalTaskCache();

  // Helper to save progress to cache
  const saveToCacheIfPossible = useCallback(
    (dailyProgress: Record<string, DayProgress>) => {
      if (appUser?._id && challengeId) {
        saveDailyProgress({ userId: appUser._id, challengeId }, dailyProgress);
      }
    },
    [appUser?._id, challengeId, saveDailyProgress]
  );

  // Load all progress for the challenge
  const loadAllProgressForChallenge = useCallback(async () => {
    if (!challengeId) return;
    setIsSyncing(true);
    try {
      const challenge = await challengeService.getChallenge(challengeId);
      setData(prev => ({ ...prev, days: challenge.challengeDays }));

      const res = await progressService.getAllProgressForChallenge(challengeId);
      const items = Array.isArray(res?.items) ? res.items : [];

      const progressMap: Record<string, DayProgress> = {};
      let earliestDate = '';

      items.forEach((p: any) => {
        const tasksFromServer: Task[] = Array.isArray(p.tasks)
          ? p.tasks.map((t: any) => ({
              id: t.id,
              text: t.text,
              completed: Boolean(t.completed),
              ...(t.completedAt ? { completedAt: new Date(t.completedAt) } : {})
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
          dayNumber: p.dayNumber
        };

        if (!earliestDate || p.date < earliestDate) {
          earliestDate = p.date;
        }
      });

      setData(prev => {
        const updated = {
          ...prev,
          startDate: earliestDate || getTodayDate(),
          dailyProgress: {
            ...prev.dailyProgress,
            ...progressMap
          }
        };
        // Save to cache after server sync
        saveToCacheIfPossible(updated.dailyProgress);
        return updated;
      });
    } catch (error) {
      console.error('Failed to load challenge details and progress:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [challengeId, saveToCacheIfPossible]);

  // Initialize current challenge if not set
  useEffect(() => {
    if (!user) return;
    if (challengeId) return;

    let cancelled = false;

    (async () => {
      setIsSyncing(true);
      try {
        const res = await challengeService.getCurrentChallenge();
        if (cancelled) return;
        const ch = res?.challenge || res;
        const fetchedId = ch?.challengeId || ch?._id || ch?.id;
        if (!fetchedId) return;
        if (updateUser) updateUser(fetchedId);

        const days = ch?.challengeDays || data.days;
        const startDate = ch?.startDate || data.startDate || getTodayDate();
        setData(prev => ({ ...prev, days, startDate }));

        // Try loading from cache first for instant UI
        if (appUser?._id && fetchedId) {
          const cached = loadDailyProgress({ userId: appUser._id, challengeId: fetchedId });
          if (cached) {
            console.log('Loaded progress from cache');
            setData(prev => ({ ...prev, dailyProgress: cached }));
          }
        }

        try {
          const res2 = await progressService.getAllProgressForChallenge(fetchedId);
          const items = Array.isArray(res2?.items) ? res2.items : [];
          const progressMap: Record<string, DayProgress> = {};
          let earliestDate = '';

          items.forEach((p: any) => {
            const tasksFromServer: Task[] = Array.isArray(p.tasks)
              ? p.tasks.map((t: any) => ({
                  id: t.id,
                  text: t.text,
                  completed: Boolean(t.completed),
                  ...(t.completedAt ? { completedAt: new Date(t.completedAt) } : {})
                }))
              : [];
            const completionRate = tasksFromServer.length
              ? tasksFromServer.filter(t => t.completed).length / tasksFromServer.length
              : 0;
            progressMap[p.date] = {
              date: p.date,
              completionRate,
              tasks: tasksFromServer,
              progressId: p._id,
              dayNumber: p.dayNumber
            };
            if (!earliestDate || p.date < earliestDate) earliestDate = p.date;
          });

          setData(prev => {
            const updated = {
              ...prev,
              startDate: earliestDate || startDate,
              dailyProgress: {
                ...prev.dailyProgress,
                ...progressMap
              }
            };
            // Save to cache after server sync
            saveToCacheIfPossible(updated.dailyProgress);
            return updated;
          });
        } catch (e) {
          console.error('Failed to load progress for fetched current challenge:', e);
        }
      } catch (e) {
        console.error('Failed to fetch current challenge:', e);
      } finally {
        setIsSyncing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, challengeId, updateUser, data.days, data.startDate, appUser?._id, loadDailyProgress, saveToCacheIfPossible]);

  // Initialize today's progress
  const initializeDailyProgress = useCallback(
    async (date: string) => {
      if (!appUser?._id || !challengeId) {
        console.warn('initializeDailyProgress: missing userId or challengeId', {
          userId: appUser?._id,
          challengeId
        });
        return;
      }

      const tasks = getDefaultTasks(data.level);
      setData(prev => ({
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
        const progressData = await progressService.getTasksForDate({
          userId: appUser._id,
          challengeId: challengeId!,
          date
        });
        
        if (progressData && Array.isArray(progressData.tasks)) {
          const tasksFromServer: Task[] = progressData.tasks.map((t: any) => ({
            id: t.id,
            text: t.text,
            completed: Boolean(t.completed),
            ...(t.completedAt ? { completedAt: new Date(t.completedAt) } : {})
          }));

          const completionRate = tasksFromServer.length
            ? tasksFromServer.filter(t => t.completed).length / tasksFromServer.length
            : 0;

          setData(prev => ({
            ...prev,
            dailyProgress: {
              ...prev.dailyProgress,
              [date]: {
                date,
                completionRate,
                tasks: tasksFromServer,
                progressId: progressData?._id,
                dayNumber: progressData?.dayNumber
              }
            }
          }));
        }
      } catch (error) {
        console.error('Error initializing daily progress:', error);
      }
    },
    [data.level, challengeId, appUser?._id]
  );

  // Initialize today's progress when needed
  useEffect(() => {
    if (!user || !appUser?._id || !challengeId) return;
    if (!data.dailyProgress[today]) {
      initializeDailyProgress(today);
    }
  }, [user, data.level, challengeId, data.dailyProgress, today, initializeDailyProgress, appUser?._id]);

  // Load all progress when challenge changes
  useEffect(() => {
    if (!user || !challengeId) return;
    loadAllProgressForChallenge();
  }, [user, challengeId, loadAllProgressForChallenge]);

  return {
    data,
    setData,
    loadAllProgressForChallenge,
    todayTasks: data.dailyProgress[today]?.tasks || [],
    todayProgress: data.dailyProgress[today],
    isSyncing,
    clearCache: () => appUser?._id && challengeId && clearCache({ userId: appUser._id, challengeId }),
    saveToCacheIfPossible
  };
}
