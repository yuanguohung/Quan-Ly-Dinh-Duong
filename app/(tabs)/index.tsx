// app/(tabs)/index.tsx
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, TextInput, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import NutritionCard from '@/components/NutritionCard';
import ProgressBar, { ProgressRing } from '@/components/ProgressRing';

const { width: screenWidth } = Dimensions.get('window');

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

interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number; // in ml
}

interface WaterEntry {
  id: string;
  amount: number; // in ml
  date: string;
  time: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFat, setTotalFat] = useState(0);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [totalWater, setTotalWater] = useState(0); // in ml
  const [todayWaterEntries, setTodayWaterEntries] = useState<WaterEntry[]>([]);
  const [isWaterModalVisible, setIsWaterModalVisible] = useState(false);
  const [customWaterAmount, setCustomWaterAmount] = useState('');
  const [dailyGoals, setDailyGoals] = useState<DailyGoals>({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
    water: 2000 // 2 liters default
  });

  const calculateDailyMacros = (meals: Meal[], date: string) => {
    const todayMeals = meals.filter(meal => meal.date === date);
    return {
      calories: todayMeals.reduce((sum, meal) => sum + meal.calories, 0),
      protein: todayMeals.reduce((sum, meal) => sum + meal.protein, 0),
      carbs: todayMeals.reduce((sum, meal) => sum + meal.carbs, 0),
      fat: todayMeals.reduce((sum, meal) => sum + meal.fat, 0),
    };
  };
  const fetchMeals = async () => {
    try {
      const saved = await AsyncStorage.getItem('meals');
      const meals: Meal[] = saved ? JSON.parse(saved) : [];
      const today = new Date().toDateString();

      const todayItems = meals.filter(meal => meal.date === today);
      setTodayMeals(todayItems);

      const { calories, protein, carbs, fat } = calculateDailyMacros(meals, today);
      setTotalCalories(calories);
      setTotalProtein(protein);
      setTotalCarbs(carbs);
      setTotalFat(fat);
    } catch (error) {
      console.error('Lỗi khi đọc dữ liệu:', error);
      setTotalCalories(0);
      setTotalProtein(0);
      setTotalCarbs(0);
      setTotalFat(0);
    }
  };
  const loadGoals = async () => {
    try {
      const storedGoals = await AsyncStorage.getItem('dailyGoals');
      if (storedGoals) {
        const goals = JSON.parse(storedGoals);
        setDailyGoals({
          calories: parseInt(goals.calories) || 2000,
          protein: parseInt(goals.protein) || 150,
          carbs: parseInt(goals.carbs) || 250,
          fat: parseInt(goals.fat) || 65,
          water: parseInt(goals.water) || 2000,
        });
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };
  const deleteMeal = async (id: string) => {
    try {
      const saved = await AsyncStorage.getItem('meals');
      const meals: Meal[] = saved ? JSON.parse(saved) : [];
      const updatedMeals = meals.filter(meal => meal.id !== id);

      await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals));
      fetchMeals(); // Refresh data
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
    }
  };

  const fetchWaterIntake = async () => {
    try {
      const saved = await AsyncStorage.getItem('waterEntries');
      const entries: WaterEntry[] = saved ? JSON.parse(saved) : [];
      const today = new Date().toDateString();

      const todayEntries = entries.filter(entry => entry.date === today);
      setTodayWaterEntries(todayEntries);
      
      const total = todayEntries.reduce((sum, entry) => sum + entry.amount, 0);
      setTotalWater(total);
    } catch (error) {
      console.error('Lỗi khi đọc dữ liệu nước:', error);
      setTotalWater(0);
      setTodayWaterEntries([]);
    }
  };

  const addWater = async (amount: number) => {
    try {
      const saved = await AsyncStorage.getItem('waterEntries');
      const entries: WaterEntry[] = saved ? JSON.parse(saved) : [];
      
      const newEntry: WaterEntry = {
        id: Date.now().toString(),
        amount,
        date: new Date().toDateString(),
        time: new Date().toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };

      const updatedEntries = [...entries, newEntry];
      await AsyncStorage.setItem('waterEntries', JSON.stringify(updatedEntries));
      fetchWaterIntake();
    } catch (error) {
      console.error('Lỗi khi thêm nước:', error);
    }
  };

  const deleteWaterEntry = async (id: string) => {
    try {
      const saved = await AsyncStorage.getItem('waterEntries');
      const entries: WaterEntry[] = saved ? JSON.parse(saved) : [];
      const updatedEntries = entries.filter(entry => entry.id !== id);

      await AsyncStorage.setItem('waterEntries', JSON.stringify(updatedEntries));
      fetchWaterIntake();
    } catch (error) {
      console.error('Lỗi khi xóa nước:', error);
    }
  };  useEffect(() => {
    if (isFocused) {
      loadGoals();
      fetchMeals();
      fetchWaterIntake();
    }
  }, [isFocused]);

  const progressPercentage = Math.min((totalCalories / dailyGoals.calories) * 100, 100);
  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.greetingSection}>
              <Text style={styles.greetingText}>Xin chào!</Text>
              <Text style={styles.dateText}>{getCurrentDate()}</Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/add')}
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Enhanced Main Calories Ring */}
      <View style={styles.caloriesSection}>
        <View style={styles.caloriesCard}>
          <ProgressRing
            progress={totalCalories / dailyGoals.calories}
            size={180}
            color={colors.calories}
            value={`${totalCalories}`}
            label="kcal"
          />
          <View style={styles.caloriesInfo}>
            <Text style={styles.caloriesRemaining}>
              {Math.max(dailyGoals.calories - totalCalories, 0)} còn lại
            </Text>
            <Text style={styles.caloriesGoal}>
              Mục tiêu: {dailyGoals.calories} kcal
            </Text>
          </View>        </View>
      </View>

      {/* Enhanced Nutrition Overview */}
      <View style={styles.nutritionOverview}>
        <View style={styles.overviewHeader}>
          <Text style={styles.overviewTitle}>Tổng quan dinh dưỡng</Text>
          <View style={styles.progressIndicator}>
            <Text style={styles.progressText}>
              {Math.round((totalCalories / dailyGoals.calories) * 100)}%
            </Text>
          </View>
        </View>
        
        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalProtein}g</Text>
            <Text style={styles.statLabel}>Protein</Text>
            <View style={[styles.statBar, { backgroundColor: colors.protein + '20' }]}>
              <View 
                style={[
                  styles.statBarFill, 
                  { 
                    backgroundColor: colors.protein,
                    width: `${Math.min((totalProtein / dailyGoals.protein) * 100, 100)}%`
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCarbs}g</Text>
            <Text style={styles.statLabel}>Carbs</Text>
            <View style={[styles.statBar, { backgroundColor: colors.carbs + '20' }]}>
              <View 
                style={[
                  styles.statBarFill, 
                  { 
                    backgroundColor: colors.carbs,
                    width: `${Math.min((totalCarbs / dailyGoals.carbs) * 100, 100)}%`
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalFat}g</Text>
            <Text style={styles.statLabel}>Fats</Text>
            <View style={[styles.statBar, { backgroundColor: colors.fat + '20' }]}>
              <View 
                style={[
                  styles.statBarFill, 
                  { 
                    backgroundColor: colors.fat,
                    width: `${Math.min((totalFat / dailyGoals.fat) * 100, 100)}%`
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(totalWater / 1000).toFixed(1)}L</Text>
            <Text style={styles.statLabel}>Nước</Text>
            <View style={[styles.statBar, { backgroundColor: colors.info + '20' }]}>
              <View 
                style={[
                  styles.statBarFill, 
                  { 
                    backgroundColor: colors.info,
                    width: `${Math.min((totalWater / dailyGoals.water) * 100, 100)}%`
                  }
                ]} 
              />
            </View>
          </View>
        </View>
      </View>

      {/* Enhanced Nutrition Cards Grid */}
      <View style={styles.nutritionGrid}>
        <View style={styles.gridHeader}>
          <Text style={styles.gridTitle}>Chi tiết dinh dưỡng</Text>
          <TouchableOpacity style={styles.expandButton}>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.nutritionRow}>
          <View style={styles.enhancedNutritionCard}>
            <LinearGradient
              colors={[colors.protein + '15', colors.protein + '05']}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="fitness" size={20} color={colors.protein} />
                <Text style={styles.cardTitle}>Protein</Text>
              </View>
              <Text style={[styles.cardValue, { color: colors.protein }]}>
                {totalProtein}g
              </Text>
              <Text style={styles.cardTarget}>/ {dailyGoals.protein}g</Text>
              <View style={styles.cardProgress}>
                <View 
                  style={[
                    styles.cardProgressFill, 
                    { 
                      backgroundColor: colors.protein,
                      width: `${Math.min((totalProtein / dailyGoals.protein) * 100, 100)}%`
                    }
                  ]} 
                />
              </View>
            </LinearGradient>
          </View>
          
          <View style={styles.enhancedNutritionCard}>
            <LinearGradient
              colors={[colors.carbs + '15', colors.carbs + '05']}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="leaf" size={20} color={colors.carbs} />
                <Text style={styles.cardTitle}>Carbs</Text>
              </View>
              <Text style={[styles.cardValue, { color: colors.carbs }]}>
                {totalCarbs}g
              </Text>
              <Text style={styles.cardTarget}>/ {dailyGoals.carbs}g</Text>
              <View style={styles.cardProgress}>
                <View 
                  style={[
                    styles.cardProgressFill, 
                    { 
                      backgroundColor: colors.carbs,
                      width: `${Math.min((totalCarbs / dailyGoals.carbs) * 100, 100)}%`
                    }
                  ]} 
                />
              </View>
            </LinearGradient>
          </View>
        </View>
        
        <View style={styles.nutritionRow}>
          <View style={styles.enhancedNutritionCard}>
            <LinearGradient
              colors={[colors.fat + '15', colors.fat + '05']}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="flame" size={20} color={colors.fat} />
                <Text style={styles.cardTitle}>Fats</Text>
              </View>
              <Text style={[styles.cardValue, { color: colors.fat }]}>
                {totalFat}g
              </Text>
              <Text style={styles.cardTarget}>/ {dailyGoals.fat}g</Text>
              <View style={styles.cardProgress}>
                <View 
                  style={[
                    styles.cardProgressFill, 
                    { 
                      backgroundColor: colors.fat,
                      width: `${Math.min((totalFat / dailyGoals.fat) * 100, 100)}%`
                    }
                  ]} 
                />
              </View>
            </LinearGradient>
          </View>
          
          <TouchableOpacity 
            style={styles.enhancedNutritionCard}
            onPress={() => setIsWaterModalVisible(true)}
          >
            <LinearGradient
              colors={[colors.info + '15', colors.info + '05']}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="water" size={20} color={colors.info} />
                <Text style={styles.cardTitle}>Nước uống</Text>
              </View>
              <Text style={[styles.cardValue, { color: colors.info }]}>
                {totalWater}ml
              </Text>
              <Text style={styles.cardTarget}>/ {dailyGoals.water}ml</Text>
              <View style={styles.cardProgress}>
                <View 
                  style={[
                    styles.cardProgressFill, 
                    { 
                      backgroundColor: colors.info,
                      width: `${Math.min((totalWater / dailyGoals.water) * 100, 100)}%`
                    }
                  ]} 
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>        </View>
      </View>

      {/* Enhanced Today's Meals Section */}
      <View style={styles.mealsSection}>
        <View style={styles.enhancedSectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="restaurant" size={24} color={colors.primary} />
            <Text style={styles.enhancedSectionTitle}>Hôm nay đã ăn</Text>
          </View>
          <View style={styles.mealCountBadge}>
            <Text style={styles.mealCountText}>{todayMeals.length}</Text>
          </View>
        </View>

        {todayMeals.length === 0 ? (
          <View style={styles.enhancedEmptyState}>
            <LinearGradient
              colors={[colors.backgroundSecondary, colors.card]}
              style={styles.emptyStateGradient}
            >
              <Ionicons name="restaurant-outline" size={64} color={colors.textLight} />
              <Text style={styles.emptyTitle}>Chưa có món ăn nào</Text>
              <Text style={styles.emptySubtitle}>Nhấn nút + để thêm món ăn đầu tiên</Text>
              <TouchableOpacity 
                style={styles.emptyActionButton}
                onPress={() => router.push('/add')}
              >
                <Ionicons name="add" size={20} color={colors.card} />
                <Text style={styles.emptyActionText}>Thêm món ăn</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : (
          todayMeals.map((meal, index) => (
            <View key={meal.id} style={[styles.enhancedMealCard, { marginBottom: index === todayMeals.length - 1 ? 30 : 16 }]}>
              <LinearGradient
                colors={[colors.card, colors.backgroundSecondary + '50']}
                style={styles.mealCardGradient}
              >
                <View style={styles.mealHeader}>
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    {meal.category && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.mealCategory}>{meal.category}</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.enhancedDeleteButton}
                    onPress={() => {
                      Alert.alert(
                        'Xóa món ăn',
                        `Bạn có chắc muốn xóa "${meal.name}"?`,
                        [
                          { text: 'Hủy', style: 'cancel' },
                          { text: 'Xóa', style: 'destructive', onPress: () => deleteMeal(meal.id) }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.enhancedMealNutrition}>
                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionPair}>
                      <View style={styles.enhancedNutritionItem}>
                        <View style={[styles.nutritionIcon, { backgroundColor: colors.calories + '15' }]}>
                          <Ionicons name="flash" size={16} color={colors.calories} />
                        </View>
                        <View style={styles.nutritionDetails}>
                          <Text style={[styles.nutritionValue, { color: colors.calories }]}>
                            {meal.calories}
                          </Text>
                          <Text style={styles.nutritionLabel}>kcal</Text>
                        </View>
                      </View>
                      
                      <View style={styles.enhancedNutritionItem}>
                        <View style={[styles.nutritionIcon, { backgroundColor: colors.protein + '15' }]}>
                          <Ionicons name="fitness" size={16} color={colors.protein} />
                        </View>
                        <View style={styles.nutritionDetails}>
                          <Text style={[styles.nutritionValue, { color: colors.protein }]}>
                            {meal.protein}g
                          </Text>
                          <Text style={styles.nutritionLabel}>Protein</Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.nutritionPair}>
                      <View style={styles.enhancedNutritionItem}>
                        <View style={[styles.nutritionIcon, { backgroundColor: colors.carbs + '15' }]}>
                          <Ionicons name="leaf" size={16} color={colors.carbs} />
                        </View>
                        <View style={styles.nutritionDetails}>
                          <Text style={[styles.nutritionValue, { color: colors.carbs }]}>
                            {meal.carbs}g
                          </Text>
                          <Text style={styles.nutritionLabel}>Carbs</Text>
                        </View>
                      </View>
                      
                      <View style={styles.enhancedNutritionItem}>
                        <View style={[styles.nutritionIcon, { backgroundColor: colors.fat + '15' }]}>
                          <Ionicons name="flame" size={16} color={colors.fat} />
                        </View>
                        <View style={styles.nutritionDetails}>
                          <Text style={[styles.nutritionValue, { color: colors.fat }]}>
                            {meal.fat}g
                          </Text>
                          <Text style={styles.nutritionLabel}>Fats</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          ))
        )}
      </View>

      {/* Water Tracking Modal */}
      <Modal
        visible={isWaterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsWaterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm nước uống</Text>
              <TouchableOpacity 
                onPress={() => setIsWaterModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Quick Add Buttons */}
            <View style={styles.quickAddSection}>
              <Text style={styles.sectionLabel}>Thêm nhanh</Text>
              <View style={styles.quickAddGrid}>
                {[250, 500, 750, 1000].map(amount => (
                  <TouchableOpacity
                    key={amount}
                    style={styles.quickAddButton}
                    onPress={() => {
                      addWater(amount);
                      setIsWaterModalVisible(false);
                    }}
                  >
                    <Ionicons name="water" size={20} color={colors.info} />
                    <Text style={styles.quickAddText}>{amount}ml</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Custom Amount */}
            <View style={styles.customSection}>
              <Text style={styles.sectionLabel}>Số lượng tùy chỉnh</Text>
              <View style={styles.customInputRow}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Nhập ml"
                  value={customWaterAmount}
                  onChangeText={setCustomWaterAmount}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
                <TouchableOpacity
                  style={[styles.addCustomButton, !customWaterAmount && styles.addCustomButtonDisabled]}
                  disabled={!customWaterAmount}
                  onPress={() => {
                    const amount = parseInt(customWaterAmount);
                    if (amount > 0) {
                      addWater(amount);
                      setCustomWaterAmount('');
                      setIsWaterModalVisible(false);
                    }
                  }}
                >
                  <Text style={[styles.addCustomText, !customWaterAmount && styles.addCustomTextDisabled]}>
                    Thêm
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Today's Water History */}
            {todayWaterEntries.length > 0 && (
              <View style={styles.historySection}>
                <Text style={styles.sectionLabel}>Hôm nay đã uống</Text>
                <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
                  {todayWaterEntries.slice(-5).reverse().map(entry => (
                    <View key={entry.id} style={styles.historyItem}>
                      <View style={styles.historyInfo}>
                        <Ionicons name="water" size={16} color={colors.info} />
                        <Text style={styles.historyAmount}>{entry.amount}ml</Text>
                        <Text style={styles.historyTime}>{entry.time}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => deleteWaterEntry(entry.id)}
                        style={styles.deleteHistoryButton}
                      >
                        <Ionicons name="trash-outline" size={16} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  // Enhanced Header Styles
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  greetingSection: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.card,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.cardSecondary,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  // Enhanced Calories Section
  caloriesSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    marginTop: -10,
  },
  caloriesCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },  caloriesInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  caloriesRemaining: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  caloriesGoal: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  // Enhanced Nutrition Overview Styles
  nutritionOverview: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  progressIndicator: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  statBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  // Enhanced Grid Styles
  nutritionGrid: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  gridTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  expandButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
  },
  nutritionRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  enhancedNutritionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  cardGradient: {
    padding: 16,
    height: 140,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
  },
  cardTarget: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardProgress: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  cardProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  nutritionCard: {
    flex: 1,
  },  waterCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    height: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  waterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  waterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.info,
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  waterProgress: {
    marginBottom: 12,
  },
  waterStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  waterAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.info,
  },
  waterGoal: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  waterSubtext: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
  },
  quickAddSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAddButton: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  quickAddText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.info,
    marginTop: 6,
  },
  customSection: {
    marginBottom: 24,
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  customInput: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
  },
  addCustomButton: {
    backgroundColor: colors.info,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCustomButtonDisabled: {
    backgroundColor: colors.border,
  },
  addCustomText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  addCustomTextDisabled: {
    color: colors.textLight,
  },
  historySection: {
    marginBottom: 20,
  },
  historyList: {
    maxHeight: 150,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  historyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.info,
    marginLeft: 8,
    marginRight: 12,
  },
  historyTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  deleteHistoryButton: {
    padding: 4,
  },
  mealsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  mealCount: {
    fontSize: 14,
    color: colors.textSecondary,
    backgroundColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
  mealCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  mealCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
  },
  mealNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },  nutritionLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  // Enhanced Meals Section Styles
  enhancedSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enhancedSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 12,
  },
  mealCountBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  mealCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  enhancedEmptyState: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  emptyStateGradient: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 16,
  },
  emptyActionText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  enhancedMealCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  mealCardGradient: {
    padding: 20,
  },
  mealInfo: {
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  enhancedDeleteButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.error + '10',
  },
  enhancedMealNutrition: {
    marginTop: 16,
  },
  nutritionPair: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  enhancedNutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  nutritionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  nutritionDetails: {
    flex: 1,
  },
});