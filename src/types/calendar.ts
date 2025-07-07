
export interface CalendarBlock {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  date: string;
  category: string; // Changed from union type to string to support custom categories
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

export interface CustomCategory {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export const DEFAULT_CATEGORIES = {
  work: '#3B82F6',      // blue
  study: '#10B981',     // green
  personal: '#8B5CF6',  // purple
  meeting: '#F59E0B',   // yellow
  break: '#6B7280'      // gray
} as const;

// Legacy export for backward compatibility
export const CATEGORY_COLORS = DEFAULT_CATEGORIES;
