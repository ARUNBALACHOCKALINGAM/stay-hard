import { apiClient } from '../utils/api';

export const challengeService = {
  // Start default challenge for the authenticated user
  async startDefault() {
    return apiClient.post('/challenges/start', {});
  },

  async updateDays(challengeId: string, days: number) {
    return apiClient.patch(`/challenges/${challengeId}/days`, { challengeDays: days });
  },

  async updateDifficulty(challengeId: string, level: 'Soft' | 'Hard' | 'Custom', customTasks?: any[]) {
    const body: any = { challengeLevel: level };
    if (level === 'Custom' && customTasks) body.customTasks = customTasks;
    return apiClient.patch(`/challenges/${challengeId}/difficulty`, body);
  },

  async resetProgress(challengeId: string) {
    return apiClient.post(`/challenges/${challengeId}/reset`, {});
  }
};

export default challengeService;
