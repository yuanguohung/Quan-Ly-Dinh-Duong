
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
  {    id: 'banh-bao',
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
  },

  // Thêm món ăn mới
  // Món cơm thêm
  {
    id: 'com-tam',
    name: 'Cơm tấm',
    calories: 485,
    protein: 28.5,
    carbs: 52.3,
    fat: 18.7,
    category: 'com',
    portion: '1 đĩa (300g)',
    description: 'Cơm tấm sườn nướng, chả, trứng ốp la',
    tags: ['cơm tấm', 'sườn nướng', 'chả', 'trứng'],
    region: 'Miền Nam',
    isPopular: true,
    difficulty: 'Trung bình',
    prepTime: 40,
    ingredients: ['Cơm tấm', 'Sườn heo', 'Chả', 'Trứng', 'Dưa leo']
  },
  {
    id: 'com-ga-hoi-an',
    name: 'Cơm gà Hội An',
    calories: 412,
    protein: 32.1,
    carbs: 48.2,
    fat: 10.8,
    category: 'com',
    portion: '1 đĩa (250g)',
    description: 'Cơm gà truyền thống Hội An với gà xé phay',
    tags: ['cơm gà', 'Hội An', 'gà xé'],
    region: 'Miền Trung',
    isPopular: true,
    difficulty: 'Trung bình',
    prepTime: 50
  },
  {
    id: 'com-suon-nuong',
    name: 'Cơm sườn nướng',
    calories: 542,
    protein: 35.2,
    carbs: 45.8,
    fat: 22.3,
    category: 'com',
    portion: '1 đĩa (280g)',
    description: 'Cơm với sườn heo nướng than hoa',
    tags: ['cơm', 'sườn nướng', 'thịt heo'],
    isPopular: true,
    difficulty: 'Trung bình',
    prepTime: 35
  },

  // Món phở và bún thêm
  {
    id: 'pho-cuon',
    name: 'Phở cuốn',
    calories: 268,
    protein: 18.5,
    carbs: 35.2,
    fat: 6.8,
    category: 'pho',
    portion: '4 cuốn (200g)',
    description: 'Bánh phở cuốn thịt bò, rau thơm',
    tags: ['phở cuốn', 'thịt bò', 'rau thơm'],
    region: 'Miền Bắc',
    isPopular: true,
    difficulty: 'Trung bình',
    prepTime: 30
  },
  {
    id: 'bun-thit-nuong',
    name: 'Bún thịt nướng',
    calories: 385,
    protein: 22.8,
    carbs: 48.5,
    fat: 12.2,
    category: 'pho',
    portion: '1 tô (300g)',
    description: 'Bún với thịt heo nướng, chả giò, rau sống',
    tags: ['bún', 'thịt nướng', 'chả giò'],
    region: 'Miền Nam',
    isPopular: true,
    difficulty: 'Trung bình',
    prepTime: 45
  },
  {
    id: 'bun-ca',
    name: 'Bún cá',
    calories: 324,
    protein: 28.4,
    carbs: 42.1,
    fat: 6.8,
    category: 'pho',
    portion: '1 tô (350ml)',
    description: 'Bún cá chả cá thăng long với thì là',
    tags: ['bún cá', 'chả cá', 'thì là'],
    region: 'Miền Bắc',
    isPopular: true,
    difficulty: 'Khó',
    prepTime: 60
  },
  {
    id: 'bun-mam',
    name: 'Bún mắm',
    calories: 298,
    protein: 16.8,
    carbs: 38.5,
    fat: 9.2,
    category: 'pho',
    portion: '1 tô (300ml)',
    description: 'Bún mắm nêm với thịt heo, tôm',
    tags: ['bún mắm', 'mắm nêm', 'tôm'],
    region: 'Miền Tây',
    difficulty: 'Trung bình',
    prepTime: 40
  },

  // Thịt cá thêm
  {
    id: 'ca-kho-to',
    name: 'Cá kho tộ',
    calories: 285,
    protein: 32.5,
    carbs: 8.2,
    fat: 14.8,
    category: 'thit',
    portion: '1 miếng (150g)',
    description: 'Cá basa kho trong niêu đất với nước mắm',
    tags: ['cá kho', 'cá basa', 'nước mắm'],
    region: 'Miền Nam',
    isPopular: true,
    difficulty: 'Trung bình',
    prepTime: 45
  },
  {
    id: 'ga-nuong-lu',
    name: 'Gà nướng lụ',
    calories: 312,
    protein: 28.6,
    carbs: 2.8,
    fat: 20.5,
    category: 'thit',
    portion: '1/4 con (200g)',
    description: 'Gà nướng lá chuối kiểu miền Tây',
    tags: ['gà nướng', 'lá chuối', 'miền Tây'],
    region: 'Miền Tây',
    isPopular: true,
    difficulty: 'Khó',
    prepTime: 90
  },
  {
    id: 'thit-kho-tau',
    name: 'Thịt kho tàu',
    calories: 345,
    protein: 24.8,
    carbs: 12.5,
    fat: 22.3,
    category: 'thit',
    portion: '1 miếng (120g)',
    description: 'Thịt ba chỉ kho với trứng và nước dừa',
    tags: ['thịt kho', 'ba chỉ', 'trứng', 'nước dừa'],
    isPopular: true,
    difficulty: 'Trung bình',
    prepTime: 60
  },
  {
    id: 'tom-rang-me',
    name: 'Tôm rang me',
    calories: 186,
    protein: 22.4,
    carbs: 8.5,
    fat: 7.2,
    category: 'thit',
    portion: '100g',
    description: 'Tôm sú rang với me chua ngọt',
    tags: ['tôm', 'me', 'rang'],
    region: 'Miền Nam',
    difficulty: 'Trung bình',
    prepTime: 25
  },

  // Rau củ thêm
  {
    id: 'dau-hu-sot-ca',
    name: 'Đậu hủ sốt cà',
    calories: 165,
    protein: 12.8,
    carbs: 8.4,
    fat: 9.6,
    category: 'rau',
    portion: '1 miếng (100g)',
    description: 'Đậu hủ chiên giòn sốt cà chua',
    tags: ['đậu hủ', 'cà chua', 'chay'],
    isPopular: true,
    difficulty: 'Dễ',
    prepTime: 20
  },
  {
    id: 'rau-muong-xao-toi',
    name: 'Rau muống xào tỏi',
    calories: 45,
    protein: 3.2,
    carbs: 6.8,
    fat: 1.2,
    category: 'rau',
    portion: '1 đĩa (150g)',
    description: 'Rau muống xào với tỏi và ớt',
    tags: ['rau muống', 'tỏi', 'xào'],
    isPopular: true,
    difficulty: 'Dễ',
    prepTime: 10
  },
  {
    id: 'canh-chua',
    name: 'Canh chua',
    calories: 98,
    protein: 8.5,
    carbs: 12.3,
    fat: 2.1,
    category: 'rau',
    portion: '1 tô (250ml)',
    description: 'Canh chua cá bông lau với me, cà chua',
    tags: ['canh chua', 'cá', 'me', 'cà chua'],
    region: 'Miền Nam',
    isPopular: true,
    difficulty: 'Trung bình',
    prepTime: 30
  },

  // Trái cây thêm
  {
    id: 'sau-rieng',
    name: 'Sầu riêng',
    calories: 147,
    protein: 1.5,
    carbs: 27.1,
    fat: 5.3,
    category: 'trai-cay',
    portion: '100g múi',
    description: 'Sầu riêng chín múi vàng',
    tags: ['sầu riêng', 'trái cây nhiệt đới'],
    region: 'Miền Nam',
    difficulty: 'Dễ',
    prepTime: 5
  },
  {
    id: 'chom-chom',
    name: 'Chôm chôm',
    calories: 82,
    protein: 0.7,
    carbs: 20.9,
    fat: 0.2,
    category: 'trai-cay',
    portion: '10 quả (100g)',
    description: 'Chôm chôm tươi ngọt mát',
    tags: ['chôm chôm', 'ngọt', 'mát'],
    region: 'Miền Nam',
    difficulty: 'Dễ',
    prepTime: 5
  },
  {
    id: 'nhan',
    name: 'Nhãn',
    calories: 66,
    protein: 1.3,
    carbs: 15.1,
    fat: 0.1,
    category: 'trai-cay',
    portion: '10 quả (100g)',
    description: 'Nhãn tươi ngọt thơm',
    tags: ['nhãn', 'ngọt', 'vitamin C'],
    region: 'Miền Bắc',
    difficulty: 'Dễ',
    prepTime: 5
  },

  // Bánh kẹo thêm
  {
    id: 'banh-mi-thit',
    name: 'Bánh mì thịt',
    calories: 412,
    protein: 18.5,
    carbs: 45.2,
    fat: 16.8,
    category: 'banh',
    portion: '1 ổ (200g)',
    description: 'Bánh mì Việt Nam với thịt nguội, pate',
    tags: ['bánh mì', 'thịt nguội', 'pate'],
    isPopular: true,
    difficulty: 'Dễ',
    prepTime: 10
  },
  {
    id: 'banh-flan',
    name: 'Bánh flan',
    calories: 152,
    protein: 4.2,
    carbs: 22.8,
    fat: 5.1,
    category: 'banh',
    portion: '1 cái (100g)',
    description: 'Bánh flan caramen mềm mịn',
    tags: ['bánh flan', 'caramen', 'ngọt'],
    isPopular: true,
    difficulty: 'Trung bình',
    prepTime: 60
  },
  {
    id: 'che-ba-mau',
    name: 'Chè ba màu',
    calories: 185,
    protein: 3.8,
    carbs: 35.2,
    fat: 4.5,
    category: 'banh',
    portion: '1 ly (200ml)',
    description: 'Chè ba màu với đậu đỏ, đậu xanh, thạch',
    tags: ['chè', 'đậu đỏ', 'đậu xanh', 'thạch'],
    region: 'Miền Nam',
    isPopular: true,
    difficulty: 'Trung bình',
    prepTime: 45
  },

  // Nước uống thêm
  {
    id: 'tra-da',
    name: 'Trà đá',
    calories: 2,
    protein: 0,
    carbs: 0.5,
    fat: 0,
    category: 'nuoc',
    portion: '1 ly (250ml)',
    description: 'Trà đá truyền thống Việt Nam',
    tags: ['trà', 'đá', 'giải khát'],
    isPopular: true,
    difficulty: 'Dễ',
    prepTime: 5
  },
  {
    id: 'nuoc-mia',
    name: 'Nước mía',
    calories: 68,
    protein: 0.2,
    carbs: 17.2,
    fat: 0,
    category: 'nuoc',
    portion: '1 ly (250ml)',
    description: 'Nước mía tươi ép',
    tags: ['nước mía', 'tươi', 'ngọt'],
    isPopular: true,
    difficulty: 'Dễ',
    prepTime: 5
  },
  {
    id: 'sinh-to-bo',
    name: 'Sinh tố bơ',
    calories: 234,
    protein: 4.8,
    carbs: 28.5,
    fat: 12.2,
    category: 'nuoc',
    portion: '1 ly (300ml)',
    description: 'Sinh tố bơ với sữa đặc',
    tags: ['sinh tố', 'bơ', 'sữa đặc'],
    region: 'Miền Nam',
    isPopular: true,
    difficulty: 'Dễ',
    prepTime: 10
  },

  // Đồ ăn nhẹ thêm
  {
    id: 'banh-trang-nuong',
    name: 'Bánh tráng nướng',
    calories: 98,
    protein: 3.2,
    carbs: 18.5,
    fat: 1.8,
    category: 'do-an-nhe',
    portion: '1 cái (30g)',
    description: 'Bánh tráng nướng với trứng, hành phi',
    tags: ['bánh tráng', 'nướng', 'trứng'],
    region: 'Miền Trung',
    isPopular: true,
    difficulty: 'Dễ',
    prepTime: 10
  },
  {
    id: 'che-ba-ba',
    name: 'Chè ba ba',
    calories: 142,
    protein: 2.1,
    carbs: 28.5,
    fat: 3.2,
    category: 'do-an-nhe',
    portion: '1 ly (200ml)',
    description: 'Chè ba ba với chuối, khoai lang, sắn',
    tags: ['chè', 'ba ba', 'chuối', 'khoai'],
    region: 'Miền Tây',
    difficulty: 'Trung bình',
    prepTime: 30
  },
  {
    id: 'goi-cuon',
    name: 'Gỏi cuốn',
    calories: 68,
    protein: 4.5,
    carbs: 8.2,
    fat: 2.1,
    category: 'do-an-nhe',
    portion: '1 cuốn (50g)',
    description: 'Gỏi cuốn tôm thịt với rau thơm',
    tags: ['gỏi cuốn', 'tôm thịt', 'rau thơm'],
    isPopular: true,
    difficulty: 'Trung bình',
    prepTime: 20
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
