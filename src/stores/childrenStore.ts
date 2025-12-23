import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { Child, DailyRecord } from '../types';
import { useActivitiesStore } from './activitiesStore';

interface ChildrenState {
  children: Child[];
  selectedChild: Child | null;
  dailyRecords: DailyRecord[];
  isLoading: boolean;

  // Actions
  fetchChildren: (userId: string) => Promise<void>;
  addChild: (userId: string, name: string) => Promise<{ error: string | null }>;
  selectChild: (child: Child | null) => void;
  fetchDailyRecords: (childId: string, date: string) => Promise<void>;
  toggleActivity: (childId: string, activityId: string, date: string) => Promise<void>;
  resetDay: (childId: string, date: string) => Promise<void>;
  getTotalPoints: () => number;
  clearStore: () => void;
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

export const useChildrenStore = create<ChildrenState>((set, get) => ({
  children: [],
  selectedChild: null,
  dailyRecords: [],
  isLoading: false,

  fetchChildren: async (userId: string) => {
    set({ isLoading: true });

    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      set({ children: data, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  addChild: async (userId: string, name: string) => {
    const { data, error } = await supabase
      .from('children')
      .insert({ user_id: userId, name })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    if (data) {
      set((state) => ({ children: [...state.children, data] }));
    }

    return { error: null };
  },

  selectChild: (child: Child | null) => {
    set({ selectedChild: child, dailyRecords: [] });
    if (child) {
      get().fetchDailyRecords(child.id, getTodayDate());
    }
  },

  fetchDailyRecords: async (childId: string, date: string) => {
    set({ isLoading: true });

    const { data, error } = await supabase
      .from('daily_records')
      .select('*')
      .eq('child_id', childId)
      .eq('date', date);

    if (!error && data) {
      set({ dailyRecords: data, isLoading: false });
    } else {
      set({ dailyRecords: [], isLoading: false });
    }
  },

  toggleActivity: async (childId: string, activityId: string, date: string) => {
    const { dailyRecords } = get();
    const existingRecord = dailyRecords.find(
      (r) => r.activity_id === activityId && r.date === date
    );

    if (existingRecord) {
      // Toggle existing record
      const newCompleted = !existingRecord.completed;

      const { error } = await supabase
        .from('daily_records')
        .update({ completed: newCompleted })
        .eq('id', existingRecord.id);

      if (!error) {
        set((state) => ({
          dailyRecords: state.dailyRecords.map((r) =>
            r.id === existingRecord.id ? { ...r, completed: newCompleted } : r
          ),
        }));
      }
    } else {
      // Create new record as completed
      const { data, error } = await supabase
        .from('daily_records')
        .insert({
          child_id: childId,
          activity_id: activityId,
          date,
          completed: true,
        })
        .select()
        .single();

      if (!error && data) {
        set((state) => ({
          dailyRecords: [...state.dailyRecords, data],
        }));
      }
    }
  },

  resetDay: async (childId: string, date: string) => {
    const { error } = await supabase
      .from('daily_records')
      .delete()
      .eq('child_id', childId)
      .eq('date', date);

    if (!error) {
      set({ dailyRecords: [] });
    }
  },

  getTotalPoints: () => {
    const { dailyRecords } = get();
    const { getActivityPoints } = useActivitiesStore.getState();
    let total = 0;

    for (const record of dailyRecords) {
      if (record.completed) {
        total += getActivityPoints(record.activity_id);
      }
    }

    return total;
  },

  clearStore: () => {
    set({
      children: [],
      selectedChild: null,
      dailyRecords: [],
      isLoading: false,
    });
  },
}));
