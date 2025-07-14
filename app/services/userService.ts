import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '@/firebaseConfig';

// User Profile Interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  dateOfBirth?: Date;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  goals: {
    type: 'maintain' | 'lose' | 'gain'; // weight goal
    targetWeight?: number;
    weeklyGoal?: number; // kg per week
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number; // ml
  };
  preferences: {
    units: 'metric' | 'imperial';
    language: 'vi' | 'en';
    notifications: {
      mealReminders: boolean;
      waterReminders: boolean;
      goalAchievements: boolean;
      weeklyReports: boolean;
    };
    privacy: {
      shareProgress: boolean;
      publicProfile: boolean;
    };
  };
  medicalInfo?: {
    allergies: string[];
    dietaryRestrictions: string[];
    medications: string[];
    conditions: string[]; // diabetes, hypertension, etc.
  };
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}

// User Stats Interface
export interface UserStats {
  uid: string;
  date: string; // YYYY-MM-DD format
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  waterIntake: number;
  caloriesConsumed: number;
  caloriesBurned: number;
  steps?: number;
  sleepHours?: number;
  mood?: 1 | 2 | 3 | 4 | 5; // 1=very bad, 5=excellent
  notes?: string;
  createdAt: Date;
}

// Achievement Interface
export interface UserAchievement {
  uid: string;
  type: 'weight_loss' | 'goal_reached' | 'streak' | 'milestone';
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  value?: number; // for numerical achievements
}

