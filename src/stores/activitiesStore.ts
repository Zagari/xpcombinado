import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { UserActivity, ActivityCategory } from '../types';
import { ACTIVITIES } from '../constants/activities';

interface ActivitiesState {
  activities: UserActivity[];
  isLoading: boolean;

  // Actions
  fetchActivities: (userId: string) => Promise<void>;
  addActivity: (
    userId: string,
    name: string,
    points: number,
    category: ActivityCategory
  ) => Promise<{ error: string | null }>;
  updateActivity: (
    activityId: string,
    name: string,
    points: number,
    category: ActivityCategory
  ) => Promise<{ error: string | null }>;
  deleteActivity: (activityId: string) => Promise<{ error: string | null }>;
  resetToDefaults: (userId: string) => Promise<{ error: string | null }>;
  getActivityPoints: (activityId: string) => number;
  clearStore: () => void;
}

export const useActivitiesStore = create<ActivitiesState>((set, get) => ({
  activities: [],
  isLoading: false,

  fetchActivities: async (userId: string) => {
    set({ isLoading: true });

    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      set({ isLoading: false });
      return;
    }

    // Se não tem atividades, inicializa com os defaults
    if (!data || data.length === 0) {
      const defaultActivities = ACTIVITIES.map((activity) => ({
        user_id: userId,
        name: activity.name,
        points: activity.points,
        category: activity.category,
        is_custom: false,
      }));

      const { data: insertedData, error: insertError } = await supabase
        .from('user_activities')
        .insert(defaultActivities)
        .select();

      if (!insertError && insertedData) {
        set({ activities: insertedData as UserActivity[], isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } else {
      set({ activities: data as UserActivity[], isLoading: false });
    }
  },

  addActivity: async (
    userId: string,
    name: string,
    points: number,
    category: ActivityCategory
  ) => {
    const { data, error } = await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        name,
        points,
        category,
        is_custom: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { error: 'Ja existe uma atividade com este nome' };
      }
      return { error: error.message };
    }

    if (data) {
      set((state) => ({
        activities: [...state.activities, data as UserActivity],
      }));
    }

    return { error: null };
  },

  updateActivity: async (
    activityId: string,
    name: string,
    points: number,
    category: ActivityCategory
  ) => {
    const { error } = await supabase
      .from('user_activities')
      .update({ name, points, category })
      .eq('id', activityId);

    if (error) {
      if (error.code === '23505') {
        return { error: 'Ja existe uma atividade com este nome' };
      }
      return { error: error.message };
    }

    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === activityId ? { ...a, name, points, category } : a
      ),
    }));

    return { error: null };
  },

  deleteActivity: async (activityId: string) => {
    const { error } = await supabase
      .from('user_activities')
      .delete()
      .eq('id', activityId);

    if (error) {
      return { error: error.message };
    }

    set((state) => ({
      activities: state.activities.filter((a) => a.id !== activityId),
    }));

    return { error: null };
  },

  resetToDefaults: async (userId: string) => {
    // Deletar todas as atividades do usuário
    const { error: deleteError } = await supabase
      .from('user_activities')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      return { error: deleteError.message };
    }

    // Inserir atividades default
    const defaultActivities = ACTIVITIES.map((activity) => ({
      user_id: userId,
      name: activity.name,
      points: activity.points,
      category: activity.category,
      is_custom: false,
    }));

    const { data, error } = await supabase
      .from('user_activities')
      .insert(defaultActivities)
      .select();

    if (error) {
      return { error: error.message };
    }

    set({ activities: data as UserActivity[] });
    return { error: null };
  },

  getActivityPoints: (activityId: string) => {
    const { activities } = get();
    const activity = activities.find((a) => a.id === activityId);
    return activity?.points ?? 0;
  },

  clearStore: () => {
    set({ activities: [], isLoading: false });
  },
}));
