// app/_layout.tsx
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState, createContext, useContext } from 'react';
import { auth } from '@/firebaseConfig';
import { ActivityIndicator, View, Text } from 'react-native';
import { colors } from '@/constants/colors';
import { UserProvider } from '@/contexts/UserContext';
import { MealProvider } from '@/contexts/MealContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Tạo Context để quản lý trạng thái xác thực
const AuthContext = createContext<{ user: any; loading: boolean }>({ user: null, loading: true });

// Provider cho AuthContext
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return unsubscribe; // Hủy đăng ký listener khi component unmount
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook tùy chỉnh để sử dụng AuthContext
const useAuth = () => useContext(AuthContext);

export default function RootLayout() {
  return (
    <ThemeProvider>
      <UserProvider>
        {/* <MealProvider> */}
          <AuthProvider>
            <RootLayoutNavigator />
          </AuthProvider>
        {/* </MealProvider> */}
      </UserProvider>
    </ThemeProvider>
  );
}

function RootLayoutNavigator() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Điều hướng dựa trên trạng thái đăng nhập - LUÔN gọi hooks trước khi return
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Chưa đăng nhập, điều hướng đến login
        router.replace('/auth/login');
      } else {
        // Đã đăng nhập, điều hướng đến tabs
        router.replace('/(tabs)');
      }
    }
  }, [user, loading, router]);

  // Hiển thị loading screen với design đẹp khi đang kiểm tra trạng thái đăng nhập
  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.background 
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ 
          marginTop: 16, 
          fontSize: 16, 
          color: colors.textSecondary,
          fontWeight: '500'
        }}>
          Đang tải...
        </Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Auth routes */}
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/signup" />
      <Stack.Screen name="auth/forgot-password" />
      {/* Protected routes */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}