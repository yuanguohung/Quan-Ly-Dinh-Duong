
export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  calcium?: number;
  iron?: number;
  vitaminC?: number;
  category: string;
  portion: string;
  description?: string;
  image?: string;
  tags: string[];
  region?: string;
  cookingMethod?: string;
  ingredients?: string[];
  isPopular?: boolean;
  difficulty?: 'Dễ' | 'Trung bình' | 'Khó';
  prepTime?: number; // minutes
}

export const FOOD_CATEGORIES = [
  { 
    id: 'com', 
    name: 'Cơm & Cháo', 
    icon: 'restaurant', 
    color: '#FF6B6B',
    description: 'Món chính với cơm, cháo, xôi'
  },
  { 
    id: 'pho', 
    name: 'Phở & Bún', 
    icon: 'cafe', 
    color: '#4ECDC4',
    description: 'Món phở, bún, miến các loại'
  },
  { 
    id: 'thit', 
    name: 'Thịt & Cá', 
    icon: 'fish', 
    color: '#45B7D1',
    description: 'Thịt bò, heo, gà, cá và hải sản'
  },
  { 
    id: 'rau', 
    name: 'Rau & Củ', 
    icon: 'leaf', 
    color: '#96CEB4',
    description: 'Rau xanh, củ quả, salad'
  },
  { 
    id: 'trai-cay', 
    name: 'Trái cây', 
    icon: 'nutrition', 
    color: '#FECA57',
    description: 'Trái cây tươi và khô'
  },
  { 
    id: 'banh', 
    name: 'Bánh & Kẹo', 
    icon: 'storefront', 
    color: '#FF9FF3',
    description: 'Bánh ngọt, bánh mì, kẹo'
  },
  { 
    id: 'nuoc', 
    name: 'Nước uống', 
    icon: 'water', 
    color: '#54A0FF',
    description: 'Nước, trà, cà phê, nước ép'
  },
  { 
    id: 'do-an-nhe', 
    name: 'Đồ ăn nhẹ', 
    icon: 'fast-food', 
    color: '#5F27CD',
    description: 'Snack, đồ ăn vặt'
  }
];

