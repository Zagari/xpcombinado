export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Child {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Activity {
  id: string;
  name: string;
  points: number;
  category: ActivityCategory;
}

export type ActivityCategory =
  | 'hygiene'
  | 'organization'
  | 'chores'
  | 'pet_care'
  | 'development'
  | 'behavior';

export interface DailyRecord {
  id: string;
  child_id: string;
  activity_id: string;
  completed: boolean;
  date: string; // YYYY-MM-DD format
}

export interface ScreenTimeConversion {
  points: number;
  minutes: number;
  label: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  name: string;
  points: number;
  category: ActivityCategory;
  is_custom: boolean;
  created_at: string;
}
