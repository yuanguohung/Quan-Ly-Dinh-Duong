import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { LineChart, BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser, useUserProfile } from '@/contexts/UserContext';
// import { useMealUpdate } from '@/contexts/MealContext';
import { UserService } from '@/services/userService';

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

interface Exercise {
  id: string;
  name: string;
  duration: number;
  caloriesBurned: number;
  date: string;
  type: string;
  notes?: string;
}

interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DailyData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const screenWidth = Dimensions.get('window').width;

const CHART_CONFIG = {
  backgroundColor: colors.background,
  backgroundGradientFrom: colors.background,
  backgroundGradientTo: colors.background,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(76, 159, 56, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(45, 55, 72, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: colors.primary,
  },
};

// Hàm helper để đảm bảo giá trị số hợp lệ
const safeNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? 0 : Math.max(0, num);
};

// Hàm helper để tạo ngày trong tuần
const getWeekDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push({
      dateString: date.toDateString(),
      label: `${date.getDate()}/${date.getMonth() + 1}`
    });
  }
  
  return dates;
};

export default function ChartsScreen() {
  const { user } = useUser();
  const { userProfile } = useUserProfile();
  const { colors } = useTheme();
  // const { mealVersion } = useMealUpdate();
  const router = useRouter();

  // Helper functions để tạo storage keys riêng biệt cho từng user
  const getMealsStorageKey = () => {
    if (!user?.uid) return 'meals'; // fallback for safety
    return `meals_${user.uid}`;
  };

  const getGoalsStorageKey = () => {
    if (!user?.uid) return 'dailyGoals'; // fallback for safety
    return `dailyGoals_${user.uid}`;
  };
  
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dailyGoals, setDailyGoals] = useState<DailyGoals>({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65
  });
  // Removed selectedPeriod - always show 7 days
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Debug effect
  useEffect(() => {
    console.log('ChartsScreen - Component mounted');
    console.log('ChartsScreen - user:', user?.email);
    console.log('ChartsScreen - userProfile:', userProfile);
    console.log('ChartsScreen - meals count:', meals.length);
    console.log('ChartsScreen - dailyData count:', dailyData.length);
    console.log('ChartsScreen - loading:', loading);
    console.log('ChartsScreen - getMealsStorageKey:', getMealsStorageKey());
  }, [user, userProfile, meals, dailyData, loading, error]);

  // Auto-refresh data every time user focuses on this tab
  useFocusEffect(
    useCallback(() => {
      console.log('ChartsScreen - Tab focused, refreshing data');
      if (user?.uid) {
        loadData();
      } else {
        console.log('ChartsScreen - No user found, skipping load');
        setMeals([]);
        setLoading(false);
      }
    }, [user?.uid])
  );

  useEffect(() => {
    console.log('ChartsScreen - processDailyData called, meals:', meals.length);
    processDailyData();
  }, [meals]); // Removed selectedPeriod dependency

  // Load goals from Firebase when userProfile changes
  useEffect(() => {
    if (userProfile?.goals) {
      console.log('ChartsScreen - Loading goals from Firebase profile');
      setDailyGoals({
        calories: userProfile.goals.calories || 2000,
        protein: userProfile.goals.protein || 150,
        carbs: userProfile.goals.carbs || 250,
        fat: userProfile.goals.fat || 65,
      });
    }
  }, [userProfile]);

  // Listen for meal updates from other tabs
  // useEffect(() => {
  //   if (user?.uid && mealVersion > 0) {
  //     console.log('ChartsScreen - Meal update detected, version:', mealVersion);
  //     loadData();
  //   }
  // }, [mealVersion, user?.uid]);

  const loadData = async () => {
    try {
      console.log('ChartsScreen - Loading data...');
      setLoading(true);
      setError(null);

      if (!user?.uid) {
        console.log('ChartsScreen - No user UID, cannot load data');
        setMeals([]);
        setLoading(false);
        return;
      }

      const mealsKey = getMealsStorageKey();
      const goalsKey = getGoalsStorageKey();
      
      console.log('ChartsScreen - Loading meals with key:', mealsKey);
      
      // Load meals (user-specific)
      const storedMeals = await AsyncStorage.getItem(mealsKey);
      console.log('ChartsScreen - storedMeals:', storedMeals ? 'Found' : 'Not found');
      
      if (storedMeals) {
        const parsedMeals = JSON.parse(storedMeals);
        if (Array.isArray(parsedMeals)) {
          const validMeals = parsedMeals.filter(meal =>
            meal &&
            typeof meal.calories === 'number' &&
            typeof meal.protein === 'number' &&
            typeof meal.carbs === 'number' &&
            typeof meal.fat === 'number'
          );
          console.log('ChartsScreen - Valid meals loaded:', validMeals.length);
          setMeals(validMeals);
        }
      } else {
        console.log('ChartsScreen - No meals found for user');
        setMeals([]);
      }

      // Load goals (user-specific)
      const storedGoals = await AsyncStorage.getItem(goalsKey);
      console.log('ChartsScreen - storedGoals:', storedGoals ? 'Found' : 'Not found');
      
      if (storedGoals) {
        const parsedGoals = JSON.parse(storedGoals);
        if (parsedGoals) {
          setDailyGoals({
            calories: safeNumber(parsedGoals.calories) || 2000,
            protein: safeNumber(parsedGoals.protein) || 150,
            carbs: safeNumber(parsedGoals.carbs) || 250,
            fat: safeNumber(parsedGoals.fat) || 65,
          });
          console.log('ChartsScreen - Goals loaded:', parsedGoals);
        }
      }
    } catch (error) {
      console.error('ChartsScreen - Error loading data:', error);
      setError('Lỗi khi tải dữ liệu: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Helper để lấy storage key cho exercises
  const getExercisesStorageKey = () => {
    if (!user?.uid) return 'exercises';
    return `exercises_${user.uid}`;
  };

  // Load exercises từ AsyncStorage
  const loadExercises = async () => {
    try {
      if (!user?.uid) {
        setExercises([]);
        return;
      }
      const storageKey = getExercisesStorageKey();
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        setExercises(JSON.parse(stored));
      } else {
        setExercises([]);
      }
    } catch (error) {
      setExercises([]);
    }
  };

  // Auto-refresh exercises khi focus tab
  useFocusEffect(
    useCallback(() => {
      loadExercises();
    }, [user?.uid])
  );

  const processDailyData = () => {
    const today = new Date();
    const daysToShow = 7; // Always show 7 days
    const dailyTotals: { [key: string]: DailyData } = {};

    // Initialize data for the last N days
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();
      
      dailyTotals[dateString] = {
        date: dateString,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
    }

    // Aggregate meal data by date
    meals.forEach(meal => {
      if (dailyTotals[meal.date]) {
        dailyTotals[meal.date].calories += safeNumber(meal.calories);
        dailyTotals[meal.date].protein += safeNumber(meal.protein);
        dailyTotals[meal.date].carbs += safeNumber(meal.carbs);
        dailyTotals[meal.date].fat += safeNumber(meal.fat);
      }
    });

    // Aggregate exercise data by date
    exercises.forEach(exercise => {
      if (dailyTotals[exercise.date]) {
        dailyTotals[exercise.date].calories += safeNumber(exercise.caloriesBurned);
      }
    });

    setDailyData(Object.values(dailyTotals));
  };

  const getTodayProgress = () => {
    const today = new Date().toDateString();
    const todayMeals = meals.filter(meal => meal.date === today);
    
    const totals = {
      calories: todayMeals.reduce((sum, meal) => sum + safeNumber(meal.calories), 0),
      protein: todayMeals.reduce((sum, meal) => sum + safeNumber(meal.protein), 0),
      carbs: todayMeals.reduce((sum, meal) => sum + safeNumber(meal.carbs), 0),
      fat: todayMeals.reduce((sum, meal) => sum + safeNumber(meal.fat), 0),
    };

    return {
      calories: Math.min(totals.calories / dailyGoals.calories, 1),
      protein: Math.min(totals.protein / dailyGoals.protein, 1),
      carbs: Math.min(totals.carbs / dailyGoals.carbs, 1),
      fat: Math.min(totals.fat / dailyGoals.fat, 1),
    };
  };

  const getMacroDistribution = () => {
    const today = new Date().toDateString();
    const todayMeals = meals.filter(meal => meal.date === today);
    
    const totals = {
      protein: todayMeals.reduce((sum, meal) => sum + safeNumber(meal.protein) * 4, 0),
      carbs: todayMeals.reduce((sum, meal) => sum + safeNumber(meal.carbs) * 4, 0),
      fat: todayMeals.reduce((sum, meal) => sum + safeNumber(meal.fat) * 9, 0),
    };

    const totalCalories = totals.protein + totals.carbs + totals.fat;
    
    if (totalCalories === 0) {
      return [
        { name: 'Protein', population: 33, color: colors.protein, legendFontColor: colors.text },
        { name: 'Carbs', population: 34, color: colors.carbs, legendFontColor: colors.text },
        { name: 'Fat', population: 33, color: colors.fat, legendFontColor: colors.text },
      ];
    }

    return [
      {
        name: 'Protein',
        population: Math.round((totals.protein / totalCalories) * 100),
        color: colors.protein,
        legendFontColor: colors.text,
      },
      {
        name: 'Carbs',
        population: Math.round((totals.carbs / totalCalories) * 100),
        color: colors.carbs,
        legendFontColor: colors.text,
      },
      {
        name: 'Fat',
        population: Math.round((totals.fat / totalCalories) * 100),
        color: colors.fat,
        legendFontColor: colors.text,
      },
    ];
  };

  const getCaloriesLineData = () => {
    const weekDates = getWeekDates();
    const data = weekDates.map(({ dateString }) => {
      const dayData = dailyData.find(day => day.date === dateString);
      return dayData ? Math.round(safeNumber(dayData.calories)) : 0;
    });

    return {
      labels: weekDates.map(d => d.label),
      datasets: [
        {
          data: data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0],
          color: (opacity = 1) => colors.calories,
          strokeWidth: 3,
        },
      ],
    };
  };

  const getProteinBarData = () => {
    const weekDates = getWeekDates();
    const data = weekDates.map(({ dateString }) => {
      const dayData = dailyData.find(day => day.date === dateString);
      return dayData ? Math.round(safeNumber(dayData.protein)) : 0;
    });

    return {
      labels: weekDates.map(d => d.label),
      datasets: [
        {
          data: data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0],
        },
      ],
    };
  };

  const getCalorieBurnData = () => {
    if (!userProfile) return null;
    const bmr = UserService.calculateBMR(userProfile);
    const tdee = UserService.calculateTDEE(userProfile);
    const activityCalories = tdee - bmr;
    // Tính tổng caloriesBurned hôm nay từ exercises
    const today = new Date().toDateString();
    const todayExercises = exercises.filter(ex => ex.date === today);
    const exerciseCalories = todayExercises.reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0);
    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      activityCalories: Math.round(activityCalories),
      exerciseCalories: Math.round(exerciseCalories),
    };
  };

  const getCalorieBalance = () => {
    const today = new Date().toDateString();
    const todayMeals = meals.filter(meal => meal.date === today);
    const totalCalories = todayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    // Tổng caloriesBurned từ exercises
    const todayExercises = exercises.filter(ex => ex.date === today);
    const exerciseCalories = todayExercises.reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0);
    // Tổng tiêu hao: BMR + exerciseCalories
    const bmr = userProfile ? UserService.calculateBMR(userProfile) : 0;
    const burned = Math.round(bmr + exerciseCalories);
    const balance = totalCalories - burned;
    return {
      balance,
      consumed: totalCalories,
      burned,
      isDeficit: balance < 0,
      isSurplus: balance > 0,
    };
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      <View style={[styles.periodButton, styles.activePeriodButton]}>
        <Text style={[styles.periodText, styles.activePeriodText]}>
          7 ngày qua
        </Text>
      </View>
    </View>
  );

  const todayProgress = getTodayProgress();
  const macroDistribution = getMacroDistribution();
  const caloriesLineData = getCaloriesLineData();
  const proteinBarData = getProteinBarData();
  const calorieBurnData = getCalorieBurnData();
  const calorieBalance = getCalorieBalance();
    const weeklyCalories = dailyData.slice(-7).reduce((sum, day) => sum + safeNumber(day.calories), 0);
  const avgCalories = Math.round(weeklyCalories / 7);
  const weeklyProtein = dailyData.slice(-7).reduce((sum, day) => sum + safeNumber(day.protein), 0);
  const weeklyMeals = meals.filter(meal => {
    const mealDate = new Date(meal.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return mealDate >= weekAgo;
  }).length;

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="hourglass-outline" size={60} color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu thống kê...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={colors.error} />
        <Text style={styles.errorTitle}>Lỗi tải dữ liệu</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty state
  if (meals.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bar-chart-outline" size={80} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>Chưa có dữ liệu thống kê</Text>
        <Text style={styles.emptyText}>
          Hãy thêm một số món ăn để xem biểu đồ thống kê dinh dưỡng của bạn
        </Text>        <TouchableOpacity style={styles.addDataButton} onPress={() => {
          // Navigate to add meal screen
          router.push('/(tabs)/add');
        }}>
          <Text style={styles.addDataText}>Thêm món ăn đầu tiên</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thống kê dinh dưỡng</Text>
        <Text style={styles.headerSubtitle}>
          {userProfile ? 
            `${userProfile.displayName || user?.email} - ${userProfile.weight}kg, ${userProfile.height}cm` :
            'Theo dõi tiến độ của bạn'
          }
        </Text>
        
        {/* User Info Card */}
        {userProfile && (
          <View style={styles.userInfoCard}>
            <View style={styles.userInfoRow}>
              <View style={styles.userInfoItem}>
                <Ionicons name="person" size={16} color={colors.primary} />
                <Text style={styles.userInfoText}>{userProfile.gender === 'male' ? 'Nam' : userProfile.gender === 'female' ? 'Nữ' : 'Khác'}</Text>
              </View>
              <View style={styles.userInfoItem}>
                <Ionicons name="fitness" size={16} color={colors.primary} />
                <Text style={styles.userInfoText}>
                  {userProfile.activityLevel === 'sedentary' ? 'Ít vận động' :
                   userProfile.activityLevel === 'light' ? 'Nhẹ' :
                   userProfile.activityLevel === 'moderate' ? 'Vừa' :
                   userProfile.activityLevel === 'active' ? 'Nhiều' : 'Cao'}
                </Text>
              </View>
              <View style={styles.userInfoItem}>
                <Ionicons name="calculator" size={16} color={colors.primary} />
                <Text style={styles.userInfoText}>BMR: ~{Math.round(UserService.calculateBMR(userProfile))}</Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Debug Info */}
        <TouchableOpacity 
          style={styles.debugButton}
          onPress={() => {
            Alert.alert('Debug Charts', `
User: ${user?.email || 'Not logged in'}
Profile: ${userProfile ? 'Loaded' : 'Not loaded'}
Meals: ${meals.length}
Daily Data: ${dailyData.length}
Weekly Calories: ${weeklyCalories}
Weekly Meals: ${weeklyMeals}
Loading: ${loading}
Error: ${error || 'None'}
Goals from Profile: ${userProfile?.goals ? 'Yes' : 'No'}
            `);
          }}
        >
          <Text style={styles.debugButtonText}>Debug Info</Text>
        </TouchableOpacity>
      </View>      {/* Personalized Insights */}
      {userProfile && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={24} color={colors.warning} />
            <Text style={styles.sectionTitle}>Thông tin cá nhân hóa</Text>
          </View>
          
          <View style={styles.insightsContainer}>
            <View style={styles.insightItem}>
              <Ionicons name="speedometer" size={16} color={colors.primary} />
              <Text style={styles.insightText}>
                BMR: {Math.round(UserService.calculateBMR(userProfile))} kcal/ngày
              </Text>
            </View>
            
            <View style={styles.insightItem}>
              <Ionicons name="flame" size={16} color={colors.calories} />
              <Text style={styles.insightText}>
                TDEE: ~{Math.round(UserService.calculateTDEE(userProfile))} kcal/ngày
              </Text>
            </View>
              <View style={styles.insightItem}>
              <Ionicons name="flag" size={16} color={colors.success} />
              <Text style={styles.insightText}>
                Mục tiêu: {userProfile.goals?.type === 'lose' ? 'Giảm cân' : 
                          userProfile.goals?.type === 'gain' ? 'Tăng cân' : 'Duy trì'}
              </Text>
            </View>
            
            {userProfile.goals?.targetWeight && (
              <View style={styles.insightItem}>
                <Ionicons name="trending-up" size={16} color={colors.info} />
                <Text style={styles.insightText}>
                  Cân nặng mục tiêu: {userProfile.goals.targetWeight}kg
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Period Selector */}
      {renderPeriodSelector()}

      {/* Calorie Burn & Balance */}
      {calorieBurnData && calorieBalance && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flame" size={24} color={colors.calories} />
            <Text style={styles.sectionTitle}>Tiêu hao & Cân bằng calo</Text>
          </View>
          
          <View style={styles.calorieBurnContainer}>
            {/* Calorie Balance Overview */}
            <View style={styles.calorieBalanceCard}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceTitle}>Cân bằng calo hôm nay</Text>
                <View style={[
                  styles.balanceIndicator,
                  {
                    backgroundColor: calorieBalance.isDeficit ? colors.success + '20' : 
                                   calorieBalance.isSurplus ? colors.warning + '20' : colors.info + '20'
                  }
                ]}>
                  <Ionicons 
                    name={calorieBalance.isDeficit ? "trending-down" : 
                          calorieBalance.isSurplus ? "trending-up" : "remove"} 
                    size={16} 
                    color={calorieBalance.isDeficit ? colors.success : 
                           calorieBalance.isSurplus ? colors.warning : colors.info} 
                  />
                  <Text style={[
                    styles.balanceValue,
                    {
                      color: calorieBalance.isDeficit ? colors.success : 
                             calorieBalance.isSurplus ? colors.warning : colors.info
                    }
                  ]}>
                    {calorieBalance.balance > 0 ? '+' : ''}{calorieBalance.balance} kcal
                  </Text>
                </View>
              </View>
              
              <View style={styles.balanceDetails}>
                <View style={styles.balanceItem}>
                  <Ionicons name="restaurant" size={16} color={colors.primary} />
                  <Text style={styles.balanceLabel}>Tiêu thụ:</Text>
                  <Text style={styles.balanceNumber}>{calorieBalance.consumed} kcal</Text>
                </View>
                <View style={styles.balanceItem}>
                  <Ionicons name="flame" size={16} color={colors.calories} />
                  <Text style={styles.balanceLabel}>Tiêu hao:</Text>
                  <Text style={styles.balanceNumber}>{calorieBalance.burned} kcal</Text>
                </View>
              </View>
              
              {calorieBalance.isDeficit && (
                <Text style={styles.balanceNote}>
                  🎯 Bạn đang thiếu hụt calo - tốt cho giảm cân
                </Text>
              )}
              {calorieBalance.isSurplus && (
                <Text style={styles.balanceNote}>
                  ⚠️ Bạn đang thừa calo - có thể tăng cân
                </Text>
              )}
            </View>

            {/* Calorie Burn Breakdown */}
            <View style={styles.burnBreakdownGrid}>
              <View style={styles.burnCard}>
                <View style={styles.burnCardHeader}>
                  <Ionicons name="heart" size={20} color={colors.error} />
                  <Text style={styles.burnCardTitle}>BMR</Text>
                </View>
                <Text style={styles.burnCardValue}>{calorieBurnData.bmr}</Text>
                <Text style={styles.burnCardLabel}>kcal/ngày</Text>
                <Text style={styles.burnCardDesc}>Trao đổi chất cơ bản</Text>
              </View>
              
              <View style={styles.burnCard}>
                <View style={styles.burnCardHeader}>
                  <Ionicons name="walk" size={20} color={colors.info} />
                  <Text style={styles.burnCardTitle}>Hoạt động</Text>
                </View>
                <Text style={styles.burnCardValue}>{calorieBurnData.activityCalories}</Text>
                <Text style={styles.burnCardLabel}>kcal/ngày</Text>
                <Text style={styles.burnCardDesc}>Sinh hoạt hàng ngày</Text>
              </View>
              
              <View style={styles.burnCard}>
                <View style={styles.burnCardHeader}>
                  <Ionicons name="fitness" size={20} color={colors.success} />
                  <Text style={styles.burnCardTitle}>Tổng TDEE</Text>
                </View>
                <Text style={styles.burnCardValue}>{calorieBurnData.tdee}</Text>
                <Text style={styles.burnCardLabel}>kcal/ngày</Text>
                <Text style={styles.burnCardDesc}>Tổng tiêu hao</Text>
              </View>
            </View>

            {/* Tips based on calorie balance */}
            <View style={styles.calorieAdviceContainer}>
              <Text style={styles.adviceTitle}>💡 Gợi ý:</Text>
              {calorieBalance.isDeficit && Math.abs(calorieBalance.balance) > 500 && (
                <Text style={styles.adviceText}>
                  Thiếu hụt calo quá lớn có thể làm chậm trao đổi chất. Hãy ăn thêm một chút.
                </Text>
              )}
              {calorieBalance.isSurplus && calorieBalance.balance > 300 && (
                <Text style={styles.adviceText}>
                  Thừa calo có thể dẫn đến tăng cân. Hãy giảm khẩu phần hoặc tăng vận động.
                </Text>
              )}
              {Math.abs(calorieBalance.balance) <= 100 && (
                <Text style={styles.adviceText}>
                  Cân bằng calo tốt! Bạn đang duy trì cân nặng hiệu quả.
                </Text>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Today's Progress */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="today" size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Tiến độ hôm nay</Text>
        </View>
        <View style={styles.progressChartContainer}>
          <ProgressChart
            data={{
              labels: ['Calo', 'Protein', 'Carbs', 'Fat'],
              data: [
                safeNumber(todayProgress.calories),
                safeNumber(todayProgress.protein),
                safeNumber(todayProgress.carbs),
                safeNumber(todayProgress.fat)
              ],
            }}
            width={screenWidth - 40}
            height={220}
            strokeWidth={16}
            radius={32}
            chartConfig={{
              backgroundColor: colors.background,
              backgroundGradientFrom: colors.background,
              backgroundGradientTo: colors.background,
              decimalPlaces: 1,
              color: (opacity = 1, index) => {
                const chartColors = [colors.calories, colors.protein, colors.carbs, colors.fat];
                return chartColors[index ?? 0] || colors.primary;
              },
              labelColor: (opacity = 1) => colors.text,
            }}
            hideLegend={false}
          />
        </View>
      </View>

      {/* Macro Distribution */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="pie-chart" size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Phân bố macro hôm nay</Text>
        </View>
        <View style={styles.pieChartContainer}>
          <PieChart
            data={macroDistribution}
            width={screenWidth - 40}
            height={220}
            chartConfig={CHART_CONFIG}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 10]}
            absolute
          />
        </View>
      </View>

      {/* Calories Trend */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trending-up" size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Xu hướng calories (7 ngày)</Text>
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={caloriesLineData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              ...CHART_CONFIG,
              color: (opacity = 1) => colors.calories,
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      {/* Protein Tracking */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="barbell" size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Protein (7 ngày)</Text>
        </View>
        <View style={styles.chartContainer}>
          <BarChart
            data={proteinBarData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              ...CHART_CONFIG,
              fillShadowGradient: colors.protein,
              fillShadowGradientOpacity: 0.8,
            }}
            style={styles.chart}
            showValuesOnTopOfBars
            yAxisLabel=""
            yAxisSuffix="g"
          />
        </View>
      </View>      {/* Weekly Summary */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={24} color={colors.primary} />
          <Text style={styles.sectionTitle}>Tóm tắt tuần này</Text>
        </View>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {weeklyCalories.toLocaleString()}
            </Text>
            <Text style={styles.summaryLabel}>Tổng calories</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {avgCalories.toLocaleString()}
            </Text>
            <Text style={styles.summaryLabel}>TB/ngày</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {Math.round(weeklyProtein)}g
            </Text>
            <Text style={styles.summaryLabel}>Tổng protein</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {weeklyMeals}
            </Text>
            <Text style={styles.summaryLabel}>Món ăn</Text>
          </View>
        </View>
        
        {/* Progress vs Goals */}
        {userProfile && (
          <View style={styles.goalComparisonContainer}>
            <Text style={styles.goalComparisonTitle}>So sánh với mục tiêu</Text>
            
            <View style={styles.goalComparisonItem}>
              <Text style={styles.goalComparisonLabel}>Calories trung bình:</Text>
              <Text style={[
                styles.goalComparisonValue,
                { color: avgCalories > dailyGoals.calories ? colors.warning : colors.success }
              ]}>
                {avgCalories} / {dailyGoals.calories} kcal
              </Text>
            </View>
            
            <View style={styles.goalComparisonItem}>
              <Text style={styles.goalComparisonLabel}>Protein trung bình:</Text>
              <Text style={[
                styles.goalComparisonValue,
                { color: Math.round(weeklyProtein/7) > dailyGoals.protein ? colors.success : colors.warning }
              ]}>
                {Math.round(weeklyProtein/7)} / {dailyGoals.protein} g
              </Text>
            </View>
            
            {avgCalories < dailyGoals.calories * 0.8 && (
              <View style={styles.warningMessage}>
                <Ionicons name="warning" size={16} color={colors.warning} />
                <Text style={styles.warningText}>
                  Bạn đang ăn ít hơn mức khuyến nghị. Hãy thêm món ăn!
                </Text>
              </View>
            )}
            
            {avgCalories > dailyGoals.calories * 1.2 && (
              <View style={styles.warningMessage}>
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={styles.warningText}>
                  Bạn đang ăn nhiều hơn mục tiêu. Cân nhắc điều chỉnh!
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    margin: 20,
    padding: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activePeriodButton: {
    backgroundColor: colors.primary,
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activePeriodText: {
    color: colors.background,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 10,
  },
  progressChartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  pieChartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  chart: {
    borderRadius: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.error,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  addDataButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },  addDataText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    width: '100%',
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  userInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  userInfoText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 4,
    fontWeight: '500',
  },
  debugButton: {
    backgroundColor: colors.warning,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },  debugButtonText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  insightsContainer: {
    marginTop: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    marginBottom: 6,
  },  insightText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  goalComparisonContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
  },
  goalComparisonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  goalComparisonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  goalComparisonLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  goalComparisonValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  warningMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    backgroundColor: colors.warning + '20',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  warningText: {
    fontSize: 13,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  // Calorie burn styles
  calorieBurnContainer: {
    marginTop: 8,
  },
  calorieBalanceCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  balanceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    marginRight: 4,
  },
  balanceNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  balanceNote: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  burnBreakdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  burnCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  burnCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  burnCardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 4,
  },
  burnCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 2,
  },
  burnCardLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  burnCardDesc: {
    fontSize: 10,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 12,
  },
  calorieAdviceContainer: {
    backgroundColor: colors.info + '10',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
  },
  adviceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  adviceText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 16,
  },
});