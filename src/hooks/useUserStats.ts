// src/hooks/useUserStats.ts
import { useState, useEffect } from 'react';
import type { User } from '../types/user';
import { userService } from '../services/userService';

interface UserStats {
  longestStreak: number;
  currentStreak: number;
  totalChallengesCompleted: number;
  totalTasksCompleted: number;
  memberSince: string;
}

/**
 * Hook to fetch and manage user statistics and achievements
 */
export function useUserStats(user: User | null) {
  const [stats, setStats] = useState<UserStats>({
    longestStreak: 0,
    currentStreak: 0,
    totalChallengesCompleted: 0,
    totalTasksCompleted: 0,
    memberSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?._id) return;

    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const achievements = await userService.getAchievements(user._id);
        setStats(achievements);
      } catch (err: any) {
        console.error('Failed to fetch user achievements:', err);
        setError(err.message || 'Failed to load achievements');
        
        // Fallback to default values on error
        setStats({
          longestStreak: 0,
          currentStreak: 0,
          totalChallengesCompleted: 0,
          totalTasksCompleted: 0,
          memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user?._id, user?.createdAt]);

  return { stats, isLoading, error };
}
