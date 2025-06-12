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
  
 export type DailyGoal = {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  
