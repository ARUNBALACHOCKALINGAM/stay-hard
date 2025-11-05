import type { Task } from "./task";

export interface DayProgress {
  date: string;
  completionRate: number;
  tasks: Task[];
  progressId?: string; // Server-side DailyProgress document ID
  dayNumber?: number; // Challenge day number (Day 1, Day 2, etc.)
}