import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';

interface Exercise {
  id: string;
  name: string;
  duration: number; // minutes
  caloriesBurned: number;
  date: string;
  type: 'cardio' | 'strength' | 'sports' | 'yoga' | 'other';
  notes?: string;
}

const EXERCISE_TYPES = [
  { id: 'cardio', name: 'Cardio', icon: 'heart', color: colors.error },
  { id: 'strength', name: 'Tập tạ', icon: 'barbell', color: colors.primary },
  { id: 'sports', name: 'Thể thao', icon: 'football', color: colors.info },
  { id: 'yoga', name: 'Yoga', icon: 'leaf', color: colors.success },
  { id: 'other', name: 'Khác', icon: 'ellipsis-horizontal', color: colors.warning },
];

const QUICK_EXERCISES = [
  { name: 'Đi bộ', calories: 4, type: 'cardio' },
  { name: 'Chạy bộ', calories: 10, type: 'cardio' },
  { name: 'Đạp xe', calories: 8, type: 'cardio' },
  { name: 'Bơi lội', calories: 12, type: 'cardio' },
  { name: 'Tập tạ', calories: 6, type: 'strength' },
  { name: 'Yoga', calories: 3, type: 'yoga' },
  { name: 'Bóng đá', calories: 9, type: 'sports' },
  { name: 'Tennis', calories: 8, type: 'sports' },
];

