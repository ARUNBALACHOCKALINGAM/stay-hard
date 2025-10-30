import type { Task } from "./task";

export interface DayProgress {
  date: string;
  completionRate: number;
  tasks: Task[];
}