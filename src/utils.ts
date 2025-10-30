// Utility functions
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getTodayDate = (): string => {
  return formatDate(new Date());
};

export const getDateDaysAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return formatDate(date);
};

export const getCompletionColor = (rate: number): string => {
  if (rate === 0) return 'bg-red-500';
  if (rate === 1) return 'bg-green-600';
  if (rate >= 0.75) return 'bg-orange-400';
  if (rate >= 0.5) return 'bg-orange-500';
  return 'bg-orange-600';
};

export const getDefaultTasks = (level: string): Task[] => {
  const softTasks = [
    'Eat healthy & balanced diet',
    '45-min exercise (5 days/week)',
    'Drink 3 liters of water',
    'Read 10 pages (nonfiction)',
    'Practice mindfulness/reflection'
  ];
  
const hardTasks = [
    'Follow strict diet (no cheats/alcohol)',
    'Two 45-min workouts (1 outdoor)',
    'Drink 1 gallon of water',
    'Read 10 pages (nonfiction book)',
    'Take daily progress picture',
    'No cheat meals or alcohol'
  ];

  const taskTexts = level === 'Hard' ? hardTasks : softTasks;
  
  return taskTexts.map((text, i) => ({
    id: `task-${i}`,
    text,
    completed: false
  }));
};
