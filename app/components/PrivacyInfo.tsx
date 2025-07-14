import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useUser } from '@/contexts/UserContext';

interface PrivacyInfoProps {
  onClose?: () => void;
}

export default function PrivacyInfo({ onClose }: PrivacyInfoProps) {
  const { user } = useUser();

  const showSecurityInfo = () => {
    Alert.alert(
      '🔒 Tính riêng tư & Bảo mật',
      `
✅ DỮ LIỆU CỦA BẠN ĐƯỢC BẢO VỆ:

🔐 Tài khoản riêng biệt hoàn toàn
• Mỗi user có một ID duy nhất (UID)
• Không ai có thể truy cập dữ liệu của bạn
• Mọi thông tin được mã hóa

📊 Dữ liệu cá nhân:
• Profile, mục tiêu, thống kê
• Chỉ bạn mới có thể xem và chỉnh sửa
• Không chia sẻ với user khác

🛡️ Bảo mật Firebase:
• Authentication bắt buộc
• Security Rules nghiêm ngặt
• Firestore Rules kiểm soát truy cập

👤 Tài khoản hiện tại: ${user?.email}
🆔 User ID: ${user?.uid?.substring(0, 8)}...

Bạn có thể yên tâm rằng dữ liệu của mình được bảo vệ tuyệt đối!
      `,
      [{ text: 'Hiểu rồi', style: 'default' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={24} color={colors.success} />
        <Text style={styles.title}>Bảo mật & Riêng tư</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.infoItem}>
          <Ionicons name="person" size={16} color={colors.primary} />
          <Text style={styles.infoText}>Tài khoản riêng biệt hoàn toàn</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="lock-closed" size={16} color={colors.primary} />
          <Text style={styles.infoText}>Dữ liệu được mã hóa và bảo vệ</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="eye-off" size={16} color={colors.primary} />
          <Text style={styles.infoText}>Không ai khác có thể xem profile của bạn</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="server" size={16} color={colors.primary} />
          <Text style={styles.infoText}>Firebase Security Rules bảo vệ</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.detailButton} onPress={showSecurityInfo}>
        <Text style={styles.detailText}>Xem chi tiết bảo mật</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </TouchableOpacity>

      <View style={styles.userInfo}>
        <Text style={styles.userInfoText}>
          📧 {user?.email}
        </Text>
        <Text style={styles.userIdText}>
          🆔 ID: {user?.uid?.substring(0, 12)}...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  content: {
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 4,
  },
  userInfo: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userIdText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
});
