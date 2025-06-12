
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { FoodItem, searchFoods, filterFoods, FOOD_CATEGORIES } from '@/data/vietnameseFoods';

interface FoodSearchProps {
  visible: boolean;
  onClose: () => void;
  onSelectFood: (food: FoodItem) => void;
}

export default function FoodSearch({ visible, onClose, onSelectFood }: FoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    maxCalories: null as number | null,
    minProtein: null as number | null,
    difficulty: null as string | null,
    isPopular: false,
  });

  useEffect(() => {
    if (searchQuery.trim()) {
      let results = searchFoods(searchQuery);
      
      // Apply category filter
      if (selectedCategory) {
        results = results.filter(food => food.category === selectedCategory);
      }
      
      // Apply other filters
      results = filterFoods({
        category: selectedCategory || undefined,
        maxCalories: filters.maxCalories || undefined,
        minProtein: filters.minProtein || undefined,
        difficulty: filters.difficulty || undefined,
        isPopular: filters.isPopular,
      }).filter(food => 
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      setSearchResults(results);
    } else {
      // Show all foods or filtered foods when no search query
      const results = selectedCategory 
        ? filterFoods({ 
            category: selectedCategory,
            maxCalories: filters.maxCalories || undefined,
            minProtein: filters.minProtein || undefined,
            difficulty: filters.difficulty || undefined,
            isPopular: filters.isPopular,
          })
        : filterFoods({
            maxCalories: filters.maxCalories || undefined,
            minProtein: filters.minProtein || undefined,
            difficulty: filters.difficulty || undefined,
            isPopular: filters.isPopular,
          });
      
      setSearchResults(results);
    }
  }, [searchQuery, selectedCategory, filters]);

  const handleSelectFood = (food: FoodItem) => {
    onSelectFood(food);
    onClose();
    setSearchQuery('');
    setSelectedCategory(null);
    setFilters({
      maxCalories: null,
      minProtein: null,
      difficulty: null,
      isPopular: false,
    });
  };

  const clearFilters = () => {
    setFilters({
      maxCalories: null,
      minProtein: null,
      difficulty: null,
      isPopular: false,
    });
    setSelectedCategory(null);
  };

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <TouchableOpacity 
      style={styles.foodItem} 
      onPress={() => handleSelectFood(item)}
    >
      <View style={styles.foodHeader}>
        <View style={styles.foodNameContainer}>
          <Text style={styles.foodName}>{item.name}</Text>
          {item.isPopular && (
            <View style={styles.popularBadge}>
              <Ionicons name="star" size={12} color="#FFF" />
            </View>
          )}
        </View>
        <Text style={styles.foodPortion}>{item.portion}</Text>
      </View>
      
      <View style={styles.foodNutrition}>
        <View style={styles.nutritionItem}>
          <Ionicons name="flash" size={16} color={colors.calories} />
          <Text style={[styles.nutritionText, { color: colors.calories }]}>
            {item.calories} kcal
          </Text>
        </View>
        <View style={styles.nutritionItem}>
          <Ionicons name="fitness" size={16} color={colors.protein} />
          <Text style={[styles.nutritionText, { color: colors.protein }]}>
            P: {item.protein}g
          </Text>
        </View>
        <View style={styles.nutritionItem}>
          <Ionicons name="leaf" size={16} color={colors.carbs} />
          <Text style={[styles.nutritionText, { color: colors.carbs }]}>
            C: {item.carbs}g
          </Text>
        </View>
        <View style={styles.nutritionItem}>
          <Ionicons name="water" size={16} color={colors.fat} />
          <Text style={[styles.nutritionText, { color: colors.fat }]}>
            F: {item.fat}g
          </Text>
        </View>
      </View>

      {item.tags && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {item.description && (
        <Text style={styles.foodDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tìm món ăn</Text>
          <TouchableOpacity 
            onPress={() => setShowFilters(!showFilters)}
            style={styles.filterButton}
          >
            <Ionicons name="options" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm món ăn..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              !selectedCategory && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[
              styles.categoryChipText,
              !selectedCategory && styles.categoryChipTextActive
            ]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          {FOOD_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons 
                name={category.icon as any} 
                size={16} 
                color={selectedCategory === category.id ? '#FFF' : category.color} 
                style={styles.categoryIcon}
              />
              <Text style={[
                styles.categoryChipText,
                selectedCategory === category.id && styles.categoryChipTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filtersContent}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filters.isPopular && styles.filterChipActive
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, isPopular: !prev.isPopular }))}
                >
                  <Ionicons name="star" size={16} color={filters.isPopular ? '#FFF' : colors.warning} />
                  <Text style={[
                    styles.filterChipText,
                    filters.isPopular && styles.filterChipTextActive
                  ]}>
                    Phổ biến
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filters.maxCalories === 200 && styles.filterChipActive
                  ]}
                  onPress={() => setFilters(prev => ({ 
                    ...prev, 
                    maxCalories: prev.maxCalories === 200 ? null : 200 
                  }))}
                >
                  <Text style={[
                    styles.filterChipText,
                    filters.maxCalories === 200 && styles.filterChipTextActive
                  ]}>
                    ≤ 200 kcal
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filters.minProtein === 15 && styles.filterChipActive
                  ]}
                  onPress={() => setFilters(prev => ({ 
                    ...prev, 
                    minProtein: prev.minProtein === 15 ? null : 15 
                  }))}
                >
                  <Text style={[
                    styles.filterChipText,
                    filters.minProtein === 15 && styles.filterChipTextActive
                  ]}>
                    ≥ 15g protein
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={clearFilters}
                >
                  <Text style={styles.clearFiltersText}>Xóa bộ lọc</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}

        {/* Results */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsCount}>
            {searchResults.length} món ăn
          </Text>
          <FlatList
            data={searchResults}
            renderItem={renderFoodItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsList}
          />
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  categoriesContainer: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  filtersContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginLeft: 4,
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  clearFiltersButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  clearFiltersText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
    paddingTop: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontWeight: '500',
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  foodItem: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  foodNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  popularBadge: {
    backgroundColor: colors.warning,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  foodPortion: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  foodNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutritionText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  foodDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
