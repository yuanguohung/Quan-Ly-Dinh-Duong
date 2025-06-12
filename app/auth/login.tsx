// app/auth/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import BiometricAuth from '@/components/BiometricAuth';
import { SecureStoreManager } from '@/utils/secureStore';
import * as LocalAuthentication from 'expo-local-authentication';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const router = useRouter();

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Save email for future biometric login
      await SecureStoreManager.saveUserEmail(email);
      
      // Check if biometric is available and ask user if they want to enable it
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const biometricEnabled = await SecureStoreManager.isBiometricEnabled();
      
      if (compatible && enrolled && !biometricEnabled) {
        Alert.alert(
          'Kích hoạt đăng nhập sinh trắc học?',
          'Bạn có muốn sử dụng vân tay hoặc Face ID để đăng nhập nhanh chóng không?',
          [
            { text: 'Không', style: 'cancel' },
            { 
              text: 'Có', 
              onPress: async () => {
                await SecureStoreManager.setBiometricEnabled(true);
                Alert.alert('Thành công', 'Đăng nhập thành công!', [
                  { text: 'OK', onPress: () => router.replace('/(tabs)') }
                ]);
              }
            }
          ]
        );
      } else {
        Alert.alert('Thành công', 'Đăng nhập thành công!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]);
      }
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error.code, error.message);
      let errorMessage = 'Đã xảy ra lỗi không mong muốn';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Không tìm thấy tài khoản với email này';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mật khẩu không đúng';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email không hợp lệ';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Tài khoản đã bị vô hiệu hóa';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau';
          break;
      }
      
      Alert.alert('Lỗi đăng nhập', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header với gradient */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <Ionicons name="nutrition" size={60} color={colors.background} />
            <Text style={styles.appTitle}>Nutrition Tracker</Text>
            <Text style={styles.appSubtitle}>Theo dõi dinh dưỡng thông minh</Text>
          </View>
        </LinearGradient>

        {/* Form đăng nhập */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Đăng Nhập</Text>
          <Text style={styles.subtitle}>Chào mừng bạn trở lại!</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({...errors, email: undefined});
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholderTextColor={colors.textLight}
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Mật khẩu"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({...errors, password: undefined});
                }}
                autoComplete="password"
                placeholderTextColor={colors.textLight}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin} 
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? [colors.border, colors.border] : [colors.primary, colors.primaryDark]}
              style={styles.buttonGradient}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="refresh" size={20} color={colors.background} style={styles.loadingIcon} />
                  <Text style={styles.buttonText}>Đang đăng nhập...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="log-in-outline" size={20} color={colors.background} />
                  <Text style={styles.buttonText}>Đăng Nhập</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>          {/* Forgot Password */}
          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => router.push('/auth/forgot-password')}
          >
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          {/* Biometric Authentication */}
          <BiometricAuth 
            onSuccess={() => {
              Alert.alert('Thành công', 'Đăng nhập thành công!', [
                { text: 'OK', onPress: () => router.replace('/(tabs)') }
              ]);
            }}
            onError={(error) => {
              Alert.alert('Lỗi', error);
            }}
          />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>hoặc</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign up link */}
          <TouchableOpacity 
            style={styles.signupLink}
            onPress={() => router.push('/auth/signup')}
          >
            <Text style={styles.signupText}>
              Chưa có tài khoản? 
              <Text style={styles.signupTextBold}> Đăng ký ngay</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.background,
    marginTop: 16,
  },
  appSubtitle: {
    fontSize: 16,
    color: colors.cardSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 40,
    marginTop: -20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginRight: 4,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 8,
    marginLeft: 16,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
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
  signupLink: {
    alignItems: 'center',
    marginBottom: 20,
  },
  signupText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  signupTextBold: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});