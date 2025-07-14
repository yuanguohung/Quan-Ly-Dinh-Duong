import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { UserService, UserProfile } from '@/services/userService';

interface UserContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile when user changes
  const loadUserProfile = async (currentUser: User | null) => {
    if (currentUser) {
      try {
        console.log('UserContext - Loading profile for user:', currentUser.uid);
        let profile = await UserService.getUserProfile(currentUser.uid);
        
        // If profile doesn't exist, create it
        if (!profile) {
          console.log('UserContext - Profile not found, creating new profile');
          await UserService.createUserProfile(currentUser);
          profile = await UserService.getUserProfile(currentUser.uid);
        }
        
        // Update last active
        await UserService.updateLastActive(currentUser.uid);
        
        console.log('UserContext - Profile loaded successfully:', profile);
        setUserProfile(profile);
      } catch (error) {
        console.error('UserContext - Error loading user profile:', error);
        console.error('UserContext - Error details:', {
          uid: currentUser.uid,
          email: currentUser.email,
          error: error instanceof Error ? error.message : error
        });
        // Set null profile on error to prevent infinite loops
        setUserProfile(null);
      }
    } else {
      console.log('UserContext - No current user, setting profile to null');
      setUserProfile(null);
    }
    setLoading(false);
  };

  // Update user profile with security validation
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No authenticated user');
    
    try {
      console.log('UserContext - Updating profile for user:', user.uid);
      await UserService.updateUserProfile(user.uid, updates, user.uid);
      // Refresh profile data
      await refreshProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Refresh profile data with security validation
  const refreshProfile = async () => {
    if (user) {
      console.log('UserContext - Refreshing profile for user:', user.uid);
      const profile = await UserService.getUserProfile(user.uid, user.uid);
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      loadUserProfile(currentUser);
    });

    return unsubscribe;
  }, []);

  const contextValue: UserContextType = {
    user,
    userProfile,
    loading,
    updateProfile,
    refreshProfile,
    isAuthenticated: !!user,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Custom hooks for specific user data
export function useUserProfile() {
  const { userProfile, updateProfile, refreshProfile } = useUser();
  return { userProfile, updateProfile, refreshProfile };
}

export function useUserStats() {
  const { user } = useUser();
  
  const getUserStats = async (startDate: string, endDate: string) => {
    if (!user) return [];
    return UserService.getUserStats(user.uid, startDate, endDate);
  };

  const saveDailyStats = async (stats: Omit<import('@/services/userService').UserStats, 'uid' | 'createdAt'>) => {
    if (!user) throw new Error('No authenticated user');
    return UserService.saveDailyStats({ ...stats, uid: user.uid });
  };

  return { getUserStats, saveDailyStats };
}

export function usePersonalizedRecommendations() {
  const { userProfile } = useUser();
  
  if (!userProfile) {
    return {
      goalAdjustments: [],
      macroTips: [],
      activitySuggestions: [],
    };
  }

  return UserService.getPersonalizedRecommendations(userProfile);
}
