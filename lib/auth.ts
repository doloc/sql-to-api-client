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
      login: (authResponse: AuthResponse) => set({
        token: authResponse.access_token,
        refreshToken: authResponse.refresh_token,
        expiry: Date.now() + (authResponse.expires_in * 1000),
        isAuthenticated: true,
      }),
      logout: () => set({
        token: null,
        refreshToken: null,
        expiry: null,
        isAuthenticated: false,
      }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

export async function loginWithCredentials(username: string, password: string): Promise<AuthResponse> {
  const formData = new URLSearchParams();
  formData.append('grant_type', 'password');
  formData.append('client_id', process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'sql-to-api-client-app');
  formData.append('username', username);
  formData.append('password', password);

  try {
    const response = await axios.post<AuthResponse>(
      `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error_description || 'Authentication failed');
    }
    throw error;
  }
}

// Initialize auth state from storage
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('auth-storage');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      useAuthStore.setState(state);
    } catch (e) {
      localStorage.removeItem('auth-storage');
    }
  }
}