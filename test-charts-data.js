// Test Charts Data Generator
// Chạy file này để tạo sample data cho Charts screen

const generateSampleMeals = () => {
  const meals = [];
  const today = new Date();
  
  // Generate meals for last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toDateString();
    
    // Morning meal
    meals.push({
      id: `breakfast-${i}`,
      name: `Phở bò (${date.getDate()}/${date.getMonth() + 1})`,
      calories: 450 + Math.random() * 100,
      protein: 25 + Math.random() * 10,
      carbs: 60 + Math.random() * 20,
      fat: 8 + Math.random() * 5,
      date: dateString,
      category: 'breakfast',
    });
    
    // Lunch meal
    meals.push({
      id: `lunch-${i}`,
      name: `Cơm tấm (${date.getDate()}/${date.getMonth() + 1})`,
      calories: 650 + Math.random() * 150,
      protein: 35 + Math.random() * 15,
      carbs: 80 + Math.random() * 25,
      fat: 15 + Math.random() * 8,
      date: dateString,
      category: 'lunch',
    });
    
    // Dinner meal
    meals.push({
      id: `dinner-${i}`,
      name: `Bánh mì thịt (${date.getDate()}/${date.getMonth() + 1})`,
      calories: 400 + Math.random() * 80,
      protein: 20 + Math.random() * 8,
      carbs: 45 + Math.random() * 15,
      fat: 12 + Math.random() * 6,
      date: dateString,
      category: 'dinner',
    });
  }
  
  return meals;
};

const generateSampleGoals = () => {
  return {
    calories: '2200',
    protein: '140',
    carbs: '280',
    fat: '75',
    water: '2500'
  };
};

console.log('🧪 Testing Charts Screen Data Generation');

console.log('\n📊 Sample Meals Data:');
const sampleMeals = generateSampleMeals();
console.log(`Generated ${sampleMeals.length} meals over 7 days`);
console.log('Sample meal:', sampleMeals[0]);

console.log('\n🎯 Sample Goals Data:');
const sampleGoals = generateSampleGoals();
console.log('Sample goals:', sampleGoals);

console.log('\n📝 To add this data to your app:');
console.log('1. Go to the Add tab and add some meals');
console.log('2. Go to Settings and set your daily goals');
console.log('3. Check Charts tab - it should now show data');

console.log('\n🔍 Charts Debug Checklist:');
console.log('- ✅ App running and no compile errors');
console.log('- ⭐ Check Charts tab loads without errors');
console.log('- ⭐ Click "Debug Info" button to see current data state');
console.log('- ⭐ Add meals in Add tab if empty');
console.log('- ⭐ Check console logs for debugging info');

console.log('\n🚨 Common Issues:');
console.log('- Charts show "Chưa có dữ liệu": Add meals in Add tab');
console.log('- Loading forever: Check AsyncStorage data and console errors');
console.log('- Charts not rendering: Check react-native-chart-kit compatibility');
console.log('- Console errors: Check data format and chart component props');

console.log('\n🎯 Expected Behavior:');
console.log('- Loading state first, then charts appear');
console.log('- Progress rings for today\'s nutrition');
console.log('- Pie chart for macro distribution');
console.log('- Line chart for 7-day calorie trend');
console.log('- Bar chart for protein intake');
console.log('- Weekly summary statistics');

console.log('\nCharts debugging setup complete! 📊✨');
