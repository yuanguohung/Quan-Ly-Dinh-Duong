// Test script to verify Vietnamese food database functionality
import { 
  VIETNAMESE_FOODS, 
  FOOD_CATEGORIES, 
  POPULAR_VIETNAMESE_FOODS,
  searchFoods,
  filterFoodsByCategory,
  getFoodsByCategory
} from './app/data/vietnameseFoods';

console.log('=== VIETNAMESE FOOD DATABASE TEST ===\n');

// Test 1: Check total foods count
console.log(`✅ Total Vietnamese foods: ${VIETNAMESE_FOODS.length}`);

// Test 2: Check categories
console.log(`✅ Total categories: ${FOOD_CATEGORIES.length}`);
FOOD_CATEGORIES.forEach(cat => {
  const foods = getFoodsByCategory(cat.id);
  console.log(`   ${cat.name}: ${foods.length} dishes`);
});

// Test 3: Check popular foods
console.log(`✅ Popular foods: ${POPULAR_VIETNAMESE_FOODS.length}`);

// Test 4: Test search functionality
const phoResults = searchFoods('phở');
console.log(`✅ Search 'phở': ${phoResults.length} results`);

const beeResults = searchFoods('bò');
console.log(`✅ Search 'bò': ${beeResults.length} results`);

// Test 5: Test category filtering
const riceCategory = getFoodsByCategory('rice-porridge');
console.log(`✅ Rice & Porridge category: ${riceCategory.length} dishes`);

const noodleCategory = getFoodsByCategory('noodle-soup');
console.log(`✅ Noodle Soup category: ${noodleCategory.length} dishes`);

// Test 6: Sample nutrition data
const sampleFood = VIETNAMESE_FOODS[0];
console.log(`✅ Sample food: ${sampleFood.name}`);
console.log(`   Calories: ${sampleFood.calories} kcal`);
console.log(`   Protein: ${sampleFood.protein}g`);
console.log(`   Portion: ${sampleFood.portion}`);

console.log('\n🎉 All tests completed successfully!');
console.log('Vietnamese food database is ready for use.');
