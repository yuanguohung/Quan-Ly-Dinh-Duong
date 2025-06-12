import React, { useState, useEffect } from 'react';
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
import { colors } from '@/constants/colors';

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
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dailyGoals, setDailyGoals] = useState<DailyGoals>({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [dailyData, setDailyData] = useState<DailyData[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    processDailyData();
  }, [meals, selectedPeriod]);

  const loadData = async () => {
    try {
      // Load meals
      const storedMeals = await AsyncStorage.getItem('meals');
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
          setMeals(validMeals);
        }
      }

      // Load goals
      const storedGoals = await AsyncStorage.getItem('dailyGoals');
      if (storedGoals) {
        const parsedGoals = JSON.parse(storedGoals);
        if (parsedGoals) {
          setDailyGoals({
            calories: safeNumber(parsedGoals.calories) || 2000,
            protein: safeNumber(parsedGoals.protein) || 150,
            carbs: safeNumber(parsedGoals.carbs) || 250,
            fat: safeNumber(parsedGoals.fat) || 65,
          });
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    }
  };

  const processDailyData = () => {
    const today = new Date();
    const daysToShow = selectedPeriod === 'week' ? 7 : 30;
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

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      <TouchableOpacity
        style={[styles.periodButton, selectedPeriod === 'week' && styles.activePeriodButton]}
        onPress={() => setSelectedPeriod('week')}
      >
        <Text style={[styles.periodText, selectedPeriod === 'week' && styles.activePeriodText]}>
          7 ngày
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.periodButton, selectedPeriod === 'month' && styles.activePeriodButton]}
        onPress={() => setSelectedPeriod('month')}
      >
        <Text style={[styles.periodText, selectedPeriod === 'month' && styles.activePeriodText]}>
          30 ngày
        </Text>
      </TouchableOpacity>
    </View>
  );

  const todayProgress = getTodayProgress();
  const macroDistribution = getMacroDistribution();
  const caloriesLineData = getCaloriesLineData();
  const proteinBarData = getProteinBarData();
  
  const weeklyCalories = dailyData.slice(-7).reduce((sum, day) => sum + safeNumber(day.calories), 0);
  const avgCalories = Math.round(weeklyCalories / 7);
  const weeklyProtein = dailyData.slice(-7).reduce((sum, day) => sum + safeNumber(day.protein), 0);
  const weeklyMeals = meals.filter(meal => {
    const mealDate = new Date(meal.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return mealDate >= weekAgo;
  }).length;

  if (meals.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bar-chart-outline" size={80} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>Chưa có dữ liệu thống kê</Text>
        <Text style={styles.emptyText}>
          Hãy thêm một số món ăn để xem biểu đồ thống kê dinh dưỡng của bạn
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thống kê dinh dưỡng</Text>
        <Text style={styles.headerSubtitle}>Theo dõi tiến độ của bạn</Text>
      </View>

      {/* Period Selector */}
      {renderPeriodSelector()}

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
      </View>

      {/* Weekly Summary */}
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
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});