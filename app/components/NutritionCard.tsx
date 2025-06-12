import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

interface NutritionCardProps {
  title: string;
  value: number;
  target: number;
  unit: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export default function NutritionCard({
  title,
  value,
  target,
  unit,
  color,
  icon,
  onPress
}: NutritionCardProps) {
  const progress = target > 0 ? Math.min(value / target, 1) : 0;
  const percentage = Math.round(progress * 100);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.value, { color }]}>
          {value.toFixed(0)}
        </Text>
        <Text style={styles.unit}>/ {target}{unit}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressTrack, { backgroundColor: color + '20' }]}>
          <View 
            style={[
              styles.progressFill,
              { 
                backgroundColor: color,
                width: `${percentage}%`
              }
            ]}
          />
        </View>
        <Text style={styles.percentage}>{percentage}%</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentage: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    minWidth: 28,
    textAlign: 'right',
  },
});
