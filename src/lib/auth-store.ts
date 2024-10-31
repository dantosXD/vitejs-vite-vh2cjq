import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { account } from './appwrite';
import { ID } from 'appwrite';
import { toast } from 'sonner';

interface AuthState {
    user: any | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isLoading: true,

            login: async (email: string, password: string) => {
                try {
                    await account.createEmailSession(email, password);
                    const user = await account.get();
                    set({ user });
                    toast.success('Welcome back!');
                } catch (error: any) {
                    toast.error('Login failed: ' + error.message);
                    throw error;
                }
            },

            register: async (email: string, password: string, name: string) => {
                try {
                    await account.create(ID.unique(), email, password, name);
                    await account.createEmailSession(email, password);
                    const user = await account.get();
                    set({ user });
                    toast.success('Account created successfully!');
                } catch (error: any) {
                    toast.error('Registration failed: ' + error.message);
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await account.deleteSession('current');
                    set({ user: null });
                    toast.success('Logged out successfully');
                } catch (error: any) {
                    toast.error('Logout failed: ' + error.message);
                    throw error;
                }
            },

            checkAuth: async () => {
                try {
                    set({ isLoading: true });
                    const user = await account.get();
                    set({ user, isLoading: false });
                } catch (error) {
                    set({ user: null, isLoading: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user }),
        }
    )
);