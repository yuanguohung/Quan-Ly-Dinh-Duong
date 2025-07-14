export interface ColorScheme {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  background: string;
  backgroundSecondary: string;
  card: string;
  cardSecondary: string;
  text: string;
  textSecondary: string;
  textLight: string;
  border: string;
  borderDark: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  shadow: string;
  // Nutrition specific colors
  protein: string;
  carbs: string;
  fat: string;
  calories: string;
}

export const lightColors: ColorScheme = {
  primary: "#4C9F38",          // Green for nutrition/health theme
  primaryDark: "#2E7D32",      // Darker green
  primaryLight: "#81C784",     // Light green
  secondary: "#FF7043",        // Orange accent
  background: "#FFFFFF",       // White background
  backgroundSecondary: "#F8F9FA", // Light gray background
  card: "#FFFFFF",             // White cards with shadow
  cardSecondary: "#E8F5E8",    // Light green cards
  text: "#2D3748",             // Dark gray text
  textSecondary: "#718096",    // Medium gray text
  textLight: "#A0AEC0",        // Light gray text
  border: "#E2E8F0",           // Light border
  borderDark: "#CBD5E0",       // Medium border
  success: "#48BB78",          // Success green
  warning: "#ED8936",          // Warning orange
  error: "#E53E3E",            // Error red
  info: "#3182CE",             // Info blue
  shadow: "#000000",           // Shadow color
  // Nutrition specific colors
  protein: "#8B5CF6",          // Purple for protein
  carbs: "#F59E0B",            // Amber for carbs
  fat: "#EF4444",              // Red for fats
  calories: "#10B981",         // Emerald for calories
};

export const darkColors: ColorScheme = {
  primary: "#4C9F38",          // Keep green for consistency
  primaryDark: "#2E7D32",      // Darker green
  primaryLight: "#81C784",     // Light green
  secondary: "#FF7043",        // Orange accent
  background: "#1A202C",       // Dark background
  backgroundSecondary: "#2D3748", // Dark gray background
  card: "#2D3748",             // Dark cards
  cardSecondary: "#234E2D",    // Dark green cards
  text: "#F7FAFC",             // Light text
  textSecondary: "#CBD5E0",    // Light gray text
  textLight: "#718096",        // Medium gray text
  border: "#4A5568",           // Dark border
  borderDark: "#2D3748",       // Darker border
  success: "#48BB78",          // Success green
  warning: "#ED8936",          // Warning orange
  error: "#E53E3E",            // Error red
  info: "#3182CE",             // Info blue
  shadow: "#000000",           // Shadow color
  // Nutrition specific colors
  protein: "#A78BFA",          // Lighter purple for protein
  carbs: "#FCD34D",            // Lighter amber for carbs
  fat: "#F87171",              // Lighter red for fats
  calories: "#34D399",         // Lighter emerald for calories
};

// Default export for backward compatibility
export const colors = lightColors;
  