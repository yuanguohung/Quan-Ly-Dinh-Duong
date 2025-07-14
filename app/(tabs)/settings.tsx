// app/(tabs)/settings.tsx - Clean version without goals and personal info input
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView,
  Switch,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { auth } from '@/firebaseConfig';
import { signOut } from 'firebase/auth';
import { SecureStoreManager } from '@/utils/secureStore';
import * as LocalAuthentication from 'expo-local-authentication';
import { useUser } from '@/contexts/UserContext';
import PersonalInfoModal from '@/components/PersonalInfoModal';
import PrivacyInfo from '@/components/PrivacyInfo';

const { width } = Dimensions.get('window');

interface AppSettings {
  notifications: boolean;
  language: string;
  units: 'metric' | 'imperial';
}

const STORAGE_KEYS = {
  SETTINGS: 'appSettings',
};

export default function SettingsScreen() {
  const { user } = useUser();
  const { colors, theme, setTheme } = useTheme();
  
  const [appSettings, setAppSettings] = useState<AppSettings>({ 
    notifications: true, 
    language: 'vi', 
    units: 'metric'
  });
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    loadAppSettings();
    checkBiometricSupport();
  }, []);

  const loadAppSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        setAppSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Error loading app settings:', error);
    }
  };

  const saveAppSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
      setAppSettings(newSettings);
    } catch (error) {
      console.error('Error saving app settings:', error);
      Alert.alert('Lỗi', 'Không thể lưu cài đặt');
    }
  };

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricSupported(compatible && enrolled);
      
      if (compatible && enrolled) {
        const enabled = await SecureStoreManager.isBiometricEnabled();
        setBiometricEnabled(enabled);
      }
    } catch (error) {
      console.error('Biometric check error:', error);
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    try {
      if (value) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Xác thực để bật đăng nhập bằng sinh trắc học',
          fallbackLabel: 'Sử dụng mật khẩu',
        });
        
        if (result.success) {
          await SecureStoreManager.setBiometricEnabled(true);
          setBiometricEnabled(true);
          Alert.alert('Thành công', 'Đã bật đăng nhập bằng sinh trắc học');
        }
      } else {
        await SecureStoreManager.setBiometricEnabled(false);
        setBiometricEnabled(false);
        Alert.alert('Thành công', 'Đã tắt đăng nhập bằng sinh trắc học');
      }
    } catch (error) {
      console.error('Biometric toggle error:', error);
      Alert.alert('Lỗi', 'Không thể thay đổi cài đặt sinh trắc học');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/auth/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất');
            }
          }
        }
      ]
    );
  };

  const getThemeDisplayName = (theme: string) => {
    switch (theme) {
      case 'light': return 'Sáng';
      case 'dark': return 'Tối';
      case 'system': return 'Theo hệ thống';
      default: return 'Theo hệ thống';
    }
  };

  const showThemeSelector = () => {
    Alert.alert(
      'Chọn giao diện',
      'Bạn muốn sử dụng giao diện nào?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Sáng', onPress: () => setTheme('light') },
        { text: 'Tối', onPress: () => setTheme('dark') },
        { text: 'Theo hệ thống', onPress: () => setTheme('system') }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Cài đặt</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Quản lý tài khoản và ứng dụng
          </Text>
        </View>

        {/* Personal Info Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin cá nhân</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={() => setShowPersonalInfoModal(true)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>
                Chỉnh sửa hồ sơ
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* App Settings Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Cài đặt ứng dụng</Text>
          
          {/* Theme Setting */}
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={showThemeSelector}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={20} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Giao diện</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {getThemeDisplayName(theme)}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          {/* Notifications Setting */}
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Thông báo</Text>
            </View>
            <Switch
              value={appSettings.notifications}
              onValueChange={(value) => saveAppSettings({...appSettings, notifications: value})}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          {/* Units Setting */}
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={() => {
              Alert.alert(
                'Đơn vị đo lường',
                'Chọn hệ thống đơn vị đo lường',
                [
                  { text: 'Hủy', style: 'cancel' },
                  { text: 'Mét (kg, cm)', onPress: () => saveAppSettings({...appSettings, units: 'metric'}) },
                  { text: 'Anh (lbs, ft)', onPress: () => saveAppSettings({...appSettings, units: 'imperial'}) }
                ]
              );
            }}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="resize-outline" size={20} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Đơn vị đo lường</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {appSettings.units === 'metric' ? 'Mét (kg, cm)' : 'Anh (lbs, ft)'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Security Section */}
        {biometricSupported && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Bảo mật</Text>
            
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <Ionicons name="finger-print-outline" size={20} color={colors.primary} />
                <Text style={[styles.settingText, { color: colors.text }]}>
                  Đăng nhập sinh trắc học
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleToggleBiometric}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.card}
              />
            </View>
          </View>
        )}

        {/* Privacy Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quyền riêng tư</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={() => setShowPrivacyInfo(true)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="shield-outline" size={20} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>
                Thông tin bảo mật
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tài khoản</Text>
          
          {user && (
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <Ionicons name="mail-outline" size={20} color={colors.primary} />
                <Text style={[styles.settingText, { color: colors.text }]}>Email</Text>
              </View>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {user.email}
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={[styles.settingText, { color: colors.error }]}>
                Đăng xuất
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Nutrition Tracker v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Personal Info Modal */}
      <PersonalInfoModal
        visible={showPersonalInfoModal}
        onClose={() => setShowPersonalInfoModal(false)}
      />

      {/* Privacy Info Modal */}
      {showPrivacyInfo && (
        <PrivacyInfo
          onClose={() => setShowPrivacyInfo(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  settingValue: {
    fontSize: 14,
    marginRight: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 14,
  },
});
