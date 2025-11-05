import { apiClient } from '../utils/api';

// Define the expected structure for the task update body
interface TaskUpdateBody {
  completed: boolean;
}

// Define the expected structure for fetching tasks
interface GetTasksQueryParams {
  userId: string;
  challengeId: string;
  date: string; // Expected format: YYYY-MM-DD
}

/**
 * Service for interacting with the daily progress and task tracking API.
 */
export const progressService = {
  /**
   * Fetches tasks for a specific date, creating a new progress entry if none exists.
   * Corresponds to: GET /api/progress?userId={}&challengeId={}&date={}
   * **MODIFIED:** Constructs the query string manually as apiClient.get only takes one argument.
   * * @param params - The query parameters: userId, challengeId, and date (YYYY-MM-DD).
   * @returns A promise that resolves to the daily progress entry.
   */
  async getTasksForDate(params: GetTasksQueryParams) {
    // 1. Manually create the URLSearchParams object
    const queryParams = new URLSearchParams({
      userId: params.userId,
      challengeId: params.challengeId,
      date: params.date,
    }).toString();

    // 2. Append the constructed query string to the base endpoint
    const endpoint = `/progress?${queryParams}`;

    // 3. Call apiClient.get with the single, full endpoint string
    return apiClient.get(endpoint);
  },

  /**
   * Updates the completion status of a specific task within a daily progress entry.
   * Corresponds to: PATCH /api/progress/:progressId/tasks/:taskId
   * * @param progressId - The ID of the DailyProgress document.
   * @param taskId - The ID of the task within the DailyProgress tasks array.
   * @param completed - The new completion status (true or false).
   * @returns A promise that resolves to the updated daily progress entry.
   */
  async updateTaskStatus(progressId: string, taskId: string, completed: boolean) {
    const body: TaskUpdateBody = { completed };
    // This function remains correct as the apiClient's patch method accepts two arguments (endpoint, data)
    return apiClient.patch(`/progress/${progressId}/tasks/${taskId}`, body);
  }
};

export default progressService;