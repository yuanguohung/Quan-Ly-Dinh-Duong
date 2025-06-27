import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useUser, useUserProfile } from '@/contexts/UserContext';
import { UserService } from '@/services/userService';

interface PersonalInfoProps {
  visible: boolean;
  onClose: () => void;
}

export default function PersonalInfoModal({ visible, onClose }: PersonalInfoProps) {
  const { user } = useUser();
  const { userProfile, updateProfile } = useUserProfile();
  
  // Debug logging
  useEffect(() => {
    console.log('PersonalInfoModal - visible:', visible);
    console.log('PersonalInfoModal - user:', user?.email);
    console.log('PersonalInfoModal - userProfile:', userProfile);
  }, [visible, user, userProfile]);
  
  const [formData, setFormData] = useState({
    displayName: '',
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female' | 'other',
    height: '',
    weight: '',
    activityLevel: 'moderate' as any,
    goalType: 'maintain' as 'maintain' | 'lose' | 'gain',
    targetWeight: '',
  });

  const [medicalInfo, setMedicalInfo] = useState({
    allergies: '',
    dietaryRestrictions: '',
    medications: '',
    conditions: '',
  });

  const [preferences, setPreferences] = useState({
    units: 'metric' as 'metric' | 'imperial',
    language: 'vi' as 'vi' | 'en',
    mealReminders: true,
    waterReminders: true,
    goalAchievements: true,
    weeklyReports: true,
    shareProgress: false,
    publicProfile: false,
  });

  // Load user data when profile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        dateOfBirth: userProfile.dateOfBirth 
          ? userProfile.dateOfBirth.toISOString().split('T')[0] 
          : '',
        gender: userProfile.gender || 'male',
        height: userProfile.height?.toString() || '',
        weight: userProfile.weight?.toString() || '',
        activityLevel: userProfile.activityLevel || 'moderate',
        goalType: userProfile.goals?.type || 'maintain',
        targetWeight: userProfile.goals?.targetWeight?.toString() || '',
      });

      setMedicalInfo({
        allergies: userProfile.medicalInfo?.allergies?.join(', ') || '',
        dietaryRestrictions: userProfile.medicalInfo?.dietaryRestrictions?.join(', ') || '',
        medications: userProfile.medicalInfo?.medications?.join(', ') || '',
        conditions: userProfile.medicalInfo?.conditions?.join(', ') || '',
      });

      setPreferences({
        units: userProfile.preferences?.units || 'metric',
        language: userProfile.preferences?.language || 'vi',
        mealReminders: userProfile.preferences?.notifications?.mealReminders ?? true,
        waterReminders: userProfile.preferences?.notifications?.waterReminders ?? true,
        goalAchievements: userProfile.preferences?.notifications?.goalAchievements ?? true,
        weeklyReports: userProfile.preferences?.notifications?.weeklyReports ?? true,
        shareProgress: userProfile.preferences?.privacy?.shareProgress ?? false,
        publicProfile: userProfile.preferences?.privacy?.publicProfile ?? false,
      });
    }
  }, [userProfile]);
  const handleSave = async () => {
    try {
      console.log('PersonalInfoModal - handleSave called');
      console.log('PersonalInfoModal - formData:', formData);
      console.log('PersonalInfoModal - userProfile:', userProfile);
      
      if (!userProfile) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
        return;
      }

      // Calculate recommended macros
      const tempProfile = {
        ...userProfile,
        weight: parseFloat(formData.weight) || userProfile.weight,
        height: parseFloat(formData.height) || userProfile.height,
        activityLevel: formData.activityLevel,
        goals: { ...userProfile.goals, type: formData.goalType },
      };
      
      const recommendedMacros = UserService.calculateRecommendedMacros(tempProfile);      const updates = {
        displayName: formData.displayName,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : userProfile.dateOfBirth,
        gender: formData.gender,
        height: parseFloat(formData.height) || userProfile.height,
        weight: parseFloat(formData.weight) || userProfile.weight,
        activityLevel: formData.activityLevel,
        goals: {
          ...userProfile.goals,
          type: formData.goalType,
          targetWeight: parseFloat(formData.targetWeight) || userProfile.goals?.targetWeight,
          ...recommendedMacros, // Auto-calculate optimal macros
        },
        medicalInfo: {
          allergies: medicalInfo.allergies.split(',').map(s => s.trim()).filter(Boolean),
          dietaryRestrictions: medicalInfo.dietaryRestrictions.split(',').map(s => s.trim()).filter(Boolean),
          medications: medicalInfo.medications.split(',').map(s => s.trim()).filter(Boolean),
          conditions: medicalInfo.conditions.split(',').map(s => s.trim()).filter(Boolean),
        },
        preferences: {
          units: preferences.units,
          language: preferences.language,
          notifications: {
            mealReminders: preferences.mealReminders,
            waterReminders: preferences.waterReminders,
            goalAchievements: preferences.goalAchievements,
            weeklyReports: preferences.weeklyReports,
          },
          privacy: {
            shareProgress: preferences.shareProgress,
            publicProfile: preferences.publicProfile,
          },
        },
      };

      console.log('PersonalInfoModal - updates:', updates);
      await updateProfile(updates);
      Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật!');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  const ACTIVITY_LEVELS = [
    { key: 'sedentary', label: 'Ít vận động', description: 'Ngồi nhiều, ít tập thể dục' },
    { key: 'light', label: 'Vận động nhẹ', description: 'Tập nhẹ 1-3 ngày/tuần' },
    { key: 'moderate', label: 'Vận động vừa', description: 'Tập vừa 3-5 ngày/tuần' },
    { key: 'active', label: 'Vận động nhiều', description: 'Tập nặng 6-7 ngày/tuần' },
    { key: 'very-active', label: 'Rất năng động', description: 'Tập rất nặng hoặc công việc thể chất' },
  ];
  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveText}>Lưu</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Test section to verify modal is working */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Modal Test</Text>
            <Text style={styles.label}>Modal đang hoạt động! User: {user?.email}</Text>
            <Text style={styles.label}>Profile loaded: {userProfile ? 'Có' : 'Không'}</Text>
          </View>
          
         

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
            
            <Text style={styles.label}>Tên hiển thị</Text>
            <TextInput
              style={styles.input}
              value={formData.displayName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, displayName: text }))}
              placeholder="Nhập tên của bạn"
            />

            <Text style={styles.label}>Ngày sinh</Text>
            <TextInput
              style={styles.input}
              value={formData.dateOfBirth}
              onChangeText={(text) => setFormData(prev => ({ ...prev, dateOfBirth: text }))}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.genderContainer}>
              {['male', 'female', 'other'].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderButton,
                    formData.gender === gender && styles.selectedGender
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, gender: gender as any }))}
                >
                  <Text style={[
                    styles.genderText,
                    formData.gender === gender && styles.selectedGenderText
                  ]}>
                    {gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Physical Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông số cơ thể</Text>
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Chiều cao (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.height}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, height: text }))}
                  placeholder="170"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.halfInput}>
                <Text style={styles.label}>Cân nặng (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.weight}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, weight: text }))}
                  placeholder="70"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.label}>Mức độ vận động</Text>
            {ACTIVITY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.key}
                style={[
                  styles.activityButton,
                  formData.activityLevel === level.key && styles.selectedActivity
                ]}
                onPress={() => setFormData(prev => ({ ...prev, activityLevel: level.key as any }))}
              >
                <View>
                  <Text style={[
                    styles.activityLabel,
                    formData.activityLevel === level.key && styles.selectedActivityText
                  ]}>
                    {level.label}
                  </Text>
                  <Text style={[
                    styles.activityDescription,
                    formData.activityLevel === level.key && styles.selectedActivityDescription
                  ]}>
                    {level.description}
                  </Text>
                </View>
                {formData.activityLevel === level.key && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Goals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mục tiêu</Text>
            
            <Text style={styles.label}>Loại mục tiêu</Text>
            <View style={styles.goalContainer}>
              {[
                { key: 'maintain', label: 'Duy trì cân nặng', icon: 'remove' },
                { key: 'lose', label: 'Giảm cân', icon: 'trending-down' },
                { key: 'gain', label: 'Tăng cân', icon: 'trending-up' },
              ].map((goal) => (
                <TouchableOpacity
                  key={goal.key}
                  style={[
                    styles.goalButton,
                    formData.goalType === goal.key && styles.selectedGoal
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, goalType: goal.key as any }))}
                >
                  <Ionicons 
                    name={goal.icon as any} 
                    size={20} 
                    color={formData.goalType === goal.key ? colors.primary : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.goalText,
                    formData.goalType === goal.key && styles.selectedGoalText
                  ]}>
                    {goal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {(formData.goalType === 'lose' || formData.goalType === 'gain') && (
              <>
                <Text style={styles.label}>Cân nặng mục tiêu (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.targetWeight}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, targetWeight: text }))}
                  placeholder="65"
                  keyboardType="numeric"
                />
              </>
            )}
          </View>

          {/* Medical Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin y tế</Text>
            
            <Text style={styles.label}>Dị ứng (phân cách bằng dấu phẩy)</Text>
            <TextInput
              style={styles.multilineInput}
              value={medicalInfo.allergies}
              onChangeText={(text) => setMedicalInfo(prev => ({ ...prev, allergies: text }))}
              placeholder="Ví dụ: Tôm, cua, sữa"
              multiline
            />

            <Text style={styles.label}>Chế độ ăn kiêng</Text>
            <TextInput
              style={styles.multilineInput}
              value={medicalInfo.dietaryRestrictions}
              onChangeText={(text) => setMedicalInfo(prev => ({ ...prev, dietaryRestrictions: text }))}
              placeholder="Ví dụ: Vegetarian, Keto, Halal"
              multiline
            />

            <Text style={styles.label}>Thuốc đang sử dụng</Text>
            <TextInput
              style={styles.multilineInput}
              value={medicalInfo.medications}
              onChangeText={(text) => setMedicalInfo(prev => ({ ...prev, medications: text }))}
              placeholder="Ví dụ: Metformin, Lisinopril"
              multiline
            />

            <Text style={styles.label}>Tình trạng sức khỏe</Text>
            <TextInput
              style={styles.multilineInput}
              value={medicalInfo.conditions}
              onChangeText={(text) => setMedicalInfo(prev => ({ ...prev, conditions: text }))}
              placeholder="Ví dụ: Tiểu đường, Huyết áp cao"
              multiline
            />
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tùy chọn</Text>
            
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Đơn vị đo lường</Text>
              <View style={styles.unitContainer}>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    preferences.units === 'metric' && styles.selectedUnit
                  ]}
                  onPress={() => setPreferences(prev => ({ ...prev, units: 'metric' }))}
                >
                  <Text style={[
                    styles.unitText,
                    preferences.units === 'metric' && styles.selectedUnitText
                  ]}>
                    Metric
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    preferences.units === 'imperial' && styles.selectedUnit
                  ]}
                  onPress={() => setPreferences(prev => ({ ...prev, units: 'imperial' }))}
                >
                  <Text style={[
                    styles.unitText,
                    preferences.units === 'imperial' && styles.selectedUnitText
                  ]}>
                    Imperial
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Ngôn ngữ</Text>
              <View style={styles.unitContainer}>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    preferences.language === 'vi' && styles.selectedUnit
                  ]}
                  onPress={() => setPreferences(prev => ({ ...prev, language: 'vi' }))}
                >
                  <Text style={[
                    styles.unitText,
                    preferences.language === 'vi' && styles.selectedUnitText
                  ]}>
                    Tiếng Việt
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    preferences.language === 'en' && styles.selectedUnit
                  ]}
                  onPress={() => setPreferences(prev => ({ ...prev, language: 'en' }))}
                >
                  <Text style={[
                    styles.unitText,
                    preferences.language === 'en' && styles.selectedUnitText
                  ]}>
                    English
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionSubtitle}>Thông báo</Text>
            
            {[
              { key: 'mealReminders', label: 'Nhắc nhở bữa ăn' },
              { key: 'waterReminders', label: 'Nhắc nhở uống nước' },
              { key: 'goalAchievements', label: 'Thành tích đạt được' },
              { key: 'weeklyReports', label: 'Báo cáo hàng tuần' },
            ].map((pref) => (
              <View key={pref.key} style={styles.switchRow}>
                <Text style={styles.switchLabel}>{pref.label}</Text>
                <Switch
                  value={preferences[pref.key as keyof typeof preferences] as boolean}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, [pref.key]: value }))}
                  trackColor={{ false: colors.border, true: colors.primary + '40' }}
                  thumbColor={preferences[pref.key as keyof typeof preferences] ? colors.primary : colors.textSecondary}
                />
              </View>
            ))}

            <Text style={styles.sectionSubtitle}>Quyền riêng tư</Text>
            
            {[
              { key: 'shareProgress', label: 'Chia sẻ tiến độ' },
              { key: 'publicProfile', label: 'Hồ sơ công khai' },
            ].map((pref) => (
              <View key={pref.key} style={styles.switchRow}>
                <Text style={styles.switchLabel}>{pref.label}</Text>
                <Switch
                  value={preferences[pref.key as keyof typeof preferences] as boolean}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, [pref.key]: value }))}
                  trackColor={{ false: colors.border, true: colors.primary + '40' }}
                  thumbColor={preferences[pref.key as keyof typeof preferences] ? colors.primary : colors.textSecondary}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  saveText: {
    color: colors.background,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  multilineInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  changePhotoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
  },
  changePhotoText: {
    color: colors.primary,
    fontWeight: '500',
  },
  genderContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedGender: {
    backgroundColor: colors.primary,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  selectedGenderText: {
    color: colors.background,
  },
  activityButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 4,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
  },
  selectedActivity: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  activityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  activityDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  selectedActivityText: {
    color: colors.primary,
  },
  selectedActivityDescription: {
    color: colors.primary + 'AA',
  },
  goalContainer: {
    marginTop: 8,
  },
  goalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 4,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
  },
  selectedGoal: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 12,
  },
  selectedGoalText: {
    color: colors.primary,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  unitContainer: {
    flexDirection: 'row',
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
  },
  selectedUnit: {
    backgroundColor: colors.primary,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  selectedUnitText: {
    color: colors.background,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
});
