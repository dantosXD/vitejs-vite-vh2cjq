import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { account, databases, storage, COLLECTIONS, DATABASE_ID, BUCKETS } from '../appwrite';
import { ID } from 'appwrite';
import { toast } from 'sonner';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    groupInvites: boolean;
    challengeUpdates: boolean;
    newComments: boolean;
  };
  privacy: {
    showEmail: boolean;
    showLocation: boolean;
    publicProfile: boolean;
  };
  displaySettings: {
    defaultCatchView: 'table' | 'grid' | 'timeline';
    measurementSystem: 'imperial' | 'metric';
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  };
}

interface AuthState {
  user: any | null;
  preferences: UserPreferences | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, avatar?: File) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: Partial<{ name: string; email: string }>, avatar?: File) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    groupInvites: true,
    challengeUpdates: true,
    newComments: true,
  },
  privacy: {
    showEmail: false,
    showLocation: true,
    publicProfile: true,
  },
  displaySettings: {
    defaultCatchView: 'grid',
    measurementSystem: 'imperial',
    dateFormat: 'MM/DD/YYYY',
  },
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      preferences: null,
      isLoading: true,

      login: async (email: string, password: string) => {
        try {
          await account.createEmailSession(email, password);
          const user = await account.get();
          
          // Fetch user preferences
          const prefs = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            user.$id
          );

          set({ 
            user,
            preferences: prefs.preferences || defaultPreferences,
          });
          
          toast.success('Welcome back!');
        } catch (error: any) {
          toast.error('Login failed: ' + error.message);
          throw error;
        }
      },

      register: async (email: string, password: string, name: string, avatar?: File) => {
        try {
          // Create account
          const user = await account.create(ID.unique(), email, password, name);

          // Upload avatar if provided
          let avatarId = null;
          if (avatar) {
            const uploadedAvatar = await storage.createFile(
              BUCKETS.USER_AVATARS,
              ID.unique(),
              avatar
            );
            avatarId = uploadedAvatar.$id;
          }

          // Create user document with preferences
          await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            user.$id,
            {
              email,
              name,
              avatar: avatarId,
              preferences: defaultPreferences,
              createdAt: new Date().toISOString(),
            }
          );

          // Log in the user
          await account.createEmailSession(email, password);
          const loggedInUser = await account.get();

          set({ 
            user: loggedInUser,
            preferences: defaultPreferences,
          });

          toast.success('Account created successfully!');
        } catch (error: any) {
          toast.error('Registration failed: ' + error.message);
          throw error;
        }
      },

      logout: async () => {
        try {
          await account.deleteSession('current');
          set({ user: null, preferences: null });
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
          
          // Fetch user preferences
          const prefs = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            user.$id
          );

          set({ 
            user,
            preferences: prefs.preferences || defaultPreferences,
            isLoading: false,
          });
        } catch (error) {
          set({ user: null, preferences: null, isLoading: false });
        }
      },

      updateProfile: async (data, avatar) => {
        try {
          const user = get().user;
          if (!user) throw new Error('Not authenticated');

          // Update avatar if provided
          let avatarId = user.avatar;
          if (avatar) {
            if (avatarId) {
              await storage.deleteFile(BUCKETS.USER_AVATARS, avatarId);
            }
            const uploadedAvatar = await storage.createFile(
              BUCKETS.USER_AVATARS,
              ID.unique(),
              avatar
            );
            avatarId = uploadedAvatar.$id;
          }

          // Update user document
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            user.$id,
            {
              ...data,
              avatar: avatarId,
              updatedAt: new Date().toISOString(),
            }
          );

          // Update account if email changed
          if (data.email) {
            await account.updateEmail(data.email);
          }

          // Update name if changed
          if (data.name) {
            await account.updateName(data.name);
          }

          const updatedUser = await account.get();
          set({ user: updatedUser });

          toast.success('Profile updated successfully!');
        } catch (error: any) {
          toast.error('Failed to update profile: ' + error.message);
          throw error;
        }
      },

      updatePreferences: async (preferences) => {
        try {
          const user = get().user;
          if (!user) throw new Error('Not authenticated');

          const currentPrefs = get().preferences || defaultPreferences;
          const updatedPrefs = {
            ...currentPrefs,
            ...preferences,
          };

          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            user.$id,
            {
              preferences: updatedPrefs,
              updatedAt: new Date().toISOString(),
            }
          );

          set({ preferences: updatedPrefs });
          toast.success('Preferences updated successfully!');
        } catch (error: any) {
          toast.error('Failed to update preferences: ' + error.message);
          throw error;
        }
      },

      deleteAccount: async () => {
        try {
          const user = get().user;
          if (!user) throw new Error('Not authenticated');

          // Delete user avatar if exists
          if (user.avatar) {
            await storage.deleteFile(BUCKETS.USER_AVATARS, user.avatar);
          }

          // Delete user document
          await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            user.$id
          );

          // Delete account
          await account.delete();

          set({ user: null, preferences: null });
          toast.success('Account deleted successfully');
        } catch (error: any) {
          toast.error('Failed to delete account: ' + error.message);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        preferences: state.preferences,
      }),
    }
  )
);