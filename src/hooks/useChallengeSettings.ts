// src/hooks/useChallengeSettings.ts
import { useState, useCallback, useEffect } from 'react';
import type { User } from '../types/user';
import type { DayProgress } from '../types/dayprogress';
import { getDefaultTasks, getTodayDate } from '../utils/utils';
import { challengeService } from '../services/challengeService';

/**
 * Hook to manage challenge settings and history
 */
export function useChallengeSettings(
  user: User | null,
  level: 'Soft' | 'Hard' | 'Custom',
  days: 21 | 45 | 60 | 75,
  dailyProgress: Record<string, DayProgress>,
  updateUser?: (newChallengeId: string) => void,
  onDaysChange?: (days: 21 | 45 | 60 | 75) => void,
  onLevelChange?: (level: 'Soft' | 'Hard' | 'Custom') => void,
  onProgressUpdate?: (updater: (prev: Record<string, DayProgress>) => Record<string, DayProgress>) => void,
  onReloadProgress?: () => Promise<void>
) {
  const [history, setHistory] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'tasks' | 'photos'>('tasks');

  const appUser = user as NonNullable<User>;
  const challengeId = appUser?.currentChallengeId;

  const handleDaysChange = useCallback(
    async (newDays: 21 | 45 | 60 | 75, resetProgress: boolean = false) => {
      if (!challengeId) return console.error('No challenge ID available for update');

      if (resetProgress) {
        // Create a new challenge
        try {
          const newChallenge = await challengeService.createChallenge(newDays, level);
          const newChallengeId = newChallenge.challenge.challengeId;
          if (updateUser) {
            updateUser(newChallengeId);
          }
          // Reset local state
          if (onDaysChange) onDaysChange(newDays);
          if (onProgressUpdate) {
            onProgressUpdate(() => ({}));
          }
          if (onReloadProgress) {
            await onReloadProgress();
          }
        } catch (error) {
          console.error('Failed to create new challenge:', error);
        }
      } else {
        // Just update days without resetting
        if (onDaysChange) onDaysChange(newDays);

        try {
          await challengeService.updateDays(challengeId, newDays);
        } catch (error) {
          console.error('Failed to update challenge days on server:', error);
        }
      }
    },
    [challengeId, level, updateUser, onDaysChange, onProgressUpdate, onReloadProgress]
  );

  const handleLevelChange = useCallback(
    async (newLevel: 'Soft' | 'Hard' | 'Custom', resetProgress: boolean = false) => {
      if (!challengeId) return console.error('No challenge ID available for update');

      if (resetProgress) {
        // Create a new challenge with new level
        try {
          const newChallenge = await challengeService.createChallenge(days, newLevel);
          const newChallengeId = newChallenge.challenge.challengeId;
          if (updateUser) {
            updateUser(newChallengeId);
          }
          // Reset local state
          if (onLevelChange) onLevelChange(newLevel);
          if (onProgressUpdate) {
            onProgressUpdate(() => ({}));
          }
          if (onReloadProgress) {
            await onReloadProgress();
          }
        } catch (error) {
          console.error('Failed to create new challenge:', error);
        }
      } else {
        // Update difficulty of existing challenge
        const tasksToSend = newLevel === 'Custom' ? dailyProgress[getTodayDate()]?.tasks : undefined;

        // Optimistic UI Update
        const today = getTodayDate();
        const newTasks =
          newLevel === 'Custom' ? tasksToSend || getDefaultTasks('Soft') : getDefaultTasks(newLevel);

        if (onLevelChange) onLevelChange(newLevel);
        if (onProgressUpdate) {
          onProgressUpdate(prev => ({
            ...prev,
            [today]: {
              date: today,
              completionRate: newTasks.filter(t => t.completed).length / (newTasks.length || 1),
              tasks: newTasks
            }
          }));
        }

        try {
          await challengeService.updateDifficulty(challengeId, newLevel, tasksToSend);
          if (onReloadProgress) {
            await onReloadProgress();
          }
        } catch (error) {
          console.error('Failed to update challenge difficulty on server:', error);
        }
      }
    },
    [
      challengeId,
      days,
      dailyProgress,
      updateUser,
      onLevelChange,
      onProgressUpdate,
      onReloadProgress
    ]
  );

  const handleResetProgress = useCallback(async () => {
    if (!challengeId) return console.error('No challenge ID available for reset');
    
    // Optimistic UI Update
    if (onProgressUpdate) {
      onProgressUpdate(() => ({}));
    }
    
    try {
      await challengeService.resetProgress(challengeId);
      if (onReloadProgress) {
        await onReloadProgress();
      }
    } catch (error) {
      console.error('Failed to reset challenge progress on server:', error);
    }
  }, [challengeId, onProgressUpdate, onReloadProgress]);

  // Load history of inactive challenges
  const loadHistory = useCallback(async () => {
    try {
      const res = await challengeService.getHistory();
      setHistory(res.challenges || []);
    } catch (error) {
      console.error('Failed to load challenge history:', error);
    }
  }, []);

  // Load history when user changes
  useEffect(() => {
    if (user) {
      loadHistory();
      if (challengeId) {
        setSelectedChallengeId(challengeId);
      }
    }
  }, [user, loadHistory, challengeId]);

  return {
    history,
    selectedChallengeId,
    activeTab,
    setSelectedChallengeId,
    setActiveTab,
    handleDaysChange,
    handleLevelChange,
    handleResetProgress,
    loadHistory
  };
}
