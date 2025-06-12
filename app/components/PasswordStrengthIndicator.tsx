// app/components/PasswordStrengthIndicator.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const getPasswordStrength = (password: string) => {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Ít nhất 8 ký tự');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Chữ thường');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Chữ hoa');
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Số');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Ký tự đặc biệt');
    }

    let strength = 'Rất yếu';
    let color = colors.error;
    
    if (score >= 5) {
      strength = 'Rất mạnh';
      color = colors.success;
    } else if (score >= 4) {
      strength = 'Mạnh';
      color = colors.success;
    } else if (score >= 3) {
      strength = 'Trung bình';
      color = colors.warning;
    } else if (score >= 2) {
      strength = 'Yếu';
      color = colors.warning;
    }

    return { score, strength, color, feedback };
  };

  if (!password) return null;

  const { score, strength, color, feedback } = getPasswordStrength(password);

  return (
    <View style={styles.container}>
      <View style={styles.strengthHeader}>
        <Text style={styles.label}>Độ mạnh mật khẩu:</Text>
        <Text style={[styles.strengthText, { color }]}>{strength}</Text>
      </View>
      
      <View style={styles.progressBar}>
        {[1, 2, 3, 4, 5].map((level) => (
          <View
            key={level}
            style={[
              styles.progressSegment,
              { backgroundColor: level <= score ? color : colors.border }
            ]}
          />
        ))}
      </View>

      {feedback.length > 0 && (
        <View style={styles.feedback}>
          <Text style={styles.feedbackTitle}>Cần thêm:</Text>
          {feedback.map((item, index) => (
            <Text key={index} style={styles.feedbackItem}>• {item}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  strengthText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  feedback: {
    marginTop: 8,
  },
  feedbackTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  feedbackItem: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 2,
  },
});
