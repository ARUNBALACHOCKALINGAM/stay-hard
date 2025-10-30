import type { DayProgress } from "./dayprogress";
import type { ProgressPhoto } from "./progressphoto";

export interface AppState {
  days: 21 | 45 | 60 | 75;
  level: 'Soft' | 'Hard' | 'Custom';
  startDate: string;
  dailyProgress: Record<string, DayProgress>;
  photos: ProgressPhoto[];
}
