import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { UserScreenTimeConversion } from '../types';
import { SCREEN_TIME_CONVERSIONS } from '../constants/screenTime';

interface ScreenTimeState {
  conversions: UserScreenTimeConversion[];
  isLoading: boolean;

  // Actions
  fetchConversions: (userId: string) => Promise<void>;
  updateConversion: (
    conversionId: string,
    points: number,
    minutes: number
  ) => Promise<{ error: string | null }>;
  resetToDefaults: (userId: string) => Promise<{ error: string | null }>;
  calculateScreenTime: (points: number) => { minutes: number; label: string };
  getNextTier: (points: number) => { pointsNeeded: number; reward: string } | null;
  clearStore: () => void;
}

function formatMinutesLabel(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return hours === 1 ? '1 hora' : `${hours} horas`;
  }
  return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`;
}

export const useScreenTimeStore = create<ScreenTimeState>((set, get) => ({
  conversions: [],
  isLoading: false,

  fetchConversions: async (userId: string) => {
    set({ isLoading: true });

    const { data, error } = await supabase
      .from('user_screen_time_conversions')
      .select('*')
      .eq('user_id', userId)
      .order('points', { ascending: true });

    if (error) {
      set({ isLoading: false });
      return;
    }

    // Se não tem conversões, inicializa com os defaults
    if (!data || data.length === 0) {
      const defaultConversions = SCREEN_TIME_CONVERSIONS.map((conv) => ({
        user_id: userId,
        points: conv.points,
        minutes: conv.minutes,
      }));

      const { data: insertedData, error: insertError } = await supabase
        .from('user_screen_time_conversions')
        .insert(defaultConversions)
        .select();

      if (!insertError && insertedData) {
        set({ conversions: insertedData as UserScreenTimeConversion[], isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } else {
      set({ conversions: data as UserScreenTimeConversion[], isLoading: false });
    }
  },

  updateConversion: async (conversionId: string, points: number, minutes: number) => {
    const { error } = await supabase
      .from('user_screen_time_conversions')
      .update({ points, minutes })
      .eq('id', conversionId);

    if (error) {
      return { error: error.message };
    }

    set((state) => ({
      conversions: state.conversions
        .map((c) => (c.id === conversionId ? { ...c, points, minutes } : c))
        .sort((a, b) => a.points - b.points),
    }));

    return { error: null };
  },

  resetToDefaults: async (userId: string) => {
    // Deletar todas as conversões do usuário
    const { error: deleteError } = await supabase
      .from('user_screen_time_conversions')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      return { error: deleteError.message };
    }

    // Inserir conversões default
    const defaultConversions = SCREEN_TIME_CONVERSIONS.map((conv) => ({
      user_id: userId,
      points: conv.points,
      minutes: conv.minutes,
    }));

    const { data, error } = await supabase
      .from('user_screen_time_conversions')
      .insert(defaultConversions)
      .select();

    if (error) {
      return { error: error.message };
    }

    set({ conversions: data as UserScreenTimeConversion[] });
    return { error: null };
  },

  calculateScreenTime: (points: number) => {
    const { conversions } = get();

    // Use defaults if no conversions loaded yet
    const convList = conversions.length > 0
      ? conversions
      : SCREEN_TIME_CONVERSIONS.map(c => ({ ...c, id: '', user_id: '', created_at: '' }));

    let earnedMinutes = 0;
    let earnedLabel = '0 min';

    for (const tier of convList) {
      if (points >= tier.points) {
        earnedMinutes = tier.minutes;
        earnedLabel = formatMinutesLabel(tier.minutes);
      } else {
        break;
      }
    }

    return { minutes: earnedMinutes, label: earnedLabel };
  },

  getNextTier: (points: number) => {
    const { conversions } = get();

    // Use defaults if no conversions loaded yet
    const convList = conversions.length > 0
      ? conversions
      : SCREEN_TIME_CONVERSIONS.map(c => ({ ...c, id: '', user_id: '', created_at: '' }));

    for (const tier of convList) {
      if (points < tier.points) {
        return {
          pointsNeeded: tier.points - points,
          reward: formatMinutesLabel(tier.minutes),
        };
      }
    }
    return null; // Already at max tier
  },

  clearStore: () => {
    set({ conversions: [], isLoading: false });
  },
}));
