import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { User } from '../types';
import { useChildrenStore } from './childrenStore';

// Test account for Play Store review
const TEST_ACCOUNT = {
  email: 'castellabate.tech@gmail.com',
  otpCode: '211039',
  password: 'Supa-148+',
};

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  pendingEmail: string | null;

  // Actions
  sendOtp: (email: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearPendingEmail: () => void;
}

const isTestAccount = (email: string) =>
  email.toLowerCase() === TEST_ACCOUNT.email.toLowerCase();

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  pendingEmail: null,

  sendOtp: async (email: string) => {
    // For test account, skip sending OTP
    if (isTestAccount(email)) {
      set({ pendingEmail: email });
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      return { error: error.message };
    }

    set({ pendingEmail: email });
    return { error: null };
  },

  verifyOtp: async (email: string, token: string) => {
    // For test account, use password authentication
    if (isTestAccount(email)) {
      if (token !== TEST_ACCOUNT.otpCode) {
        return { error: 'Codigo invalido' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: TEST_ACCOUNT.email,
        password: TEST_ACCOUNT.password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            created_at: data.user.created_at,
          },
          isAuthenticated: true,
          pendingEmail: null,
        });
      }

      return { error: null };
    }

    // For regular accounts, use OTP verification
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      set({
        user: {
          id: data.user.id,
          email: data.user.email || '',
          created_at: data.user.created_at,
        },
        isAuthenticated: true,
        pendingEmail: null,
      });
    }

    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    useChildrenStore.getState().clearStore();
    set({ user: null, isAuthenticated: false, pendingEmail: null });
  },

  checkSession: async () => {
    set({ isLoading: true });

    const { data } = await supabase.auth.getSession();

    if (data.session?.user) {
      set({
        user: {
          id: data.session.user.id,
          email: data.session.user.email || '',
          created_at: data.session.user.created_at,
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearPendingEmail: () => {
    set({ pendingEmail: null });
  },
}));
