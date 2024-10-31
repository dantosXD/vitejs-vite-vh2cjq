import { create } from 'zustand';

interface AuthState {
  user: null | {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  token: string | null;
  setUser: (user: AuthState['user']) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null }),
}));