import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  initialize: async () => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      set({ user: session?.user ?? null, loading: false });
    })();

    supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        set({ user: session?.user ?? null, loading: false });
      })();
    });
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    set({ user: data.user });
  },

  signUp: async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase
        .from('users_profiles')
        .insert({
          id: data.user.id,
          username,
          risk_tolerance: 'moderate',
        });

      if (profileError) throw profileError;

      const { error: portfolioError } = await supabase
        .from('portfolios')
        .insert({
          user_id: data.user.id,
          name: 'Main Portfolio',
          cash_balance: 100000,
          total_value: 100000,
        });

      if (portfolioError) throw portfolioError;

      set({ user: data.user });
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },
}));
