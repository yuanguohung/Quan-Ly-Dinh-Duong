import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color: string;
  backgroundColor?: string;
  label?: string;
  value?: string;
  target?: string;
  height?: number;
}

export default function ProgressBar({
  progress,
  color,
  backgroundColor = colors.border,
  label,
  value,
  target,
  height = 8
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {label && <Text style={styles.label}>{label}</Text>}
        {value && target && (
          <Text style={styles.value}>{value} / {target}</Text>
        )}
      </View>
      <View style={[styles.track, { backgroundColor, height }]}>
        <View 
          style={[
            styles.fill, 
            { 
              backgroundColor: color, 
              width: `${clampedProgress * 100}%`,
              height 
            }
          ]} 
        />
      </View>
      <Text style={styles.percentage}>{Math.round(clampedProgress * 100)}%</Text>
    </View>
  );
}

interface ProgressRingProps {
  progress: number; // 0 to 1
  size: number;
  color: string;
  backgroundColor?: string;
  label?: string;
  value?: string;
}

export function ProgressRing({
  progress,
  size,
  color,
  backgroundColor = colors.border,
  label,
  value
}: ProgressRingProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeWidth = 8;
  const center = size / 2;
  const radius = center - strokeWidth / 2;

  return (
    <View style={[styles.ringContainer, { width: size, height: size }]}>
      {/* Background circle */}
      <View 
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          }
        ]}
      />
      {/* Progress indicator - simplified as a circle with different opacity */}
      <View 
        style={[
          styles.circle,
          styles.progressCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            opacity: clampedProgress > 0.1 ? 1 : 0.3,
          }
        ]}
      />
      <View style={styles.ringContent}>
        {value && <Text style={styles.ringValue}>{value}</Text>}
        {label && <Text style={styles.ringLabel}>{label}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  value: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  track: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
  percentage: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  progressCircle: {
    transform: [{ rotate: '-90deg' }],
  },
  ringContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  ringLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