export const VIETNAMESE_FOODS: FoodItem[] = [
  // Cơm & Cháo
  {
    id: 'com-trang',
    name: 'Cơm trắng',
    calories: 205,
    protein: 4.2,
    carbs: 45,
    fat: 0.4,
    fiber: 0.6,
    category: 'com',
    portion: '1 chén (150g)',
    description: 'Cơm trắng nấu từ gạo tẻ',
    tags: ['cơm', 'chủ yếu', 'hàng ngày'],
    region: 'Cả nước',
    isPopular: true,
    difficulty: 'Dễ',
    prepTime: 20
  },
  {
    id: 'com-chien-duong-chau',
    name: 'Cơm chiên Dương Châu',
    calories: 346,
    protein: 12.8,
    carbs: 42.5,
    fat: 14.2,
    category: 'com',
    portion: '1 đĩa (200g)',
    description: 'Cơm chiên với tôm, xúc xích, trứng',
    tags: ['cơm chiên', 'tôm', 'trứng'],
    isPopular: true,
    difficulty: 'Trung bình',
    prepTime: 25,
    ingredients: ['Cơm', 'Tôm', 'Xúc xích', 'Trứng', 'Hành tây']
  },
  {
    id: 'chao-ga',
    name: 'Cháo gà',
    calories: 168,
    protein: 8.5,
    carbs: 28.2,
    fat: 3.1,
    category: 'com',
    portion: '1 tô (250ml)',
    description: 'Cháo nấu từ gà và gạo tẻ',
    tags: ['cháo', 'gà', 'dinh dưỡng'],
    isPopular: true,
    difficulty: 'Trung bình',
    prepTime: 45
  },
  {
    id: 'xoi-xeo',
    name: 'Xôi xéo',
    calories: 312,
    protein: 6.8,
    carbs: 58.4,
    fat: 6.2,
    category: 'com',
    portion: '1 phần (150g)',
    description: 'Xôi nấu với đậu xanh và nước cốt dừa',
    tags: ['xôi', 'đậu xanh', 'sáng'],
    region: 'Miền Nam',
    isPopular: true,
    difficulty: 'Trung bình',
    prepTime: 40
  },

  // Phở & Bún
  {
    id: 'pho-bo',
    name: 'Phở bò',
    calories: 387,
    protein: 22.1,
    carbs: 45.6,
    fat: 12.8,
    sodium: 1200,
    category: 'pho',
    portion: '1 tô (500ml)',
    description: 'Phở truyền thống với thịt bò và bánh phở',
    tags: ['phở', 'bò', 'nước dùng'],
    region: 'Miền Bắc',
    isPopular: true,
    difficulty: 'Khó',
    prepTime: 180,
    ingredients: ['Bánh phở', 'Thịt bò', 'Hành tây', 'Ngò gai', 'Giá đỗ']
  },
  {
    id: 'pho-ga',
    name: 'Phở gà',
    calories: 312,
    protein: 18.4,
    carbs: 44.2,
    fat: 8.1,
    category: 'pho',
    portion: '1 tô (500ml)',
    description: 'Phở với thịt gà và nước dùng ngọt',
    tags: ['phở', 'gà', 'thanh đạm'],
    isPopular: true,
    difficulty: 'Khó',
    prepTime: 120
  },
  {
    id: 'bun-bo-hue',
    name: 'Bún bò Huế',
    calories: 425,
    protein: 25.3,
    carbs: 48.7,
    fat: 15.2,
    category: 'pho',
    portion: '1 tô (500ml)',
    description: 'Bún với thịt bò và nước dùng cay',
    tags: ['bún', 'bò', 'cay', 'huế'],
    region: 'Miền Trung',
    isPopular: true,
    difficulty: 'Khó',
    prepTime: 150
  },
  {
    id: 'bun-cha',
    name: 'Bún chả',
    calories: 398,
    protein: 20.8,
    carbs: 42.1,
    fat: 16.4,
    category: 'pho',
    portion: '1 phần',
    description: 'Bún với chả nướng và nước mắm pha',
    tags: ['bún', 'chả', 'nướng'],
    region: 'Miền Bắc',
    isPopular: true,
    difficulty: 'Trung bình',
    prepTime: 60
  },

  // Thịt & Cá
  {
    id: 'thit-ga-luoc',
    name: 'Thịt gà luộc',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    category: 'thit',
    portion: '100g',
    description: 'Thịt gà luộc không da',
    tags: ['gà', 'luộc', 'protein'],
    isPopular: true,
    difficulty: 'Dễ',
    prepTime: 30
  },
  {
    id: 'thit-bo-nuong',
    name: 'Thịt bò nướng',
    calories: 288,
    protein: 26.1,
    carbs: 0,
    fat: 19.8,
    iron: 2.9,
    category: 'thit',
    portion: '100g',
    description: 'Thịt bò nướng thơm phức',
    tags: ['bò', 'nướng', 'protein'],
    difficulty: 'Trung bình',
    prepTime: 20
  },
  {
    id: 'ca-kho-to',
    name: 'Cá kho tộ',
    calories: 198,
    protein: 22.4,
    carbs: 8.2,
    fat: 8.9,
    category: 'thit',
    portion: '100g',
    description: 'Cá kho với nước mắm và đường',
    tags: ['cá', 'kho', 'đậm đà'],
    region: 'Miền Nam',
    isPopular: true,
    difficulty: 'Trung bình',
    prepTime: 45
  },
  {
    id: 'tom-rang-me',
    name: 'Tôm rang me',
    calories: 156,
    protein: 18.2,
    carbs: 12.4,
    fat: 5.1,
    category: 'thit',
    portion: '100g',
    description: 'Tôm rang với me chua ngọt',
    tags: ['tôm', 'rang', 'me'],
    difficulty: 'Trung bình',
    prepTime: 25
  },

  // Rau & Củ
  {
    id: 'canh-chua-ca',
    name: 'Canh chua cá',
    calories: 68,
    protein: 8.2,
    carbs: 6.4,
    fat: 1.8,
    vitaminC: 15,
    category: 'rau',
    portion: '1 tô (200ml)',
    description: 'Canh chua với cá và rau củ',
    tags: ['canh', 'chua', 'cá', 'rau'],
    region: 'Miền Nam',
    isPopular: true,
    difficulty: 'Trung bình',
    prepTime: 30
  },
  {
    id: 'rau-muong-xao-toi',
    name: 'Rau muống xào tỏi',
    calories: 45,
    protein: 2.8,
    carbs: 6.2,
    fat: 1.4,
    fiber: 2.1,
    vitaminC: 55,
    category: 'rau',
    portion: '100g',
    description: 'Rau muống xào với tỏi thơm',
    tags: ['rau muống', 'xào', 'tỏi'],
    isPopular: true,
    difficulty: 'Dễ',
    prepTime: 10
  },
  {
    id: 'goi-ngo-sen',
    name: 'Gỏi ngó sen',
    calories: 89,
    protein: 3.2,
    carbs: 16.8,
    fat: 1.2,
    fiber: 4.8,
    category: 'rau',
    portion: '100g',
    description: 'Gỏi ngó sen với tôm thịt',
    tags: ['gỏi', 'ngó sen', 'tươi mát'],
    difficulty: 'Trung bình',
    prepTime: 25
  },

  // Trái cây
  {
    id: 'chuoi-chien',
    name: 'Chuối chiên',
    calories: 158,
    protein: 1.8,
    carbs: 22.4,
    fat: 7.2,
    category: 'trai-cay',
    portion: '1 quả (100g)',
    description: 'Chuối chiên giòn rụm',
    tags: ['chuối', 'chiên', 'ngọt'],
    isPopular: true,
    difficulty: 'Dễ',
    prepTime: 15
  },
  {
    id: 'xoai-xanh',
    name: 'Xoài xanh',
    calories: 39,
    protein: 0.6,
    carbs: 9.8,
    fat: 0.2,
    vitaminC: 27,
    fiber: 1.8,
    category: 'trai-cay',
    portion: '100g',
    description: 'Xoài xanh chua ngọt',
    tags: ['xoài', 'chua', 'vitamin C'],
    isPopular: true,
    difficulty: 'Dễ',
    prepTime: 5
  },
  {
    id: 'mit-to',
    name: 'Mít tố',
    calories: 94,
    protein: 1.4,
    carbs: 24.2,
    fat: 0.3,
    category: 'trai-cay',
    portion: '100g',
    description: 'Mít tố ngọt thơm',
    tags: ['mít', 'ngọt', 'thơm'],
    difficulty: 'Dễ',
    prepTime: 10
  },

  // Bánh & Kẹo
  {
    id: 'banh-mi-thit',
    name: 'Bánh mì thịt',
    calories: 285,
    protein: 12.8,
    carbs: 38.4,
    fat: 8.9,
    category: 'banh',
    portion: '1 ổ (80g)',
    description: 'Bánh mì với thịt và rau thơm',
    tags: ['bánh mì', 'thịt', 'sáng'],
    isPopular: true,
    difficulty: 'Dễ',
    prepTime: 10
  },
  {
    id: 'banh-cuon',
    name: 'Bánh cuốn',
    calories: 176,
    protein: 6.8,
    carbs: 28.5,
    fat: 4.2,
    category: 'banh',
    portion: '2 cái (100g)',
    description: 'Bánh cuốn với thịt băm và mộc nhĩ',
    tags: ['bánh cuốn', 'thịt băm', 'mộc nhĩ'],
    region: 'Miền Bắc',
    isPopular: true,
    difficulty: 'Khó',
    prepTime: 90
  },
  {
    id: 'che-ba-mau',
    name: 'Chè ba màu',
    calories: 156,
    protein: 3.2,
    carbs: 32.8,
    fat: 2.4,
    category: 'banh',
    portion: '1 ly (150ml)',
    description: 'Chè với đậu đỏ, đậu xanh và thạch',
    tags: ['chè', 'đậu', 'ngọt'],
    region: 'Miền Nam',
    isPopular: true,
    difficulty: 'Trung bình',
    prepTime: 60
  },

  // Nước uống
  {
    id: 'ca-phe-sua-da',
    name: 'Cà phê sữa đá',
    calories: 78,
    protein: 2.1,
    carbs: 12.4,
    fat: 2.8,
    category: 'nuoc',
    portion: '1 ly (200ml)',
    description: 'Cà phê với sữa đặc và đá',
    tags: ['cà phê', 'sữa', 'đá'],
    isPopular: true,
    difficulty: 'Dễ',
    prepTime: 5
  },
  {
    id: 'nuoc-mia',
    name: 'Nước mía',
    calories: 64,
    protein: 0,
    carbs: 16.8,
    fat: 0,
    category: 'nuoc',
    portion: '1 ly (200ml)',
    description: 'Nước mía tươi ngọt mát',
    tags: ['mía', 'tươi', 'ngọt'],
    isPopular: true,
    difficulty: 'Dễ',
    prepTime: 5
  },
  {
    id: 'tra-da',
    name: 'Trà đá',
    calories: 2,
    protein: 0,
    carbs: 0.5,
    fat: 0,
    category: 'nuoc',
    portion: '1 ly (200ml)',
    description: 'Trà đá không đường',
    tags: ['trà', 'đá', 'không calo'],
    isPopular: true,
    difficulty: 'Dễ',
    prepTime: 2
  },

  // Đồ ăn nhẹ
  {
    id: 'banh-trang-nuong',
    name: 'Bánh tráng nướng',
    calories: 165,
    protein: 4.2,
    carbs: 28.4,
    fat: 4.8,
    category: 'do-an-nhe',
    portion: '1 cái (50g)',
    description: 'Bánh tráng nướng với trứng và hành lá',
    tags: ['bánh tráng', 'nướng', 'trứng'],
    region: 'Miền Trung',
    isPopular: true,
    difficulty: 'Dễ',
    prepTime: 10
  },
  {
    id: 'nem-chua',
    name: 'Nem chua',
    calories: 142,
    protein: 8.9,
    carbs: 12.8,
    fat: 6.4,
    category: 'do-an-nhe',
    portion: '100g',
    description: 'Nem chua thịt heo chua ngọt',
    tags: ['nem', 'chua', 'thịt heo'],
    region: 'Miền Bắc',
    difficulty: 'Khó',
    prepTime: 180
  },
  {
    id: 'banh-bao',
    name: 'Bánh bao',
    calories: 198,
    protein: 7.8,
    carbs: 32.4,
    fat: 4.2,
    category: 'do-an-nhe',
    portion: '1 cái (80g)',
    description: 'Bánh bao nhân thịt và trứng cút',
    tags: ['bánh bao', 'thịt', 'trứng cút'],
    isPopular: true,
    difficulty: 'Trung bình',
    prepTime: 45
  }
];

