// AI Nutrition Intelligence Service
// Core AI engine for personalized nutrition recommendations

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodItem, VIETNAMESE_FOODS } from '@/data/vietnameseFoods';

// Types for AI Analysis
export interface NutrientDeficiency {
  nutrient: string;
  currentIntake: number;
  recommendedIntake: number;
  deficiencyLevel: 'mild' | 'moderate' | 'severe';
  healthImpact: string;
  recommendations: string[];
}

export interface HealthPrediction {
  metric: string;
  currentTrend: 'improving' | 'stable' | 'declining';
  predictedValue: number;
  timeframe: string;
  confidence: number;
  recommendations: string[];
}

export interface MealRecommendation {
  food: FoodItem;
  priority: number;
  reason: string;
  nutritionalBenefit: string;
  compatibilityScore: number;
}

export interface UserProfile {
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  activityLevel: string;
  healthConditions: string[];
  preferences: string[];
  allergies: string[];
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  category?: string;
}

export interface HealthData {
  date: string;
  weight?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  bloodSugar?: number;
  exerciseMinutes?: number;
  sleepHours?: number;
  stressLevel?: number;
  mood?: number;
}

class NutritionAI {
  private static instance: NutritionAI;
  private userProfile: UserProfile | null = null;
  private mealHistory: Meal[] = [];
  private healthData: HealthData[] = [];

  static getInstance(): NutritionAI {
    if (!NutritionAI.instance) {
      NutritionAI.instance = new NutritionAI();
    }
    return NutritionAI.instance;
  }

  // Initialize AI with user data
  async initialize() {
    await this.loadUserData();
    await this.loadMealHistory();
    await this.loadHealthData();
  }

