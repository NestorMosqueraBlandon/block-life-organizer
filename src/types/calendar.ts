
export interface CalendarBlock {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  date: string;
  category: 'work' | 'study' | 'personal' | 'meeting' | 'break';
  color: string;
  tasks?: Task[];
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly';
    endDate?: string;
  };
  hasQuiz?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export const CATEGORY_COLORS = {
  work: '#3B82F6',      // blue
  study: '#10B981',     // green
  personal: '#8B5CF6',  // purple
  meeting: '#F59E0B',   // yellow
  break: '#6B7280'      // gray
} as const;