// Popular foods for quick add
export const POPULAR_VIETNAMESE_FOODS = VIETNAMESE_FOODS.filter(food => food.isPopular);

// Foods by category
export const getFoodsByCategory = (categoryId: string) => {
  return VIETNAMESE_FOODS.filter(food => food.category === categoryId);
};

// Search foods
export const searchFoods = (query: string) => {
  const searchTerm = query.toLowerCase().trim();
  return VIETNAMESE_FOODS.filter(food => 
    food.name.toLowerCase().includes(searchTerm) ||
    food.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    food.description?.toLowerCase().includes(searchTerm) ||
    food.ingredients?.some(ingredient => ingredient.toLowerCase().includes(searchTerm))
  );
};

// Get food by ID
export const getFoodById = (id: string) => {
  return VIETNAMESE_FOODS.find(food => food.id === id);
};

// Filter foods by criteria
export const filterFoods = (criteria: {
  category?: string;
  maxCalories?: number;
  minProtein?: number;
  region?: string;
  difficulty?: string;
  isPopular?: boolean;
}) => {
  return VIETNAMESE_FOODS.filter(food => {
    if (criteria.category && food.category !== criteria.category) return false;
    if (criteria.maxCalories && food.calories > criteria.maxCalories) return false;
    if (criteria.minProtein && food.protein < criteria.minProtein) return false;
    if (criteria.region && food.region !== criteria.region) return false;
    if (criteria.difficulty && food.difficulty !== criteria.difficulty) return false;
    if (criteria.isPopular !== undefined && food.isPopular !== criteria.isPopular) return false;
    return true;
  });
};
