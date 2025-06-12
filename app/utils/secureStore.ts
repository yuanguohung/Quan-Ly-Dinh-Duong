// app/utils/secureStore.ts
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  EMAIL: 'user_email',
  BIOMETRIC_ENABLED: 'biometric_enabled',
} as const;

export const SecureStoreManager = {
  // Save user email for biometric login
  async saveUserEmail(email: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.EMAIL, email);
    } catch (error) {
      console.error('Error saving email to secure store:', error);
    }
  },

  // Get saved user email
  async getUserEmail(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(KEYS.EMAIL);
    } catch (error) {
      console.error('Error getting email from secure store:', error);
      return null;
    }
  },

  // Enable/disable biometric authentication
  async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.BIOMETRIC_ENABLED, enabled.toString());
    } catch (error) {
      console.error('Error setting biometric preference:', error);
    }
  },

  // Check if biometric is enabled
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const value = await SecureStore.getItemAsync(KEYS.BIOMETRIC_ENABLED);
      return value === 'true';
    } catch (error) {
      console.error('Error getting biometric preference:', error);
      return false;
    }
  },

  // Clear all stored data (on logout)
  async clearAll(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(KEYS.EMAIL);
      await SecureStore.deleteItemAsync(KEYS.BIOMETRIC_ENABLED);
    } catch (error) {
      console.error('Error clearing secure store:', error);
    }
  },
};
