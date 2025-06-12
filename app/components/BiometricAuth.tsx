// app/components/BiometricAuth.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { SecureStoreManager } from '@/utils/secureStore';

interface BiometricAuthProps {
  onSuccess: () => void;
  onError?: (error: string) => void;
}

export default function BiometricAuth({ onSuccess, onError }: BiometricAuthProps) {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);

      if (compatible) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (enrolled) {
          const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
          
          if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            setBiometricType('Face ID');
          } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            setBiometricType('Vân tay');
          } else {
            setBiometricType('Sinh trắc học');
          }
        }
      }
    } catch (error) {
      console.error('Error checking biometric support:', error);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      setIsAuthenticating(true);
      
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert(
          'Chưa thiết lập sinh trắc học',
          'Vui lòng thiết lập vân tay hoặc Face ID trong Cài đặt để sử dụng tính năng này.'
        );
        return;
      }

      // Check if user has previously enabled biometric login
      const isBiometricEnabled = await SecureStoreManager.isBiometricEnabled();
      const savedEmail = await SecureStoreManager.getUserEmail();
      
      if (!isBiometricEnabled || !savedEmail) {
        Alert.alert(
          'Chưa kích hoạt đăng nhập sinh trắc học',
          'Vui lòng đăng nhập bằng email/mật khẩu trước để kích hoạt tính năng này.'
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Xác thực để đăng nhập',
        cancelLabel: 'Hủy',
        fallbackLabel: 'Sử dụng mật khẩu',
      });

      if (result.success) {
        onSuccess();
      } else {
        onError?.('Xác thực không thành công');
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      onError?.('Đã xảy ra lỗi khi xác thực');
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!isBiometricSupported || !biometricType) {
    return null;
  }

  const getIcon = () => {
    if (biometricType === 'Face ID') {
      return 'scan-outline';
    } else if (biometricType === 'Vân tay') {
      return 'finger-print-outline';
    }
    return 'shield-checkmark-outline';
  };

  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>hoặc</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity 
        style={[styles.biometricButton, isAuthenticating && styles.buttonDisabled]}
        onPress={handleBiometricAuth}
        disabled={isAuthenticating}
      >
        <View style={styles.buttonContent}>
          <Ionicons 
            name={getIcon()} 
            size={24} 
            color={colors.primary} 
            style={styles.icon}
          />
          <Text style={styles.buttonText}>
            {isAuthenticating ? 'Đang xác thực...' : `Đăng nhập bằng ${biometricType}`}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textSecondary,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  biometricButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 12,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
