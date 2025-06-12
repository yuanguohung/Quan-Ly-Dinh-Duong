import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { 
  FoodItem, 
  FOOD_CATEGORIES, 
  POPULAR_VIETNAMESE_FOODS,
  getFoodsByCategory 
} from '@/data/vietnameseFoods';
import FoodSearch from './FoodSearch';

interface FoodDatabaseProps {
  visible: boolean;
  onClose: () => void;
  onSelectFood: (food: FoodItem) => void;
}

export default function FoodDatabase({ visible, onClose, onSelectFood }: FoodDatabaseProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSelectFood = (food: FoodItem) => {
    Alert.alert(
      'Thêm món ăn',
      `Bạn có muốn thêm "${food.name}" vào nhật ký?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Thêm', 
          onPress: () => {
            onSelectFood(food);
            onClose();
          }
        }
      ]
    );
  };

  const renderCategoryCard = (category: typeof FOOD_CATEGORIES[0]) => {
    const foods = getFoodsByCategory(category.id);
    
    return (
      <TouchableOpacity
        key={category.id}
        style={styles.categoryCard}
        onPress={() => setSelectedCategory(category.id)}
      >
        <View style={[styles.categoryIcon, { backgroundColor: category.color + '15' }]}>
          <Ionicons 
            name={category.icon as any} 
            size={32} 
            color={category.color} 
          />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryDescription}>{category.description}</Text>
          <Text style={styles.categoryCount}>{foods.length} món ăn</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  const renderPopularFood = (food: FoodItem) => (
    <TouchableOpacity
      key={food.id}
      style={styles.popularFoodCard}
      onPress={() => handleSelectFood(food)}
    >
      <View style={styles.popularFoodHeader}>
        <Text style={styles.popularFoodName}>{food.name}</Text>
        <View style={styles.popularBadge}>
          <Ionicons name="star" size={12} color="#FFF" />
        </View>
      </View>
      <Text style={styles.popularFoodPortion}>{food.portion}</Text>
      <View style={styles.popularFoodNutrition}>
        <View style={styles.nutritionItem}>
          <Ionicons name="flash" size={14} color={colors.calories} />
          <Text style={[styles.nutritionText, { color: colors.calories }]}>
            {food.calories}
          </Text>
        </View>
        <View style={styles.nutritionItem}>
          <Ionicons name="fitness" size={14} color={colors.protein} />
          <Text style={[styles.nutritionText, { color: colors.protein }]}>
            {food.protein}g
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryFoods = () => {
    if (!selectedCategory) return null;
    
    const category = FOOD_CATEGORIES.find(cat => cat.id === selectedCategory);
    const foods = getFoodsByCategory(selectedCategory);
    
    return (
      <View style={styles.categoryFoodsContainer}>
        <View style={styles.categoryFoodsHeader}>
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.categoryTitleContainer}>
            <Text style={styles.categoryFoodsTitle}>{category?.name}</Text>
            <Text style={styles.categoryFoodsCount}>{foods.length} món ăn</Text>
          </View>
        </View>
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.categoryFoodsList}
        >
          {foods.map((food) => (
            <TouchableOpacity
              key={food.id}
              style={styles.categoryFoodItem}
              onPress={() => handleSelectFood(food)}
            >
              <View style={styles.foodItemHeader}>
                <Text style={styles.foodItemName}>{food.name}</Text>
                {food.isPopular && (
                  <View style={styles.popularBadgeSmall}>
                    <Ionicons name="star" size={10} color="#FFF" />
                  </View>
                )}
              </View>
              <Text style={styles.foodItemPortion}>{food.portion}</Text>
              
              <View style={styles.foodItemNutrition}>
                <View style={styles.nutritionRow}>
                  <View style={styles.nutritionItem}>
                    <Ionicons name="flash" size={14} color={colors.calories} />
                    <Text style={[styles.nutritionText, { color: colors.calories }]}>
                      {food.calories} kcal
                    </Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Ionicons name="fitness" size={14} color={colors.protein} />
                    <Text style={[styles.nutritionText, { color: colors.protein }]}>
                      P: {food.protein}g
                    </Text>
                  </View>
                </View>
                <View style={styles.nutritionRow}>
                  <View style={styles.nutritionItem}>
                    <Ionicons name="leaf" size={14} color={colors.carbs} />
                    <Text style={[styles.nutritionText, { color: colors.carbs }]}>
                      C: {food.carbs}g
                    </Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Ionicons name="water" size={14} color={colors.fat} />
                    <Text style={[styles.nutritionText, { color: colors.fat }]}>
                      F: {food.fat}g
                    </Text>
                  </View>
                </View>
              </View>

              {food.description && (
                <Text style={styles.foodItemDescription} numberOfLines={2}>
                  {food.description}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        {selectedCategory ? renderCategoryFoods() : (
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Cơ sở dữ liệu món ăn</Text>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => setShowSearch(true)}
              >
                <Ionicons name="search" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
              {/* Popular Foods */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Món ăn phổ biến</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.popularFoodsContainer}
                >
                  {POPULAR_VIETNAMESE_FOODS.map(renderPopularFood)}
                </ScrollView>
              </View>

              {/* Categories */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Danh mục món ăn</Text>
                <View style={styles.categoriesGrid}>
                  {FOOD_CATEGORIES.map(renderCategoryCard)}
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => setShowSearch(true)}
                >
                  <Ionicons name="search" size={20} color={colors.primary} />
                  <Text style={styles.quickActionText}>Tìm kiếm món ăn</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </ScrollView>

            <FoodSearch
              visible={showSearch}
              onClose={() => setShowSearch(false)}
              onSelectFood={handleSelectFood}
            />
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  searchButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  popularFoodsContainer: {
    paddingHorizontal: 16,
  },
  popularFoodCard: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    width: 140,
    borderWidth: 1,
    borderColor: colors.border,
  },
  popularFoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  popularFoodName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  popularBadge: {
    backgroundColor: colors.warning,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  popularFoodPortion: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  popularFoodNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoriesGrid: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutritionText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  // Category Foods Styles
  categoryFoodsContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  categoryFoodsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  categoryTitleContainer: {
    flex: 1,
  },
  categoryFoodsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  categoryFoodsCount: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryFoodsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  categoryFoodItem: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  foodItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  foodItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  popularBadgeSmall: {
    backgroundColor: colors.warning,
    borderRadius: 6,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  foodItemPortion: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  foodItemNutrition: {
    marginBottom: 8,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  foodItemDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