export default function ActivityScreen() {
  const { user } = useUser();
  const { colors } = useTheme();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    caloriesBurned: '',
    type: 'cardio' as Exercise['type'],
    notes: '',
  });

  // Helper function to get user-specific storage key
  const getExercisesStorageKey = () => {
    if (!user?.uid) return 'exercises';
    return `exercises_${user.uid}`;
  };

  // Load exercises
  const loadExercises = async () => {
    try {
      if (!user?.uid) {
        setExercises([]);
        return;
      }

      const storageKey = getExercisesStorageKey();
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        const parsedExercises = JSON.parse(stored);
        setExercises(parsedExercises);
      } else {
        setExercises([]);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
      setExercises([]);
    }
  };

  // Auto-refresh when tab is focused
  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        loadExercises();
      }
    }, [user?.uid])
  );

  const saveExercise = async () => {
    if (!user) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để thêm hoạt động');
      return;
    }

    if (!formData.name.trim() || !formData.duration.trim() || !formData.caloriesBurned.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const duration = parseInt(formData.duration);
    const calories = parseInt(formData.caloriesBurned);

    if (duration <= 0 || calories <= 0) {
      Alert.alert('Lỗi', 'Thời gian và calo phải lớn hơn 0');
      return;
    }

    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      duration,
      caloriesBurned: calories,
      type: formData.type,
      notes: formData.notes.trim(),
      date: new Date().toDateString(),
    };

    try {
      const storageKey = getExercisesStorageKey();
      const updatedExercises = [...exercises, newExercise];
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedExercises));
      setExercises(updatedExercises);
      
      // Reset form
      setFormData({
        name: '',
        duration: '',
        caloriesBurned: '',
        type: 'cardio',
        notes: '',
      });
      setShowAddModal(false);
      Alert.alert('Thành công', 'Đã thêm hoạt động!');
    } catch (error) {
      console.error('Error saving exercise:', error);
      Alert.alert('Lỗi', 'Không thể lưu hoạt động');
    }
  };

  const deleteExercise = async (id: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn chắc chắn muốn xóa hoạt động này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const storageKey = getExercisesStorageKey();
              const updatedExercises = exercises.filter(ex => ex.id !== id);
              await AsyncStorage.setItem(storageKey, JSON.stringify(updatedExercises));
              setExercises(updatedExercises);
            } catch (error) {
              console.error('Error deleting exercise:', error);
            }
          },
        },
      ]
    );
  };

  const addQuickExercise = (quickEx: typeof QUICK_EXERCISES[0]) => {
    setFormData({
      name: quickEx.name,
      duration: '30',
      caloriesBurned: (quickEx.calories * 30).toString(),
      type: quickEx.type as Exercise['type'],
      notes: '',
    });
    setShowAddModal(true);
  };

  const getTodayExercises = () => {
    const today = new Date().toDateString();
    return exercises.filter(ex => ex.date === today);
  };

  const getTodayCaloriesBurned = () => {
    return getTodayExercises().reduce((sum, ex) => sum + ex.caloriesBurned, 0);
  };

  const getTodayDuration = () => {
    return getTodayExercises().reduce((sum, ex) => sum + ex.duration, 0);
  };

  const getExerciseIcon = (type: Exercise['type']): any => {
    const exerciseType = EXERCISE_TYPES.find(t => t.id === type);
    return exerciseType?.icon || 'fitness';
  };

  const getExerciseColor = (type: Exercise['type']) => {
    const exerciseType = EXERCISE_TYPES.find(t => t.id === type);
    return exerciseType?.color || colors.primary;
  };

  const todayExercises = getTodayExercises();
  const todayCalories = getTodayCaloriesBurned();
  const todayDuration = getTodayDuration();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hoạt động thể thao</Text>
        <Text style={styles.headerSubtitle}>Theo dõi luyện tập của bạn</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today's Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Hôm nay</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="flame" size={24} color={colors.calories} />
              <Text style={styles.summaryValue}>{todayCalories}</Text>
              <Text style={styles.summaryLabel}>kcal đốt</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="time" size={24} color={colors.info} />
              <Text style={styles.summaryValue}>{todayDuration}</Text>
              <Text style={styles.summaryLabel}>phút</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="fitness" size={24} color={colors.success} />
              <Text style={styles.summaryValue}>{todayExercises.length}</Text>
              <Text style={styles.summaryLabel}>hoạt động</Text>
            </View>
          </View>
        </View>

        {/* Quick Add Exercises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thêm nhanh</Text>
          <View style={styles.quickExerciseGrid}>
            {QUICK_EXERCISES.map((exercise, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickExerciseCard}
                onPress={() => addQuickExercise(exercise)}
              >
                <Ionicons 
                  name={getExerciseIcon(exercise.type as Exercise['type'])} 
                  size={20} 
                  color={getExerciseColor(exercise.type as Exercise['type'])} 
                />
                <Text style={styles.quickExerciseName}>{exercise.name}</Text>
                <Text style={styles.quickExerciseCalories}>{exercise.calories} kcal/phút</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Add Custom Exercise Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color={colors.background} />
          <Text style={styles.addButtonText}>Thêm hoạt động tùy chỉnh</Text>
        </TouchableOpacity>

        {/* Today's Exercises */}
        {todayExercises.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hoạt động hôm nay</Text>
            {todayExercises.map((exercise) => (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseInfo}>
                    <Ionicons 
                      name={getExerciseIcon(exercise.type)} 
                      size={24} 
                      color={getExerciseColor(exercise.type)} 
                    />
                    <View style={styles.exerciseDetails}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <Text style={styles.exerciseType}>
                        {EXERCISE_TYPES.find(t => t.id === exercise.type)?.name}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteExercise(exercise.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
                <View style={styles.exerciseStats}>
                  <View style={styles.exerciseStat}>
                    <Text style={styles.exerciseStatValue}>{exercise.duration}</Text>
                    <Text style={styles.exerciseStatLabel}>phút</Text>
                  </View>
                  <View style={styles.exerciseStat}>
                    <Text style={styles.exerciseStatValue}>{exercise.caloriesBurned}</Text>
                    <Text style={styles.exerciseStatLabel}>kcal</Text>
                  </View>
                </View>
                {exercise.notes && (
                  <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm hoạt động</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              {/* Exercise Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên hoạt động</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ví dụ: Chạy bộ"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              {/* Exercise Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Loại hoạt động</Text>
                <View style={styles.typeSelector}>
                  {EXERCISE_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeButton,
                        formData.type === type.id && styles.typeButtonActive
                      ]}
                      onPress={() => setFormData({ ...formData, type: type.id as Exercise['type'] })}
                    >
                      <Ionicons 
                        name={type.icon as any} 
                        size={16} 
                        color={formData.type === type.id ? colors.background : type.color} 
                      />
                      <Text style={[
                        styles.typeButtonText,
                        formData.type === type.id && styles.typeButtonTextActive
                      ]}>
                        {type.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Duration and Calories */}
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Thời gian (phút)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="30"
                    value={formData.duration}
                    onChangeText={(text) => setFormData({ ...formData, duration: text.replace(/[^0-9]/g, '') })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Calo đốt</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="300"
                    value={formData.caloriesBurned}
                    onChangeText={(text) => setFormData({ ...formData, caloriesBurned: text.replace(/[^0-9]/g, '') })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ghi chú (tùy chọn)</Text>
                <TextInput
                  style={[styles.textInput, styles.notesInput]}
                  placeholder="Thêm ghi chú..."
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={saveExercise}>
              <Text style={styles.saveButtonText}>Lưu hoạt động</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  quickExerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickExerciseCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  quickExerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  quickExerciseCalories: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  addButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  exerciseCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseDetails: {
    marginLeft: 12,
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  exerciseType: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
  },
  exerciseStat: {
    alignItems: 'center',
  },
  exerciseStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  exerciseStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  exerciseNotes: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalForm: {
    padding: 20,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 6,
  },
  typeButtonTextActive: {
    color: colors.background,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    margin: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
