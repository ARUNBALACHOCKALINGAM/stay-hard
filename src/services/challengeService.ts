import { apiClient } from '../utils/api';

export const challengeService = {
  // Start default challenge for the authenticated user
  async startDefault() {
    return apiClient.post('/challenges/start', {});
  },

  // Create a new challenge with custom parameters
  async createChallenge(challengeDays: number, challengeLevel: 'Soft' | 'Hard' | 'Custom', customTasks?: any[]) {
    const body: any = { challengeDays, challengeLevel };
    if (challengeLevel === 'Custom' && customTasks) {
      body.customTasks = customTasks;
    }
    return apiClient.post('/challenges/create', body);
  },

  // Get challenge details by ID
  async getChallenge(challengeId: string) {
    return apiClient.get(`/challenges/${challengeId}`);
  },

  // Get history of inactive challenges
  async getHistory() {
    return apiClient.get('/challenges/history');
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
