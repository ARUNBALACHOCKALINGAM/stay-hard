export interface Task {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: Date;
}