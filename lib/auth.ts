"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthResponse } from './types';
import axios from 'axios';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  expiry: number | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (authResponse: AuthResponse) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      expiry: null,
      isAuthenticated: false,
      isHydrated: false,
      login: (authResponse: AuthResponse) => set(() => {
        const newState = {
          token: authResponse.access_token,
          refreshToken: authResponse.refresh_token,
          expiry: Date.now() + (authResponse.expires_in * 1000),
          isAuthenticated: true,
        } as const;
        try {
          // Also set cookies so middleware can read auth state server-side
          const expSeconds = Math.floor(newState.expiry / 1000);
          document.cookie = `auth_token=${newState.token}; path=/; SameSite=Lax;`;
          document.cookie = `auth_exp=${expSeconds}; path=/; SameSite=Lax;`;
        } catch {}
        return newState;
      }),
      logout: () => set(() => {
        try {
          // Remove persisted Zustand storage as well
          localStorage.removeItem('auth-storage');
          // Clear cookies
          document.cookie = 'auth_token=; Max-Age=0; path=/; SameSite=Lax;';
          document.cookie = 'auth_exp=; Max-Age=0; path=/; SameSite=Lax;';
        } catch {}
        return {
          token: null,
          refreshToken: null,
          expiry: null,
          isAuthenticated: false,
        };
      }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: false,
      onRehydrateStorage: () => (state) => {
        // After hydration, validate expiry and normalize auth state
        try {
          const current = useAuthStore.getState();
          const hasExpired = typeof current.expiry === 'number' && current.expiry <= Date.now();
          const hasToken = Boolean(current.token);
          if (!hasToken || hasExpired) {
            useAuthStore.getState().logout();
          } else if (!current.isAuthenticated && hasToken && !hasExpired) {
            useAuthStore.setState({ isAuthenticated: true });
          }
        } catch {}
        state?.setHydrated();
      },
    }
  )
);

export async function loginWithCredentials(username: string, password: string): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(
      '/api/auth/token',
      { username, password },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error((error.response?.data as any)?.error || 'Authentication failed');
    }
    throw error;
  }
}

// Remove manual initialization to avoid double state races; rely on persist hydration above.