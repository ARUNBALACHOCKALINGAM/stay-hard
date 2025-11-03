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
};