import { create } from 'zustand';
import { supabase } from '../services/supabase';
import {
  MsFamilyConnection,
  MsAccountMapping,
  ScreenTimeSession
} from '../types';

const BACKEND_URL = process.env.EXPO_PUBLIC_FAMILY_SAFETY_API_URL || '';

interface MsAccount {
  id: string;
  name: string;
  today_usage: number;
}

interface FamilySafetyState {
  connection: MsFamilyConnection | null;
  mappings: MsAccountMapping[];
  msAccounts: MsAccount[];
  activeSessions: ScreenTimeSession[];
  isLoading: boolean;

  // Connection
  fetchConnection: (userId: string) => Promise<void>;
  setConnected: (userId: string) => Promise<{ error: string | null }>;
  disconnect: (userId: string) => Promise<{ error: string | null }>;

  // MS Accounts
  fetchMsAccounts: () => Promise<void>;

  // Mappings
  fetchMappings: () => Promise<void>;
  createMapping: (childId: string, msAccountId: string, msAccountName: string) => Promise<{ error: string | null }>;
  deleteMapping: (mappingId: string) => Promise<{ error: string | null }>;

  // Sessions
  fetchActiveSessions: () => Promise<void>;
  releaseTime: (childId: string, minutes: number) => Promise<{ error: string | null; session?: ScreenTimeSession }>;
  cancelSession: (sessionId: string) => Promise<{ error: string | null }>;

  // Auth
  getLoginUrl: () => Promise<string | null>;
  handleOAuthCallback: (responseUrl: string) => Promise<{ error: string | null }>;

  clearStore: () => void;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.session?.access_token}`,
  };
}

export const useFamilySafetyStore = create<FamilySafetyState>((set, get) => ({
  connection: null,
  mappings: [],
  msAccounts: [],
  activeSessions: [],
  isLoading: false,

  fetchConnection: async (userId: string) => {
    const { data } = await supabase
      .from('ms_family_connections')
      .select('*')
      .eq('user_id', userId)
      .single();

    set({ connection: data || null });
  },

  setConnected: async (userId: string) => {
    const { data, error } = await supabase
      .from('ms_family_connections')
      .upsert({
        user_id: userId,
        is_connected: true,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return { error: error.message };
    set({ connection: data });
    return { error: null };
  },

  disconnect: async (userId: string) => {
    const { error } = await supabase
      .from('ms_family_connections')
      .update({
        is_connected: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) return { error: error.message };
    set({ connection: null, msAccounts: [], mappings: [] });
    return { error: null };
  },

  fetchMsAccounts: async () => {
    set({ isLoading: true });
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${BACKEND_URL}/accounts/`, { headers });

      if (!response.ok) {
        set({ isLoading: false });
        return;
      }

      const data = await response.json();
      set({ msAccounts: data.accounts, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  fetchMappings: async () => {
    const { data } = await supabase
      .from('ms_account_mappings')
      .select('*');

    set({ mappings: data || [] });
  },

  createMapping: async (childId: string, msAccountId: string, msAccountName: string) => {
    const { data, error } = await supabase
      .from('ms_account_mappings')
      .upsert({
        child_id: childId,
        ms_account_id: msAccountId,
        ms_account_name: msAccountName,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return { error: error.message };

    set((state) => ({
      mappings: [
        ...state.mappings.filter((m) => m.child_id !== childId),
        data,
      ],
    }));
    return { error: null };
  },

  deleteMapping: async (mappingId: string) => {
    const { error } = await supabase
      .from('ms_account_mappings')
      .delete()
      .eq('id', mappingId);

    if (error) return { error: error.message };

    set((state) => ({
      mappings: state.mappings.filter((m) => m.id !== mappingId),
    }));
    return { error: null };
  },

  fetchActiveSessions: async () => {
    const { data } = await supabase
      .from('screen_time_sessions')
      .select('*')
      .eq('status', 'active');

    set({ activeSessions: data || [] });
  },

  releaseTime: async (childId: string, minutes: number) => {
    const { mappings } = get();
    const mapping = mappings.find((m) => m.child_id === childId);

    if (!mapping) {
      return { error: 'Filho nao mapeado para conta MS Family' };
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${BACKEND_URL}/control/release`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          account_id: mapping.ms_account_id,
          minutes,
          targets: mapping.target_devices,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.detail || 'Erro ao liberar tempo' };
      }

      const data = await response.json();

      // Create session record in Supabase
      const { data: session, error } = await supabase
        .from('screen_time_sessions')
        .insert({
          child_id: childId,
          minutes_granted: minutes,
          expires_at: data.expires_at,
          status: 'active',
        })
        .select()
        .single();

      if (error) return { error: error.message };

      set((state) => ({
        activeSessions: [...state.activeSessions, session],
      }));

      return { error: null, session };
    } catch (e) {
      return { error: 'Erro de conexao com o servidor' };
    }
  },

  cancelSession: async (sessionId: string) => {
    const { activeSessions, mappings } = get();
    const session = activeSessions.find((s) => s.id === sessionId);

    if (!session) return { error: 'Sessao nao encontrada' };

    const mapping = mappings.find((m) => m.child_id === session.child_id);
    if (!mapping) return { error: 'Mapeamento nao encontrado' };

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${BACKEND_URL}/control/block`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          account_id: mapping.ms_account_id,
          targets: mapping.target_devices,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.detail || 'Erro ao bloquear' };
      }

      // Update session in Supabase
      await supabase
        .from('screen_time_sessions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      set((state) => ({
        activeSessions: state.activeSessions.filter((s) => s.id !== sessionId),
      }));

      return { error: null };
    } catch (e) {
      return { error: 'Erro de conexao com o servidor' };
    }
  },

  getLoginUrl: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${BACKEND_URL}/auth/login-url`, { headers });

      if (!response.ok) return null;

      const data = await response.json();
      return data.login_url;
    } catch (e) {
      return null;
    }
  },

  handleOAuthCallback: async (responseUrl: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${BACKEND_URL}/auth/callback`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ oauth_response_url: responseUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.detail || 'Erro na autenticacao' };
      }

      return { error: null };
    } catch (e) {
      return { error: 'Erro de conexao com o servidor' };
    }
  },

  clearStore: () => {
    set({
      connection: null,
      mappings: [],
      msAccounts: [],
      activeSessions: [],
      isLoading: false,
    });
  },
}));
