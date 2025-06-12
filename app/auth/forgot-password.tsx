// app/auth/forgot-password.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<{email?: string}>({});
  const router = useRouter();

  const validateEmail = () => {
    const newErrors: {email?: string} = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      Alert.alert(
        'Email đã được gửi', 
        'Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Lỗi đặt lại mật khẩu:', error.code, error.message);
      let errorMessage = 'Đã xảy ra lỗi không mong muốn';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Không tìm thấy tài khoản với email này';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email không hợp lệ';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Quá nhiều yêu cầu. Vui lòng thử lại sau';
          break;
      }
      
      Alert.alert('Lỗi', errorMessage);
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
          colors={[colors.warning, colors.primary]}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.background} />
            </TouchableOpacity>
            <Ionicons name="key" size={60} color={colors.background} />
            <Text style={styles.appTitle}>Quên Mật Khẩu</Text>
            <Text style={styles.appSubtitle}>
              {emailSent 
                ? 'Email đặt lại mật khẩu đã được gửi'
                : 'Nhập email để đặt lại mật khẩu'
              }
            </Text>
          </View>
        </LinearGradient>

        {/* Form */}
        <View style={styles.formContainer}>
          {emailSent ? (
            // Success state
            <View style={styles.successContainer}>
              <Ionicons name="mail" size={80} color={colors.success} style={styles.successIcon} />
              <Text style={styles.successTitle}>Email đã được gửi!</Text>
              <Text style={styles.successMessage}>
                Chúng tôi đã gửi link đặt lại mật khẩu đến email:{'\n'}
                <Text style={styles.emailText}>{email}</Text>
              </Text>
              <Text style={styles.instructionText}>
                Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu.
              </Text>
              
              <TouchableOpacity 
                style={styles.resendButton}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text style={styles.resendButtonText}>
                  {loading ? 'Đang gửi...' : 'Gửi lại email'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Input form
            <>
              <Text style={styles.title}>Đặt Lại Mật Khẩu</Text>
              <Text style={styles.subtitle}>
                Nhập địa chỉ email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
              </Text>

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

              {/* Reset Button */}
              <TouchableOpacity 
                style={[styles.resetButton, loading && styles.resetButtonDisabled]} 
                onPress={handleResetPassword} 
                disabled={loading}
              >
                <LinearGradient
                  colors={loading ? [colors.border, colors.border] : [colors.warning, colors.primary]}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <Ionicons name="refresh" size={20} color={colors.background} style={styles.loadingIcon} />
                      <Text style={styles.buttonText}>Đang gửi...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Ionicons name="send-outline" size={20} color={colors.background} />
                      <Text style={styles.buttonText}>Gửi Email</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          {/* Back to login */}
          <TouchableOpacity 
            style={styles.backToLoginButton}
            onPress={() => router.push('/auth/login')}
          >
            <Ionicons name="arrow-back-outline" size={16} color={colors.primary} />
            <Text style={styles.backToLoginText}>Quay lại đăng nhập</Text>
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
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    padding: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
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
    lineHeight: 22,
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
    marginBottom: 30,
    lineHeight: 22,
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
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 8,
    marginLeft: 16,
  },
  resetButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 30,
  },
  resetButtonDisabled: {
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
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  emailText: {
    color: colors.primary,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 20,
  },
  resendButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  backToLoginText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
