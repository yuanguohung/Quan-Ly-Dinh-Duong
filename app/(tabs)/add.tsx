import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FoodDatabase from '../components/FoodDatabase';
import { FoodItem } from '../data/vietnameseFoods';
import { colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
// import { useMealUpdate } from '@/contexts/MealContext';

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  category?: string;
}

const MEAL_CATEGORIES = [
  { id: 'breakfast', name: 'Bữa sáng', icon: 'sunny', color: colors.warning },
  { id: 'lunch', name: 'Bữa trưa', icon: 'partly-sunny', color: colors.primary },
  { id: 'dinner', name: 'Bữa tối', icon: 'moon', color: colors.info },
  { id: 'snack', name: 'Đồ ăn nhẹ', icon: 'fast-food', color: colors.secondary }
];

export default function AddMealScreen() {
  const { user } = useUser();
  const { colors } = useTheme();
  // const { triggerMealUpdate } = useMealUpdate();
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(MEAL_CATEGORIES[0]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFoodDatabase, setShowFoodDatabase] = useState(false);
  const router = useRouter();

  // Helper function to get user-specific storage keys
  const getUserStorageKey = (baseKey: string): string => {
    if (!user?.uid) {
      console.warn('No user UID available, using default key');
      return baseKey; // Fallback for users not logged in
    }
    return `${baseKey}_${user.uid}`;
  };

  // Helper function to get meals storage key for current user
  const getMealsStorageKey = (): string => {
    return getUserStorageKey('meals');
  };

  // Load lịch sử món ăn
  useEffect(() => {
    const loadMeals = async () => {
      try {
        console.log('Loading meals for user:', user?.uid || 'anonymous');
        const mealsKey = getMealsStorageKey();
        console.log('Using storage key:', mealsKey);
        const stored = await AsyncStorage.getItem(mealsKey);
        if (stored) {
          const parsedMeals = JSON.parse(stored);
          console.log('Loaded meals:', parsedMeals.length);
          setMeals(parsedMeals);
        } else {
          console.log('No meals found for this user');
          setMeals([]);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        setMeals([]);
      }
    };
    
    if (user) {
      loadMeals();
    } else {
      setMeals([]); // Clear meals if no user
    }
  }, [user?.uid]); // Re-run when user changes

  const saveMeal = async () => {
    if (!user) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để thêm món ăn');
      return;
    }

    if (!name.trim() || !calories.trim() || !protein.trim() || !carbs.trim() || !fat.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const caloriesNumber = parseInt(calories) || 0;
    const proteinNumber = parseInt(protein) || 0;
    const carbsNumber = parseInt(carbs) || 0;
    const fatNumber = parseInt(fat) || 0;

    if (caloriesNumber <= 0 || proteinNumber < 0 || carbsNumber < 0 || fatNumber < 0) {
      Alert.alert('Lỗi', 'Giá trị phải lớn hơn hoặc bằng 0');
      return;
    }

    setIsSubmitting(true);

    const newMeal: Meal = {
      id: Date.now().toString(),
      name: name.trim(),
      calories: caloriesNumber,
      protein: proteinNumber,
      carbs: carbsNumber,
      fat: fatNumber,
      date: new Date().toDateString(),
      category: selectedCategory.name
    };

    try {
      const mealsKey = getMealsStorageKey();
      const updatedMeals = [...meals, newMeal];
      console.log('Saving meal for user:', user.uid);
      console.log('Using storage key:', mealsKey);
      console.log('New meal:', newMeal);
      await AsyncStorage.setItem(mealsKey, JSON.stringify(updatedMeals));
      setMeals(updatedMeals);
      
      // Trigger meal update to notify other tabs
      // triggerMealUpdate();
      
      setName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      Alert.alert('Thành công', 'Đã thêm món ăn!');
    } catch (error) {
      console.error('Lỗi khi lưu:', error);
      Alert.alert('Lỗi', 'Không thể lưu món ăn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteMeal = async (id: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn chắc chắn muốn xóa món ăn này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              const mealsKey = getMealsStorageKey();
              const updatedMeals = meals.filter(meal => meal.id !== id);
              console.log('Deleting meal for user:', user?.uid);
              console.log('Using storage key:', mealsKey);
              await AsyncStorage.setItem(mealsKey, JSON.stringify(updatedMeals));
              setMeals(updatedMeals);
              
              // Trigger meal update to notify other tabs
              // triggerMealUpdate();
            } catch (error) {
              console.error('Lỗi khi xóa:', error);
            }
          }
        }      ]
    );
  };

  const handleSelectFromDatabase = (food: FoodItem) => {
    setName(food.name);
    setCalories(food.calories.toString());
    setProtein(food.protein.toString());
    setCarbs(food.carbs.toString());
    setFat(food.fat.toString());
    setShowFoodDatabase(false);
    
    // Show success message
    Alert.alert(
      'Đã thêm từ cơ sở dữ liệu',
      `"${food.name}" đã được thêm vào form. Bạn có thể chỉnh sửa thông tin trước khi lưu.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Thêm món ăn</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.databaseButton}
              onPress={() => setShowFoodDatabase(true)}
            >
              <Ionicons name="library" size={20} color={colors.primary} />
              <Text style={styles.databaseButtonText}>Cơ sở dữ liệu</Text>
            </TouchableOpacity>          </View>
        </View>

        {/* Form thêm món ăn */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Thêm món ăn mới</Text>
          
          <Text style={styles.label}>Tên món ăn</Text>
          <TextInput
            placeholder="Ví dụ: Phở bò"
            value={name}
            onChangeText={setName}
            style={styles.input}
            autoFocus
          />

          <View style={styles.macrosRow}>
            <View style={styles.macroInputContainer}>
              <Text style={styles.label}>Calo (kcal)</Text>
              <TextInput
                placeholder="450"
                value={calories}
                onChangeText={text => setCalories(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                style={styles.macroInput}
              />
            </View>
            
            <View style={styles.macroInputContainer}>
              <Text style={styles.label}>Protein (g)</Text>
              <TextInput
                placeholder="20"
                value={protein}
                onChangeText={text => setProtein(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                style={styles.macroInput}
              />
            </View>
          </View>

          <View style={styles.macrosRow}>
            <View style={styles.macroInputContainer}>
              <Text style={styles.label}>Carbs (g)</Text>
              <TextInput
                placeholder="30"
                value={carbs}
                onChangeText={text => setCarbs(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                style={styles.macroInput}
              />
            </View>
            
            <View style={styles.macroInputContainer}>
              <Text style={styles.label}>Fat (g)</Text>
              <TextInput
                placeholder="10"
                value={fat}
                onChangeText={text => setFat(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                style={styles.macroInput}
              />
            </View>
          </View>          <Text style={styles.label}>Bữa ăn</Text>
          <View style={styles.categoryContainer}>
            {MEAL_CATEGORIES.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.categoryButton,
                  selectedCategory.id === item.id && styles.selectedCategory
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Ionicons 
                  name={item.icon as keyof typeof Ionicons.glyphMap} 
                  size={18} 
                  color={selectedCategory.id === item.id ? colors.background : item.color} 
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory.id === item.id && styles.selectedCategoryText
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isSubmitting && styles.disabledButton]}
            onPress={saveMeal}
            disabled={isSubmitting}
          >
            <Ionicons name="save" size={20} color="white" />
            <Text style={styles.saveButtonText}>
              {isSubmitting ? 'Đang lưu...' : ' Lưu món ăn'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lịch sử món ăn */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Lịch sử món ăn ({meals.length})</Text>
            {meals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="fast-food-outline" size={50} color={colors.textLight} />
              <Text style={styles.emptyText}>Chưa có món ăn nào được thêm</Text>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={[...meals].reverse()}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.mealItem}>
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealName}>{item.name}</Text>                    <View style={styles.mealMacros}>
                      <Text style={[styles.macroText, {color: colors.calories}]}>{item.calories} kcal</Text>
                      <Text style={[styles.macroText, {color: colors.protein}]}>P: {item.protein}g</Text>
                      <Text style={[styles.macroText, {color: colors.carbs}]}>C: {item.carbs}g</Text>
                      <Text style={[styles.macroText, {color: colors.fat}]}>F: {item.fat}g</Text>
                    </View>
                    <View style={styles.mealDetails}>
                      <Text style={styles.mealCategory}>• {item.category}</Text>
                      <Text style={styles.mealDate}>{item.date}</Text>
                    </View>
                  </View>                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteMeal(item.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
      
      {/* Food Database Modal */}
      <FoodDatabase 
        visible={showFoodDatabase}
        onClose={() => setShowFoodDatabase(false)}
        onSelectFood={handleSelectFromDatabase}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: `0 2px 8px ${colors.text}1A`,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: colors.text,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.text,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  macroInputContainer: {
    width: '48%',
  },
  macroInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.text,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: colors.background,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: colors.primaryLight,
    opacity: 0.7,
  },
  saveButtonText: {
    color: colors.background,
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 16,
  },
  historySection: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 10,
    fontSize: 16,
  },  mealItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: `0 1px 3px ${colors.text}1A`,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text,
  },
  mealMacros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 12,
  },
  macroText: {
    fontSize: 14,
    fontWeight: '600',
  },
  mealDetails: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  mealCategory: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  mealDate: {
    color: colors.textSecondary,
    fontSize: 12,
  },  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  databaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  databaseButtonText: {
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
});