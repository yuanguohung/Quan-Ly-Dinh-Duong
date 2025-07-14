import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface MealContextType {
  mealVersion: number;
  triggerMealUpdate: () => void;
}

const MealContext = createContext<MealContextType | null>(null);

export const MealProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mealVersion, setMealVersion] = useState(0);

  const triggerMealUpdate = useCallback(() => {
    setMealVersion(prev => prev + 1);
    console.log('MealContext - triggerMealUpdate called, new version:', mealVersion + 1);
  }, [mealVersion]);

  return (
    <MealContext.Provider value={{ mealVersion, triggerMealUpdate }}>
      {children}
    </MealContext.Provider>
  );
};

export const useMealUpdate = () => {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error('useMealUpdate must be used within a MealProvider');
  }
  return context;
};