export class UserService {  // Create or update user profile
  static async createUserProfile(user: User, additionalData: Partial<UserProfile> = {}): Promise<void> {
    const userRef = doc(db, 'users', user.uid);
    
    const defaultProfile: Partial<UserProfile> = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      ...(user.photoURL && { photoURL: user.photoURL }),
      gender: 'male',
      height: 170,
      weight: 70,
      activityLevel: 'moderate',
      goals: {
        type: 'maintain',
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 65,
        water: 2500,
      },
      preferences: {
        units: 'metric',
        language: 'vi',
        notifications: {
          mealReminders: true,
          waterReminders: true,
          goalAchievements: true,
          weeklyReports: true,
        },
        privacy: {
          shareProgress: false,
          publicProfile: false,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActiveAt: new Date(),
    };    const profileData = { ...defaultProfile, ...additionalData };
    
    // Clean undefined values before saving to Firestore
    const cleanedData = this.cleanUndefinedValues(profileData);
    
    try {
      await setDoc(userRef, cleanedData, { merge: true });
      console.log('User profile created/updated successfully');
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Get user profile with security validation
  static async getUserProfile(uid: string, currentUserUid?: string): Promise<UserProfile | null> {
    try {
      console.log('UserService - Getting profile for UID:', uid);
      
      // Validate access if currentUserUid is provided
      if (currentUserUid) {
        this.validateUserAccess(uid, currentUserUid);
      }
      
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        console.log('UserService - Raw Firestore data:', data);
        
        const profile = {
          ...data,
          createdAt: this.safeTimestampToDateWithDefault(data.createdAt),
          updatedAt: this.safeTimestampToDateWithDefault(data.updatedAt),
          lastActiveAt: this.safeTimestampToDateWithDefault(data.lastActiveAt),
          dateOfBirth: this.safeTimestampToDate(data.dateOfBirth),
        } as UserProfile;
        
        console.log('UserService - Processed profile:', profile);
        return profile;
      } else {
        console.log('UserService - No profile found for UID:', uid);
        return null;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      console.error('Error details:', {
        uid,
        currentUserUid,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  // Update user profile with security validation
  static async updateUserProfile(uid: string, updates: Partial<UserProfile>, currentUserUid?: string): Promise<void> {
    try {
      // Validate access if currentUserUid is provided
      if (currentUserUid) {
        this.validateUserAccess(uid, currentUserUid);
      }
      
      const userRef = doc(db, 'users', uid);
      const updateData = {
        ...updates,
        uid: uid, // Ensure UID is always correct
        updatedAt: new Date(),
      };
      
      // Clean undefined values before saving to Firestore
      const cleanedData = this.cleanUndefinedValues(updateData);
      
      await updateDoc(userRef, cleanedData);
      console.log('User profile updated successfully for UID:', uid);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Update last active timestamp
  static async updateLastActive(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { lastActiveAt: new Date() });
    } catch (error) {
      console.error('Error updating last active:', error);
    }
  }

  // Calculate BMR (Basal Metabolic Rate)
  static calculateBMR(profile: UserProfile): number {
    const { weight, height, gender } = profile;
    const age = profile.dateOfBirth 
      ? new Date().getFullYear() - profile.dateOfBirth.getFullYear()
      : 25; // default age if not provided

    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  }

  // Calculate TDEE (Total Daily Energy Expenditure)
  static calculateTDEE(profile: UserProfile): number {
    const bmr = this.calculateBMR(profile);
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      'very-active': 1.9,
    };
    
    return Math.round(bmr * multipliers[profile.activityLevel]);
  }

  // Calculate recommended macros
  static calculateRecommendedMacros(profile: UserProfile): {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } {
    const tdee = this.calculateTDEE(profile);
    let calories = tdee;

    // Adjust calories based on goal
    if (profile.goals.type === 'lose') {
      calories = tdee - 500; // 500 calorie deficit for ~0.5kg/week loss
    } else if (profile.goals.type === 'gain') {
      calories = tdee + 300; // 300 calorie surplus for lean gain
    }

    // Calculate macros (protein: 1.6g/kg, fat: 25% calories, rest carbs)
    const protein = Math.round(profile.weight * 1.6);
    const fat = Math.round((calories * 0.25) / 9);
    const carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4);

    return { calories, protein, carbs, fat };
  }

  // Save daily stats
  static async saveDailyStats(stats: Omit<UserStats, 'createdAt'>): Promise<void> {
    try {
      const statsData = {
        ...stats,
        createdAt: new Date(),
      };
      
      const statsRef = collection(db, 'userStats');
      await addDoc(statsRef, statsData);
      console.log('Daily stats saved successfully');
    } catch (error) {
      console.error('Error saving daily stats:', error);
      throw error;
    }
  }

  // Get user stats for a date range
  static async getUserStats(uid: string, startDate: string, endDate: string): Promise<UserStats[]> {
    try {
      const statsRef = collection(db, 'userStats');
      const q = query(
        statsRef,
        where('uid', '==', uid),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as UserStats[];
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Unlock achievement
  static async unlockAchievement(achievement: Omit<UserAchievement, 'unlockedAt'>): Promise<void> {
    try {
      const achievementData = {
        ...achievement,
        unlockedAt: new Date(),
      };
      
      const achievementsRef = collection(db, 'userAchievements');
      await addDoc(achievementsRef, achievementData);
      console.log('Achievement unlocked:', achievement.title);
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  // Get user achievements
  static async getUserAchievements(uid: string): Promise<UserAchievement[]> {
    try {
      const achievementsRef = collection(db, 'userAchievements');
      const q = query(
        achievementsRef,
        where('uid', '==', uid),
        orderBy('unlockedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        unlockedAt: doc.data().unlockedAt?.toDate() || new Date(),
      })) as UserAchievement[];
    } catch (error) {
      console.error('Error getting user achievements:', error);
      throw error;
    }
  }

  // Get personalized food recommendations
  static getPersonalizedRecommendations(profile: UserProfile): {
    goalAdjustments: string[];
    macroTips: string[];
    activitySuggestions: string[];
  } {
    const recommendations = {
      goalAdjustments: [] as string[],
      macroTips: [] as string[],
      activitySuggestions: [] as string[],
    };

    // Goal-based recommendations
    if (profile.goals.type === 'lose') {
      recommendations.goalAdjustments.push(
        'Tạo deficit 500 calories/ngày để giảm 0.5kg/tuần',
        'Tăng protein để duy trì cơ bắp khi giảm cân',
        'Ưu tiên thực phẩm có chỉ số đường huyết thấp'
      );
    } else if (profile.goals.type === 'gain') {
      recommendations.goalAdjustments.push(
        'Tăng 300-500 calories/ngày để tăng cân lành mạnh',
        'Ăn nhiều bữa nhỏ trong ngày',
        'Kết hợp tập luyện sức mạnh'
      );
    }

    // Activity-based suggestions
    if (profile.activityLevel === 'sedentary') {
      recommendations.activitySuggestions.push(
        'Bắt đầu với 30 phút đi bộ mỗi ngày',
        'Đứng dậy và di chuyển mỗi 2 tiếng',
        'Thử yoga hoặc stretching nhẹ'
      );
    } else if (profile.activityLevel === 'very-active') {
      recommendations.activitySuggestions.push(
        'Đảm bảo nghỉ ngơi đầy đủ để recovery',
        'Tăng protein sau tập luyện',
        'Theo dõi hydration kỹ hơn'
      );
    }

    // Medical condition-based recommendations
    if (profile.medicalInfo?.conditions.includes('diabetes')) {
      recommendations.macroTips.push(
        'Ưu tiên carbs phức hợp và ít đường',
        'Ăn nhiều bữa nhỏ để ổn định đường huyết',
        'Kết hợp protein với mỗi bữa ăn'
      );
    }

    if (profile.medicalInfo?.conditions.includes('hypertension')) {
      recommendations.macroTips.push(
        'Giảm sodium dưới 2300mg/ngày',
        'Tăng kali từ trái cây và rau quả',
        'Ưu tiên DASH diet pattern'
      );
    }

    return recommendations;
  }

  // Validate that the user can only access their own data
  private static validateUserAccess(requestedUid: string, currentUserUid: string): void {
    if (requestedUid !== currentUserUid) {
      throw new Error('Access denied: You can only access your own data');
    }
  }

  // Clean undefined values to prevent Firestore errors
  private static cleanUndefinedValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanUndefinedValues(item)).filter(item => item !== undefined);
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = this.cleanUndefinedValues(value);
        }
      }
      return cleaned;
    }
    
    return obj;
  }

  // Helper function to safely convert Firestore timestamp to Date
  private static safeTimestampToDate(timestamp: any): Date | undefined {
    if (!timestamp) return undefined;
    if (typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    return undefined;
  }

  // Helper function to safely convert Firestore timestamp to Date with default
  private static safeTimestampToDateWithDefault(timestamp: any, defaultDate: Date = new Date()): Date {
    const result = this.safeTimestampToDate(timestamp);
    return result || defaultDate;
  }
}