  // Load user profile for personalization
  private async loadUserData() {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      if (profile) {
        this.userProfile = JSON.parse(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  // Load meal history for analysis
  private async loadMealHistory() {
    try {
      const meals = await AsyncStorage.getItem('meals');
      if (meals) {
        this.mealHistory = JSON.parse(meals);
      }
    } catch (error) {
      console.error('Error loading meal history:', error);
    }
  }

  // Load health data for correlation analysis
  private async loadHealthData() {
    try {
      const health = await AsyncStorage.getItem('healthData');
      if (health) {
        this.healthData = JSON.parse(health);
      }
    } catch (error) {
      console.error('Error loading health data:', error);
    }
  }

  // Core AI Method: Analyze nutritional deficiencies
  analyzeDeficiencies(timeframe: number = 7): NutrientDeficiency[] {
    const recentMeals = this.getRecentMeals(timeframe);
    const averageIntake = this.calculateAverageIntake(recentMeals);
    const recommendations = this.getRecommendedIntake();
    
    const deficiencies: NutrientDeficiency[] = [];

    // Analyze major nutrients
    const nutrients = [
      { key: 'protein', name: 'Protein', unit: 'g' },
      { key: 'fiber', name: 'Chất xơ', unit: 'g' },
      { key: 'iron', name: 'Sắt', unit: 'mg' },
      { key: 'calcium', name: 'Canxi', unit: 'mg' },
      { key: 'vitaminC', name: 'Vitamin C', unit: 'mg' },
    ];

    nutrients.forEach(nutrient => {
      const current = averageIntake[nutrient.key] || 0;
      const recommended = recommendations[nutrient.key] || 0;
      
      if (current < recommended * 0.8) { // Less than 80% of recommended
        const deficiencyLevel = this.calculateDeficiencyLevel(current, recommended);
        
        deficiencies.push({
          nutrient: nutrient.name,
          currentIntake: current,
          recommendedIntake: recommended,
          deficiencyLevel,
          healthImpact: this.getHealthImpact(nutrient.key, deficiencyLevel),
          recommendations: this.getNutrientRecommendations(nutrient.key)
        });
      }
    });

    return deficiencies.sort((a, b) => {
      const severityOrder = { severe: 3, moderate: 2, mild: 1 };
      return severityOrder[b.deficiencyLevel] - severityOrder[a.deficiencyLevel];
    });
  }

  // AI Method: Recommend meals based on deficiencies
  recommendMeals(deficiencies: NutrientDeficiency[]): MealRecommendation[] {
    if (deficiencies.length === 0) {
      return this.getGeneralRecommendations();
    }

    const recommendations: MealRecommendation[] = [];
    const targetNutrients = deficiencies.map(d => this.mapNutrientToKey(d.nutrient));

    VIETNAMESE_FOODS.forEach(food => {
      let score = 0;
      let reasons: string[] = [];
      let benefits: string[] = [];

      // Score based on nutrient content
      targetNutrients.forEach(nutrient => {
        const content = (food as any)[nutrient];
        if (content && content > 0) {
          const deficiency = deficiencies.find(d => this.mapNutrientToKey(d.nutrient) === nutrient);
          if (deficiency) {
            const contribution = (content / deficiency.recommendedIntake) * 100;
            if (contribution > 10) { // Provides at least 10% of daily needs
              score += contribution * this.getSeverityMultiplier(deficiency.deficiencyLevel);
              reasons.push(`Giàu ${deficiency.nutrient.toLowerCase()}`);
              benefits.push(`Cung cấp ${Math.round(contribution)}% nhu cầu ${deficiency.nutrient.toLowerCase()} hàng ngày`);
            }
          }
        }
      });

      // Bonus for popular Vietnamese foods
      if (food.isPopular) {
        score *= 1.2;
        reasons.push('Món ăn phổ biến');
      }

      // Bonus for ease of preparation
      if (food.difficulty === 'Dễ') {
        score *= 1.1;
        reasons.push('Dễ chế biến');
      }

      // Consider user preferences and health conditions
      if (this.userProfile) {
        score *= this.getCompatibilityScore(food);
      }

      if (score > 0) {
        recommendations.push({
          food,
          priority: Math.round(score),
          reason: reasons.join(', '),
          nutritionalBenefit: benefits.join('. '),
          compatibilityScore: this.getCompatibilityScore(food)
        });
      }
    });

    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10); // Top 10 recommendations
  }

  // AI Method: Predict health trends
  predictHealthTrends(timeframe: number = 30): HealthPrediction[] {
    const predictions: HealthPrediction[] = [];
    
    // Weight trend prediction
    const weightTrend = this.analyzeWeightTrend();
    if (weightTrend) {
      predictions.push(weightTrend);
    }

    // Nutrition balance prediction
    const nutritionTrend = this.analyzeNutritionTrend();
    if (nutritionTrend) {
      predictions.push(nutritionTrend);
    }

    // Energy level prediction
    const energyTrend = this.analyzeEnergyTrend();
    if (energyTrend) {
      predictions.push(energyTrend);
    }

    return predictions;
  }

  // Helper Methods
  private getRecentMeals(days: number): Meal[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.mealHistory.filter(meal => 
      new Date(meal.date) >= cutoffDate
    );
  }

  private calculateAverageIntake(meals: Meal[]): any {
    if (meals.length === 0) return {};

    const totals = meals.reduce((acc, meal) => {
      acc.calories = (acc.calories || 0) + meal.calories;
      acc.protein = (acc.protein || 0) + meal.protein;
      acc.carbs = (acc.carbs || 0) + meal.carbs;
      acc.fat = (acc.fat || 0) + meal.fat;
      return acc;
    }, {} as any);

    const days = Math.max(1, Math.ceil(meals.length / 3)); // Assuming 3 meals per day
    
    Object.keys(totals).forEach(key => {
      totals[key] = totals[key] / days;
    });

    return totals;
  }

  private getRecommendedIntake(): any {
    if (!this.userProfile) {
      return {
        protein: 150,
        fiber: 25,
        iron: 18,
        calcium: 1000,
        vitaminC: 90
      };
    }

    // Calculate based on user profile
    const bmr = this.calculateBMR();
    const protein = this.userProfile.weight * 1.6; // 1.6g per kg
    
    return {
      protein,
      fiber: 25,
      iron: this.userProfile.gender === 'female' ? 18 : 8,
      calcium: this.userProfile.age > 50 ? 1200 : 1000,
      vitaminC: this.userProfile.gender === 'male' ? 90 : 75
    };
  }

  private calculateBMR(): number {
    if (!this.userProfile) return 2000;

    const { weight, height, age, gender } = this.userProfile;
    
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  }

  private calculateDeficiencyLevel(current: number, recommended: number): 'mild' | 'moderate' | 'severe' {
    const ratio = current / recommended;
    if (ratio < 0.5) return 'severe';
    if (ratio < 0.7) return 'moderate';
    return 'mild';
  }

  private getHealthImpact(nutrient: string, level: string): string {
    const impacts: { [key: string]: { [level: string]: string } } = {
      protein: {
        mild: 'Có thể ảnh hưởng đến phục hồi cơ bắp',
        moderate: 'Giảm khả năng xây dựng và duy trì cơ bắp',
        severe: 'Nguy cơ suy dinh dưỡng protein, mất cơ bắp'
      },
      fiber: {
        mild: 'Có thể gây khó tiêu',
        moderate: 'Nguy cơ táo bón, rối loạn tiêu hóa',
        severe: 'Tăng nguy cơ bệnh tim mạch, tiểu đường'
      },
      iron: {
        mild: 'Có thể cảm thấy mệt mỏi nhẹ',
        moderate: 'Nguy cơ thiếu máu nhẹ',
        severe: 'Thiếu máu thiếu sắt, suy giảm nhận thức'
      }
    };

    return impacts[nutrient]?.[level] || 'Có thể ảnh hưởng đến sức khỏe tổng thể';
  }

  private getNutrientRecommendations(nutrient: string): string[] {
    const recommendations: { [key: string]: string[] } = {
      protein: [
        'Ăn thêm thịt nạc, cá, trứng',
        'Tăng đậu phụ, đậu hũ trong bữa ăn',
        'Thêm sữa và các sản phẩm từ sữa'
      ],
      fiber: [
        'Ăn nhiều rau xanh và trái cây',
        'Chọn ngũ cốc nguyên hạt',
        'Tăng đậu các loại trong khẩu phần'
      ],
      iron: [
        'Ăn thịt đỏ, gan, tôm cua',
        'Kết hợp với vitamin C để tăng hấp thụ',
        'Tránh uống trà/cà phê cùng bữa ăn'
      ]
    };

    return recommendations[nutrient] || ['Tham khảo ý kiến chuyên gia dinh dưỡng'];
  }

  private mapNutrientToKey(nutrientName: string): string {
    const mapping: { [key: string]: string } = {
      'Protein': 'protein',
      'Chất xơ': 'fiber',
      'Sắt': 'iron',
      'Canxi': 'calcium',
      'Vitamin C': 'vitaminC'
    };
    return mapping[nutrientName] || nutrientName.toLowerCase();
  }

  private getSeverityMultiplier(level: string): number {
    const multipliers = { severe: 3, moderate: 2, mild: 1 };
    return multipliers[level as keyof typeof multipliers] || 1;
  }

  private getCompatibilityScore(food: FoodItem): number {
    if (!this.userProfile) return 1;

    let score = 1;

    // Health condition considerations
    if (this.userProfile.healthConditions.includes('diabetes')) {
      if (food.carbs < 20) score *= 1.3; // Low carb bonus
      if (food.carbs > 50) score *= 0.7; // High carb penalty
    }

    if (this.userProfile.healthConditions.includes('hypertension')) {
      if ((food as any).sodium && (food as any).sodium > 500) {
        score *= 0.6; // High sodium penalty
      }
    }

    // Preference considerations
    if (this.userProfile.preferences.includes('vegetarian')) {
      if (food.category === 'thit') score *= 0.1; // Heavy penalty for meat
      if (food.category === 'rau') score *= 1.5; // Bonus for vegetables
    }

    return Math.max(0.1, Math.min(2.0, score));
  }

  private getGeneralRecommendations(): MealRecommendation[] {
    // Return balanced Vietnamese meals when no specific deficiencies
    const balancedFoods = VIETNAMESE_FOODS.filter(food => 
      food.isPopular && food.difficulty === 'Dễ'
    ).slice(0, 5);

    return balancedFoods.map(food => ({
      food,
      priority: 75,
      reason: 'Món ăn cân bằng dinh dưỡng',
      nutritionalBenefit: 'Cung cấp dinh dưỡng toàn diện cho cơ thể',
      compatibilityScore: 1.0
    }));
  }

  private analyzeWeightTrend(): HealthPrediction | null {
    const recentWeightData = this.healthData
      .filter(d => d.weight)
      .slice(-30) // Last 30 entries
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (recentWeightData.length < 5) return null;

    const weights = recentWeightData.map(d => d.weight!);
    const trend = this.calculateTrend(weights);
    const predictedWeight = weights[weights.length - 1] + (trend * 30); // 30 days prediction

    return {
      metric: 'Cân nặng',
      currentTrend: trend > 0.1 ? 'improving' : trend < -0.1 ? 'declining' : 'stable',
      predictedValue: Math.round(predictedWeight * 10) / 10,
      timeframe: '30 ngày',
      confidence: Math.min(0.9, recentWeightData.length / 30),
      recommendations: this.getWeightRecommendations(trend)
    };
  }

  private analyzeNutritionTrend(): HealthPrediction | null {
    const recentMeals = this.getRecentMeals(14);
    if (recentMeals.length < 10) return null;

    const calorieBalance = this.calculateCalorieBalance(recentMeals);
    const trend = calorieBalance > 200 ? 'improving' : calorieBalance < -200 ? 'declining' : 'stable';

    return {
      metric: 'Cân bằng dinh dưỡng',
      currentTrend: trend,
      predictedValue: Math.round(calorieBalance),
      timeframe: '14 ngày',
      confidence: 0.8,
      recommendations: this.getNutritionTrendRecommendations(calorieBalance)
    };
  }

  private analyzeEnergyTrend(): HealthPrediction | null {
    // Simple energy prediction based on nutrition and exercise
    const recentMeals = this.getRecentMeals(7);
    const avgCalories = recentMeals.reduce((sum, m) => sum + m.calories, 0) / Math.max(1, recentMeals.length);
    
    const energyLevel = avgCalories > 2000 ? 'improving' : avgCalories < 1500 ? 'declining' : 'stable';

    return {
      metric: 'Mức năng lượng',
      currentTrend: energyLevel,
      predictedValue: Math.round(avgCalories),
      timeframe: '7 ngày',
      confidence: 0.7,
      recommendations: this.getEnergyRecommendations(avgCalories)
    };
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private calculateCalorieBalance(meals: Meal[]): number {
    const avgDaily = meals.reduce((sum, m) => sum + m.calories, 0) / Math.max(1, meals.length / 3);
    const recommended = this.userProfile ? this.calculateBMR() * 1.55 : 2000;
    return avgDaily - recommended;
  }

  private getWeightRecommendations(trend: number): string[] {
    if (trend > 0.1) {
      return ['Duy trì chế độ ăn hiện tại', 'Tăng cường tập thể dục để kiểm soát cân nặng'];
    } else if (trend < -0.1) {
      return ['Tăng lượng calo nạp vào', 'Tập trung vào protein và carbs phức'];
    }
    return ['Duy trì chế độ ăn cân bằng', 'Theo dõi định kỳ'];
  }

  private getNutritionTrendRecommendations(balance: number): string[] {
    if (balance > 200) {
      return ['Giảm khẩu phần ăn', 'Tăng rau xanh, giảm carbs'];
    } else if (balance < -200) {
      return ['Tăng khẩu phần dinh dưỡng', 'Bổ sung protein và healthy fats'];
    }
    return ['Duy trì chế độ ăn hiện tại', 'Cân bằng tốt các nhóm chất'];
  }

  private getEnergyRecommendations(avgCalories: number): string[] {
    if (avgCalories < 1500) {
      return ['Tăng lượng calo hàng ngày', 'Ăn nhiều bữa nhỏ trong ngày'];
    } else if (avgCalories > 2500) {
      return ['Kiểm soát khẩu phần ăn', 'Chọn thực phẩm ít calo hơn'];
    }
    return ['Duy trì mức calo hiện tại', 'Phân bổ đều trong ngày'];
  }
}

export default NutritionAI;
