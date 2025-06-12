// app/(tabs)/settings.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
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
import { colors } from '@/constants/colors';
import { auth } from '@/firebaseConfig';
import { signOut } from 'firebase/auth';
import { SecureStoreManager } from '@/utils/secureStore';
import * as LocalAuthentication from 'expo-local-authentication';

const { width } = Dimensions.get('window');

interface Goals {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  water: string;
}

interface UserProfile {
  name: string;
  age: string;
  weight: string;
  height: string;
  activityLevel: string;
  gender: 'male' | 'female';
}

interface AppSettings {
  notifications: boolean;
  darkMode: boolean;
  language: string;
  units: 'metric' | 'imperial';
}

const STORAGE_KEYS = {
  GOALS: 'dailyGoals',
  PROFILE: 'userProfile',
  SETTINGS: 'appSettings',
  MEALS: 'meals'
};

const ACTIVITY_LEVELS = [
  { key: 'sedentary', label: 'Ít vận động', multiplier: 1.2, description: 'Ngồi nhiều, ít tập thể dục' },
  { key: 'light', label: 'Vận động nhẹ', multiplier: 1.375, description: 'Tập nhẹ 1-3 ngày/tuần' },
  { key: 'moderate', label: 'Vận động vừa', multiplier: 1.55, description: 'Tập vừa 3-5 ngày/tuần' },
  { key: 'active', label: 'Vận động nhiều', multiplier: 1.725, description: 'Tập nặng 6-7 ngày/tuần' },
  { key: 'very_active', label: 'Vận động cao', multiplier: 1.9, description: 'Tập rất nặng hoặc công việc nặng' },
];

