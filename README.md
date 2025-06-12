# 🥗 Vietnamese Nutrition Tracker

[![React Native](https://img.shields.io/badge/React%20Native-0.75-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-52.0-purple.svg)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **🎓 Graduation Project**: AI-Powered Vietnamese Nutrition Tracking Platform

Ứng dụng theo dõi dinh dưỡng thông minh dành riêng cho người Việt Nam, tích hợp AI và cơ sở dữ liệu món ăn Việt Nam toàn diện.

![App Preview](./assets/images/app-preview.png)

## ✨ Tính năng chính

### 🔐 **Hệ thống xác thực hoàn chỉnh**

- Đăng nhập/đăng ký với Firebase Auth
- **Xác thực sinh trắc học** (Face ID/Touch ID)
- Password strength indicator
- Quên mật khẩu với email reset
- Secure storage cho dữ liệu nhạy cảm

### 🍜 **Cơ sở dữ liệu món ăn Việt Nam (30+ món)**

- **8 danh mục**: Cơm & Cháo, Phở & Bún, Thịt & Cá, Rau & Củ, Trái cây, Bánh & Kẹo, Nước uống, Đồ ăn nhẹ
- Thông tin dinh dưỡng chi tiết (calories, protein, carbs, fat, vitamins, minerals)
- Metadata địa phương (vùng miền, độ khó nấu, thời gian chuẩn bị)
- Tìm kiếm nâng cao với bộ lọc thông minh
- Giao diện duyệt theo danh mục trực quan

### 📊 **Theo dõi dinh dưỡng thông minh**

- Tracking macro và micro nutrients
- **Theo dõi nước uống** với multiple input methods
- Daily goals với progress visualization
- Quick add foods với Vietnamese shortcuts

### 📈 **Biểu đồ và phân tích chi tiết**

- Progress charts cho ngày hiện tại
- Line charts xu hướng calories 7 ngày
- Bar charts protein tracking
- Pie charts phân bố macro nutrients
- Weekly/monthly summary reports

### ⚙️ **Quản lý cá nhân và cài đặt**

- Hồ sơ cá nhân (BMI, TDEE calculation)
- **Tính toán mục tiêu tự động** dựa trên thông tin cá nhân
- Cài đặt ứng dụng (notifications, theme, language)
- Biometric authentication toggle

## 🚀 Cài đặt và chạy ứng dụng

### Yêu cầu hệ thống

- **Node.js** >= 18.0.0
- **npm** hoặc **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **iOS Simulator** (macOS) hoặc **Android Studio** (Windows/Linux/macOS)

### 1. Clone repository

```bash
git clone https://github.com/your-username/vietnamese-nutrition-tracker.git
cd vietnamese-nutrition-tracker
```

### 2. Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
```

### 3. Thiết lập Firebase (Tùy chọn)

```bash
# Tạo file .env trong root directory
cp .env.example .env

# Cập nhật Firebase config trong .env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
```

### 4. Chạy ứng dụng

```bash
# Development mode
npx expo start

# Run on iOS
npx expo start --ios

# Run on Android
npx expo start --android

# Run on web
npx expo start --web
```

### 5. Testing

```bash
# Chạy tests
npm test

# Test Vietnamese food database
node test-food-database.js
```

## 📱 Platforms hỗ trợ

- ✅ **iOS** (iPhone, iPad)
- ✅ **Android** (Phone, Tablet)
- ✅ **Web** (Progressive Web App)
- 🔄 **Apple Watch** (Planned)

## 🛠️ Tech Stack

### Frontend

- **React Native** 0.75 với TypeScript
- **Expo SDK** 52 cho cross-platform development
- **React Navigation** cho routing
- **React Native Chart Kit** cho data visualization
- **Ionicons** cho icon system

### Backend & Services

- **Firebase Authentication** cho user management
- **AsyncStorage** cho local data persistence
- **Expo SecureStore** cho sensitive data
- **Expo Local Authentication** cho biometric auth

### Development Tools

- **TypeScript** cho type safety
- **ESLint** và **Prettier** cho code quality
- **Jest** cho unit testing
- **Expo Development Build** cho testing

## 📂 Cấu trúc project

```
vietnamese-nutrition-tracker/
├── app/                          # Main application code
│   ├── (tabs)/                   # Tab-based navigation screens
│   │   ├── index.tsx            # Home screen với nutrition overview
│   │   ├── add.tsx              # Add meal screen với Vietnamese food DB
│   │   ├── charts.tsx           # Charts & analytics screen
│   │   └── settings.tsx         # Settings & profile screen
│   ├── auth/                    # Authentication screens
│   │   ├── login.tsx            # Login với biometric support
│   │   ├── signup.tsx           # Signup với password strength
│   │   └── forgot-password.tsx  # Password reset flow
│   ├── components/              # Reusable UI components
│   │   ├── FoodDatabase.tsx     # Vietnamese food browser
│   │   ├── FoodSearch.tsx       # Advanced food search
│   │   ├── NutritionCard.tsx    # Nutrition display component
│   │   └── BiometricAuth.tsx    # Biometric authentication
│   ├── data/                    # Data layer
│   │   └── vietnameseFoods.ts   # Vietnamese food database (30+ dishes)
│   ├── services/                # Business logic services
│   │   └── nutritionAI.ts       # AI recommendation engine
│   ├── types/                   # TypeScript type definitions
│   └── utils/                   # Utility functions
├── assets/                      # Static assets (images, fonts)
├── docs/                        # Documentation
│   ├── AUTHENTICATION_README.md
│   ├── VIETNAMESE_FOOD_DATABASE_README.md
│   └── GRADUATION_PROJECT_PLAN.md
└── README.md
```

## 🎯 Roadmap & Graduation Project Features

### 🔥 Phase 1: AI Nutrition Intelligence (Weeks 1-3)

- [x] Smart meal recommendations
- [x] Nutrition deficiency detection
- [ ] **AI-powered meal suggestions** (In Progress)
- [ ] **Predictive health analytics** (Planned)

### 📱 Phase 2: Health Ecosystem Integration (Weeks 4-6)

- [ ] Apple Health / Google Fit integration
- [ ] Weight trend analysis với machine learning
- [ ] Exercise calories tracking
- [ ] Sleep quality correlation với nutrition

### 🔬 Phase 3: Vietnamese Medical Integration (Weeks 7-9)

- [ ] Ministry of Health nutrition guidelines integration
- [ ] Healthcare professional dashboard
- [ ] Medical condition-specific recommendations
- [ ] Patient monitoring system

### 📊 Phase 4: Advanced Analytics (Weeks 10-12)

- [ ] Research-grade nutrition reports
- [ ] Statistical correlation analysis
- [ ] Micronutrient deficiency detection
- [ ] Population health insights
- [ ] Academic data export (CSV, PDF)

### 🤖 Phase 5: Computer Vision AI (Weeks 13-15)

- [ ] Vietnamese food image recognition
- [ ] Automatic portion size estimation
- [ ] Real-time nutrition calculation từ camera
- [ ] AI-powered meal logging

## 🎓 Academic Contributions

### Research Value

- **Vietnamese Nutrition Database**: First comprehensive nutrition database for Vietnamese cuisine
- **AI-Powered Recommendations**: Machine learning algorithms for personalized Vietnamese diet
- **Healthcare Integration**: Medical-grade nutrition tracking với Vietnamese health standards
- **Cultural Preservation**: Digital preservation of Vietnamese dietary wisdom

### Technical Innovation

- **Cross-platform Mobile Health**: React Native với advanced health features
- **Computer Vision**: Food recognition AI trained trên Vietnamese cuisine
- **Data Science**: Advanced analytics cho nutrition research
- **Healthcare APIs**: Integration với medical systems

## 🤝 Contributing

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng đọc [CONTRIBUTING.md](CONTRIBUTING.md) để biết thêm chi tiết.

### Development Workflow

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📄 License

Project này được phân phối dưới MIT License. Xem [LICENSE](LICENSE) để biết thêm thông tin.

## 🙏 Acknowledgments

- **Vietnamese Ministry of Health** cho nutrition guidelines
- **Traditional Vietnamese cuisine experts** cho food database validation
- **React Native community** cho amazing development tools
- **Expo team** cho excellent development platform

## 📞 Contact & Support

- **Author**: [Your Name]
- **Email**: your.email@domain.com
- **University**: [Your University Name]
- **Supervisor**: [Supervisor Name]
- **Project Type**: Graduation Thesis - Computer Science

---

**🎯 Target**: Excellent Graduation Project (8.5-10.0 points)  
**📅 Timeline**: 15 weeks (June 2025 - September 2025)  
**🏆 Goal**: Production-ready AI-powered Vietnamese nutrition platform

---

> _"Preserving Vietnamese culinary culture through modern technology"_ 🇻🇳
