// src/hooks/useLocalTaskCache.ts
import { useCallback } from 'react';
import type { DayProgress } from '../types/dayprogress';

const CACHE_PREFIX = 'stay-hard-cache';
const CACHE_VERSION = 'v1';

interface CacheKey {
  userId: string;
  challengeId: string;
}

/**
 * Hook to manage localStorage caching for faster task updates
 * Provides immediate UI feedback while server syncs in background
 */
export function useLocalTaskCache() {
  // Generate cache key for user's current challenge
  const getCacheKey = useCallback((key: CacheKey) => {
    return `${CACHE_PREFIX}:${CACHE_VERSION}:${key.userId}:${key.challengeId}`;
  }, []);

  // Save daily progress to localStorage
  const saveDailyProgress = useCallback(
    (key: CacheKey, dailyProgress: Record<string, DayProgress>) => {
      try {
        const cacheKey = getCacheKey(key);
        const data = {
          dailyProgress,
          timestamp: Date.now(),
          version: CACHE_VERSION
        };
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
        // Gracefully handle localStorage errors (quota exceeded, private mode, etc.)
      }
    },
    [getCacheKey]
  );

  // Load daily progress from localStorage
  const loadDailyProgress = useCallback(
    (key: CacheKey): Record<string, DayProgress> | null => {
      try {
        const cacheKey = getCacheKey(key);
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;

        const data = JSON.parse(cached);
        
        // Validate cache version
        if (data.version !== CACHE_VERSION) {
          console.log('Cache version mismatch, invalidating');
          localStorage.removeItem(cacheKey);
          return null;
        }

        // Optional: Add cache expiration (e.g., 7 days)
        const cacheAge = Date.now() - data.timestamp;
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        if (cacheAge > maxAge) {
          console.log('Cache expired, invalidating');
          localStorage.removeItem(cacheKey);
          return null;
        }

        // Reconstruct Date objects for completedAt fields
        const dailyProgress: Record<string, DayProgress> = {};
        Object.keys(data.dailyProgress).forEach(date => {
          const progress = data.dailyProgress[date];
          dailyProgress[date] = {
            ...progress,
            tasks: progress.tasks.map((task: any) => ({
              ...task,
              ...(task.completedAt ? { completedAt: new Date(task.completedAt) } : {})
            }))
          };
        });

        return dailyProgress;
      } catch (error) {
        console.warn('Failed to load from localStorage:', error);
        return null;
      }
    },
    [getCacheKey]
  );

  // Clear cache for specific challenge
  const clearCache = useCallback(
    (key: CacheKey) => {
      try {
        const cacheKey = getCacheKey(key);
        localStorage.removeItem(cacheKey);
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    },
    [getCacheKey]
  );

  // Clear all app caches (useful for logout)
  const clearAllCaches = useCallback(() => {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(CACHE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear all caches:', error);
    }
  }, []);

  return {
    saveDailyProgress,
    loadDailyProgress,
    clearCache,
    clearAllCaches
  };
}
