import { apiClient } from '../utils/api';

// Define the expected structure for the task update body
interface TaskUpdateBody {
  completed: boolean;
}

// Define the expected structure for adding/editing task text
interface TaskTextBody {
  text: string;
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
   * Fetches all progress entries for a given challenge (scoped to the authenticated user).
   * Corresponds to: GET /api/progress/challenge/:challengeId
   * @param challengeId - The current challenge ID
   * @returns A promise that resolves to { items: DailyProgress[], count: number }
   */
  async getAllProgressForChallenge(challengeId: string) {
    return apiClient.get(`/progress/challenge/${challengeId}`);
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
  },

  /**
   * Adds a new task to a daily progress entry (Custom difficulty only).
   * Corresponds to: POST /api/progress/:progressId/tasks
   * @param progressId - The ID of the DailyProgress document.
   * @param text - The text content of the new task.
   * @returns A promise that resolves to the updated daily progress entry.
   */
  async addTask(progressId: string, text: string) {
    const body: TaskTextBody = { text };
    return apiClient.post(`/progress/${progressId}/tasks`, body);
  },

  /**
   * Updates the text of a specific task (Custom difficulty only).
   * Corresponds to: PATCH /api/progress/:progressId/tasks/:taskId/text
   * @param progressId - The ID of the DailyProgress document.
   * @param taskId - The ID of the task to update.
   * @param text - The new text content.
   * @returns A promise that resolves to the updated daily progress entry.
   */
  async updateTaskText(progressId: string, taskId: string, text: string) {
    const body: TaskTextBody = { text };
    return apiClient.patch(`/progress/${progressId}/tasks/${taskId}/text`, body);
  },

  /**
   * Deletes a task from a daily progress entry (Custom difficulty only).
   * Corresponds to: DELETE /api/progress/:progressId/tasks/:taskId
   * @param progressId - The ID of the DailyProgress document.
   * @param taskId - The ID of the task to delete.
   * @returns A promise that resolves to the updated daily progress entry.
   */
  async deleteTask(progressId: string, taskId: string) {
    return apiClient.delete(`/progress/${progressId}/tasks/${taskId}`);
  }
};

export default progressService;