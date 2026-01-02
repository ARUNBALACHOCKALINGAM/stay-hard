import { apiClient } from '../utils/api';
import type { User } from '../types/user';

export interface UserSettings {
  days: 21 | 45 | 60 | 75;
  level: 'Soft' | 'Hard' | 'Custom';
  startDate: string;
}

export const userService = {
  async verifyAuth(): Promise<User> {
    const response = await apiClient.get('/auth/verify');
    return response.user;
  },

  async updateProfile(data: Partial<User>) {
    return apiClient.put('/auth/profile', data);
  },

  async saveSettings(userId: string, settings: UserSettings) {
    return apiClient.put(`/users/${userId}`, settings);
  },

  async getSettings(userId: string): Promise<UserSettings> {
    const response = await apiClient.get(`/users/${userId}`);
    return {
      days: response.days || 21,
      level: response.level || 'Soft',
      startDate: response.startDate || new Date().toISOString().split('T')[0],
    };
  },

  async updateEmail(userId: string, email: string): Promise<{ message: string; user: User }> {
    const response = await apiClient.put(`/users/email/${userId}`, { email });
    return response;
  },

  async updatePassword(userId: string, password: string): Promise<{ message: string }> {
    const response = await apiClient.put(`/users/password/${userId}`, { password });
    return response;
  },

  async getAchievements(userId: string): Promise<{
    longestStreak: number;
    currentStreak: number;
    totalChallengesCompleted: number;
    totalTasksCompleted: number;
    memberSince: string;
  }> {
    const response = await apiClient.get(`/users/${userId}/achievements`);
    return response;
  },

  async getLeaderboard(): Promise<{
    leaderboard: Array<{
      user: {
        _id: string;
        name: string;
        photoUrl?: string;
        provider?: string;
      };
      longestStreak: number;
      currentStreak: number;
      completedChallenges: number;
      totalTasksCompleted: number;
    }>;
  }> {
    const response = await apiClient.get('/users/leaderboard');
    return response;
  },
};