export default function SettingsScreen() {
  const [goals, setGoals] = useState<Goals>({ 
    calories: '', protein: '', carbs: '', fat: '', water: '' 
  });
  const [profile, setProfile] = useState<UserProfile>({ 
    name: '', age: '', weight: '', height: '', activityLevel: 'moderate', gender: 'male'
  });
  const [appSettings, setAppSettings] = useState<AppSettings>({ 
    notifications: true, darkMode: false, language: 'vi', units: 'metric'
  });
  const [activeTab, setActiveTab] = useState<'goals' | 'profile' | 'settings'>('goals');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadAllData();
    checkBiometricSupport();
  }, []);

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

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load goals
      const storedGoals = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
      if (storedGoals) {
        setGoals(JSON.parse(storedGoals));
      }

      // Load profile
      const storedProfile = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }

      // Load app settings
      const storedSettings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        setAppSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu cài đặt.');
    } finally {
      setLoading(false);
    }
  };

  // BMR calculation using Mifflin-St Jeor Equation
  const calculateBMR = (): number => {
    const weight = parseFloat(profile.weight);
    const height = parseFloat(profile.height);
    const age = parseFloat(profile.age);
    
    if (!weight || !height || !age) return 0;
    
    if (profile.gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  // TDEE calculation
  const calculateTDEE = (): number => {
    const bmr = calculateBMR();
    const activityMultiplier = ACTIVITY_LEVELS.find(level => level.key === profile.activityLevel)?.multiplier || 1.55;
    return Math.round(bmr * activityMultiplier);
  };

  const autoCalculateGoals = () => {
    const tdee = calculateTDEE();
    if (tdee > 0) {
      const protein = Math.round(parseFloat(profile.weight) * 1.6); // 1.6g per kg
      const fat = Math.round(tdee * 0.25 / 9); // 25% of calories from fat
      const carbs = Math.round((tdee - protein * 4 - fat * 9) / 4); // Remaining calories from carbs
      
      setGoals({
        calories: tdee.toString(),
        protein: protein.toString(),
        carbs: carbs.toString(),
        fat: fat.toString(),
        water: '2500', // Default 2.5L water goal
      });
      
      Alert.alert('Thành công', 'Mục tiêu đã được tính toán tự động dựa trên thông tin cá nhân của bạn!');
    } else {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin cá nhân để tính toán tự động.');
    }
  };

  const saveGoals = async () => {
    try {
      const parsedCalories = parseInt(goals.calories) || 0;
      const parsedProtein = parseInt(goals.protein) || 0;
      const parsedCarbs = parseInt(goals.carbs) || 0;
      const parsedFat = parseInt(goals.fat) || 0;
      const parsedWater = parseInt(goals.water) || 0;

      if (parsedCalories < 800 || parsedCalories > 5000) {
        Alert.alert('Lỗi', 'Mục tiêu calo phải từ 800-5000 kcal.');
        return;
      }

      if (parsedProtein < 0 || parsedCarbs < 0 || parsedFat < 0 || parsedWater < 0) {
        Alert.alert('Lỗi', 'Giá trị mục tiêu không được âm.');
        return;
      }

      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
      Alert.alert('Thành công', 'Mục tiêu hàng ngày đã được lưu!');
    } catch (error) {
      console.error('Error saving goals:', error);
      Alert.alert('Lỗi', 'Không thể lưu mục tiêu.');
    }
  };

  const saveProfile = async () => {
    try {
      const age = parseFloat(profile.age);
      const weight = parseFloat(profile.weight);
      const height = parseFloat(profile.height);

      if (age < 10 || age > 120) {
        Alert.alert('Lỗi', 'Tuổi phải từ 10-120.');
        return;
      }

      if (weight < 20 || weight > 300) {
        Alert.alert('Lỗi', 'Cân nặng phải từ 20-300 kg.');
        return;
      }

      if (height < 100 || height > 250) {
        Alert.alert('Lỗi', 'Chiều cao phải từ 100-250 cm.');
        return;
      }

      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      Alert.alert('Thành công', 'Thông tin cá nhân đã được lưu!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Lỗi', 'Không thể lưu thông tin cá nhân.');
    }
  };

  const saveAppSettings = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(appSettings));
      Alert.alert('Thành công', 'Cài đặt ứng dụng đã được lưu!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Lỗi', 'Không thể lưu cài đặt.');
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    try {
      if (value) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Xác thực để kích hoạt đăng nhập sinh trắc học',
          cancelLabel: 'Hủy',
          fallbackLabel: 'Sử dụng mật khẩu',
        });
        
        if (result.success) {
          await SecureStoreManager.setBiometricEnabled(true);
          setBiometricEnabled(true);
          Alert.alert('Thành công', 'Đã kích hoạt đăng nhập sinh trắc học!');
        }
      } else {
        await SecureStoreManager.setBiometricEnabled(false);
        setBiometricEnabled(false);
        Alert.alert('Thành công', 'Đã tắt đăng nhập sinh trắc học!');
      }
    } catch (error) {
      console.error('Biometric toggle error:', error);
      Alert.alert('Lỗi', 'Không thể thay đổi cài đặt sinh trắc học.');
    }
  };

  const clearAllData = () => {
    Alert.alert(
      'Xác nhận xóa dữ liệu',
      'Bạn chắc chắn muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa tất cả', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                STORAGE_KEYS.GOALS, 
                STORAGE_KEYS.PROFILE, 
                STORAGE_KEYS.SETTINGS, 
                STORAGE_KEYS.MEALS
              ]);
              
              setGoals({ calories: '', protein: '', carbs: '', fat: '', water: '' });
              setProfile({ name: '', age: '', weight: '', height: '', activityLevel: 'moderate', gender: 'male' });
              setAppSettings({ notifications: true, darkMode: false, language: 'vi', units: 'metric' });
              
              Alert.alert('Thành công', 'Đã xóa tất cả dữ liệu!');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa dữ liệu.');
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
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
              await SecureStoreManager.clearAll();
              router.replace('/auth/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất.');
            }
          }
        }
      ]
    );
  };

  const renderGoalsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flag" size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Mục tiêu hàng ngày</Text>
        </View>
        
        {profile.weight && profile.height && profile.age && (
          <View style={styles.calculatorCard}>
            <Text style={styles.calculatorTitle}>Tính toán tự động</Text>
            <Text style={styles.calculatorText}>
              BMR: ~{Math.round(calculateBMR())} kcal/ngày
            </Text>
            <Text style={styles.calculatorText}>
              TDEE: ~{calculateTDEE()} kcal/ngày
            </Text>
            <TouchableOpacity style={styles.autoButton} onPress={autoCalculateGoals}>
              <Ionicons name="calculator" size={16} color={colors.background} />
              <Text style={styles.autoButtonText}>Tính toán mục tiêu</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Ionicons name="flame" size={16} color={colors.calories} />
            <Text style={[styles.label, {color: colors.calories}]}>Calo (kcal)</Text>
          </View>
          <TextInput
            style={[styles.input, {borderColor: colors.calories}]}
            keyboardType="numeric"
            value={goals.calories}
            onChangeText={(text) => setGoals({ ...goals, calories: text.replace(/[^0-9]/g, '') })}
            placeholder="2000"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.inputRow}>
          <View style={styles.macroContainer}>
            <View style={styles.labelContainer}>
              <Ionicons name="fitness" size={16} color={colors.protein} />
              <Text style={[styles.label, {color: colors.protein}]}>Protein (g)</Text>
            </View>
            <TextInput
              style={[styles.macroInput, {borderColor: colors.protein}]}
              keyboardType="numeric"
              value={goals.protein}
              onChangeText={(text) => setGoals({ ...goals, protein: text.replace(/[^0-9]/g, '') })}
              placeholder="150"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.macroContainer}>
            <View style={styles.labelContainer}>
              <Ionicons name="leaf" size={16} color={colors.carbs} />
              <Text style={[styles.label, {color: colors.carbs}]}>Carbs (g)</Text>
            </View>
            <TextInput
              style={[styles.macroInput, {borderColor: colors.carbs}]}
              keyboardType="numeric"
              value={goals.carbs}
              onChangeText={(text) => setGoals({ ...goals, carbs: text.replace(/[^0-9]/g, '') })}
              placeholder="250"
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.macroContainer}>
            <View style={styles.labelContainer}>
              <Ionicons name="nutrition" size={16} color={colors.fat} />
              <Text style={[styles.label, {color: colors.fat}]}>Fat (g)</Text>
            </View>
            <TextInput
              style={[styles.macroInput, {borderColor: colors.fat}]}
              keyboardType="numeric"
              value={goals.fat}
              onChangeText={(text) => setGoals({ ...goals, fat: text.replace(/[^0-9]/g, '') })}
              placeholder="65"
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.macroContainer}>
            <View style={styles.labelContainer}>
              <Ionicons name="water" size={16} color={colors.info} />
              <Text style={[styles.label, {color: colors.info}]}>Nước (ml)</Text>
            </View>
            <TextInput
              style={[styles.macroInput, {borderColor: colors.info}]}
              keyboardType="numeric"
              value={goals.water}
              onChangeText={(text) => setGoals({ ...goals, water: text.replace(/[^0-9]/g, '') })}
              placeholder="2500"
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveGoals}>
          <Ionicons name="save-outline" size={20} color={colors.background} />
          <Text style={styles.saveButtonText}>Lưu mục tiêu</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderProfileTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person" size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tên</Text>
          <TextInput
            style={styles.input}
            value={profile.name}
            onChangeText={(text) => setProfile({ ...profile, name: text })}
            placeholder="Nhập tên của bạn"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Giới tính</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[styles.genderButton, profile.gender === 'male' && styles.selectedGenderButton]}
              onPress={() => setProfile({ ...profile, gender: 'male' })}
            >
              <Ionicons name="man" size={20} color={profile.gender === 'male' ? colors.background : colors.textSecondary} />
              <Text style={[
                styles.genderText,
                profile.gender === 'male' && styles.selectedGenderText
              ]}>Nam</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, profile.gender === 'female' && styles.selectedGenderButton]}
              onPress={() => setProfile({ ...profile, gender: 'female' })}
            >
              <Ionicons name="woman" size={20} color={profile.gender === 'female' ? colors.background : colors.textSecondary} />
              <Text style={[
                styles.genderText,
                profile.gender === 'female' && styles.selectedGenderText
              ]}>Nữ</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.macroContainer}>
            <Text style={styles.label}>Tuổi</Text>
            <TextInput
              style={styles.macroInput}
              keyboardType="numeric"
              value={profile.age}
              onChangeText={(text) => setProfile({ ...profile, age: text.replace(/[^0-9]/g, '') })}
              placeholder="25"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.macroContainer}>
            <Text style={styles.label}>Cân nặng (kg)</Text>
            <TextInput
              style={styles.macroInput}
              keyboardType="numeric"
              value={profile.weight}
              onChangeText={(text) => setProfile({ ...profile, weight: text.replace(/[^0-9.]/g, '') })}
              placeholder="70.0"
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.macroContainer}>
            <Text style={styles.label}>Chiều cao (cm)</Text>
            <TextInput
              style={styles.macroInput}
              keyboardType="numeric"
              value={profile.height}
              onChangeText={(text) => setProfile({ ...profile, height: text.replace(/[^0-9]/g, '') })}
              placeholder="170"
              placeholderTextColor={colors.textLight}
            />
          </View>
          <View style={styles.macroContainer} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mức độ hoạt động</Text>
          <View style={styles.activityContainer}>
            {ACTIVITY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.key}
                style={[
                  styles.activityButton,
                  profile.activityLevel === level.key && styles.selectedActivityButton
                ]}
                onPress={() => setProfile({ ...profile, activityLevel: level.key })}
              >
                <Text style={[
                  styles.activityText,
                  profile.activityLevel === level.key && styles.selectedActivityText
                ]}>
                  {level.label}
                </Text>
                <Text style={[
                  styles.activityDescription,
                  profile.activityLevel === level.key && styles.selectedActivityDescription
                ]}>
                  {level.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
          <Ionicons name="save-outline" size={20} color={colors.background} />
          <Text style={styles.saveButtonText}>Lưu thông tin</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderSettingsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="cog" size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Cài đặt ứng dụng</Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={20} color={colors.warning} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Thông báo</Text>
              <Text style={styles.settingSubtext}>Nhận thông báo nhắc nhở</Text>
            </View>
          </View>
          <Switch
            value={appSettings.notifications}
            onValueChange={(value) => setAppSettings({ ...appSettings, notifications: value })}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={appSettings.notifications ? colors.primary : colors.textLight}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon" size={20} color={colors.info} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Chế độ tối</Text>
              <Text style={styles.settingSubtext}>Sắp có trong phiên bản tới</Text>
            </View>
          </View>
          <Switch
            value={appSettings.darkMode}
            onValueChange={(value) => setAppSettings({ ...appSettings, darkMode: value })}
            disabled={true}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={colors.textLight}
          />
        </View>

        {biometricSupported && (
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="finger-print" size={20} color={colors.success} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Đăng nhập sinh trắc học</Text>
                <Text style={styles.settingSubtext}>Sử dụng vân tay/Face ID</Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={biometricEnabled ? colors.primary : colors.textLight}
            />
          </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={saveAppSettings}>
          <Ionicons name="save-outline" size={20} color={colors.background} />
          <Text style={styles.saveButtonText}>Lưu cài đặt</Text>
        </TouchableOpacity>
        
        <View style={styles.dangerZone}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={24} color={colors.error} />
            <Text style={[styles.sectionTitle, {color: colors.error}]}>Vùng nguy hiểm</Text>
          </View>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color={colors.background} />
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.dangerButton} onPress={clearAllData}>
            <Ionicons name="trash" size={20} color={colors.background} />
            <Text style={styles.dangerButtonText}>Xóa tất cả dữ liệu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cài đặt</Text>
        <Text style={styles.headerSubtitle}>Quản lý tài khoản và ứng dụng</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'goals' && styles.activeTabButton]}
          onPress={() => setActiveTab('goals')}
        >
          <Ionicons 
            name="flag-outline" 
            size={20} 
            color={activeTab === 'goals' ? colors.background : colors.textSecondary} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'goals' && styles.activeTabText
          ]}>
            Mục tiêu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'profile' && styles.activeTabButton]}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons 
            name="person-outline" 
            size={20} 
            color={activeTab === 'profile' ? colors.background : colors.textSecondary} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'profile' && styles.activeTabText
          ]}>
            Hồ sơ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'settings' && styles.activeTabButton]}
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons 
            name="cog-outline" 
            size={20} 
            color={activeTab === 'settings' ? colors.background : colors.textSecondary} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'settings' && styles.activeTabText
          ]}>
            Ứng dụng
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'goals' && renderGoalsTab()}
      {activeTab === 'profile' && renderProfileTab()}
      {activeTab === 'settings' && renderSettingsTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.background,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.backgroundSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  activeTabText: {
    color: colors.background,
    fontWeight: '700',
  },
  tabContent: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 20,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 10,
  },
  calculatorCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  calculatorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  calculatorText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  autoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  autoButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  macroContainer: {
    flex: 1,
    marginRight: 8,
  },
  macroInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.text,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  selectedGenderButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
    marginLeft: 8,
  },
  selectedGenderText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  activityContainer: {
    gap: 8,
  },
  activityButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 16,
    borderRadius: 12,
  },
  selectedActivityButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  activityText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedActivityText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  activityDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectedActivityDescription: {
    color: colors.backgroundSecondary,
  },
  saveButton: {
    backgroundColor: colors.success,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  settingSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dangerZone: {
    marginTop: 32,
    borderTopWidth: 2,
    borderTopColor: colors.error,
    paddingTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dangerButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});