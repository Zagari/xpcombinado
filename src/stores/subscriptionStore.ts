import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { UserSubscription } from '../types';

interface SubscriptionState {
  subscription: UserSubscription | null;
  isPremium: boolean;
  isLoading: boolean;

  fetchSubscription: (userId: string) => Promise<void>;
  mockPurchase: (userId: string) => Promise<{ error: string | null }>;
  clearStore: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscription: null,
  isPremium: false,
  isLoading: false,

  fetchSubscription: async (userId: string) => {
    set({ isLoading: true });

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found (not an error for us)
      set({ isLoading: false });
      return;
    }

    if (data) {
      const isExpired = data.expires_at && new Date(data.expires_at) < new Date();
      set({
        subscription: data,
        isPremium: data.is_premium && !isExpired,
        isLoading: false,
      });
    } else {
      set({ subscription: null, isPremium: false, isLoading: false });
    }
  },

  mockPurchase: async (userId: string) => {
    // Mock purchase - creates or updates subscription as premium
    const { data: existing } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single();

    let error;
    let data;

    if (existing) {
      const result = await supabase
        .from('user_subscriptions')
        .update({
          is_premium: true,
          premium_source: 'manual',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();
      error = result.error;
      data = result.data;
    } else {
      const result = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          is_premium: true,
          premium_source: 'manual',
        })
        .select()
        .single();
      error = result.error;
      data = result.data;
    }

    if (error) {
      return { error: error.message };
    }

    set({ subscription: data, isPremium: true });
    return { error: null };
  },

  clearStore: () => {
    set({ subscription: null, isPremium: false, isLoading: false });
  },
}));
