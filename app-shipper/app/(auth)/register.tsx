import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleContactAdmin = (type: 'phone' | 'email') => {
    if (type === 'phone') {
      Linking.openURL('tel:1900xxxx');
    } else {
      Linking.openURL('mailto:admin@bookstore.com?subject=Đăng ký tài khoản Shipper');
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng ký tài khoản</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-add" size={60} color="#0a7ea4" />
          </View>
          
          <Text style={styles.title}>Đăng ký tài khoản Shipper</Text>
          <Text style={styles.description}>
            Để trở thành shipper của Bookstore, vui lòng liên hệ quản trị viên để được cấp tài khoản và hướng dẫn sử dụng ứng dụng.
          </Text>
        </View>

        {/* Requirements Section */}
        <View style={styles.requirementsSection}>
          <Text style={styles.sectionTitle}>Yêu cầu để trở thành Shipper:</Text>
          
          <View style={styles.requirementItem}>
            <View style={styles.requirementIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#0a7ea4" />
            </View>
            <Text style={styles.requirementText}>
              Từ 18 tuổi trở lên, có CMND/CCCD hợp lệ
            </Text>
          </View>

          <View style={styles.requirementItem}>
            <View style={styles.requirementIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#0a7ea4" />
            </View>
            <Text style={styles.requirementText}>
              Có phương tiện giao hàng (xe máy, xe đạp)
            </Text>
          </View>

          <View style={styles.requirementItem}>
            <View style={styles.requirementIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#0a7ea4" />
            </View>
            <Text style={styles.requirementText}>
              Có điện thoại thông minh và biết sử dụng ứng dụng
            </Text>
          </View>

          <View style={styles.requirementItem}>
            <View style={styles.requirementIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#0a7ea4" />
            </View>
            <Text style={styles.requirementText}>
              Có tinh thần trách nhiệm và thái độ phục vụ tốt
            </Text>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ:</Text>
          
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={() => handleContactAdmin('phone')}
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="call" size={24} color="#0a7ea4" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Hotline</Text>
              <Text style={styles.contactValue}>1900-xxxx</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactCard}
            onPress={() => handleContactAdmin('email')}
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="mail" size={24} color="#0a7ea4" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>admin@bookstore.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.contactCard}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="time" size={24} color="#0a7ea4" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Thời gian làm việc</Text>
              <Text style={styles.contactValue}>8:00 - 17:00 (T2 - T6)</Text>
            </View>
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Quyền lợi khi làm việc:</Text>
          
          <View style={styles.benefitItem}>
            <Ionicons name="cash" size={20} color="#0a7ea4" />
            <Text style={styles.benefitText}>Thu nhập hấp dẫn theo số đơn hàng</Text>
          </View>

          <View style={styles.benefitItem}>
            <Ionicons name="calendar" size={20} color="#0a7ea4" />
            <Text style={styles.benefitText}>Linh hoạt thời gian làm việc</Text>
          </View>

          <View style={styles.benefitItem}>
            <Ionicons name="school" size={20} color="#0a7ea4" />
            <Text style={styles.benefitText}>Được đào tạo và hỗ trợ kỹ thuật</Text>
          </View>

          <View style={styles.benefitItem}>
            <Ionicons name="shield-checkmark" size={20} color="#0a7ea4" />
            <Text style={styles.benefitText}>Bảo hiểm tai nạn trong quá trình làm việc</Text>
          </View>
        </View>

        {/* Back to Login Button */}
        <TouchableOpacity
          style={styles.backToLoginButton}
          onPress={handleBackToLogin}
        >
          <Text style={styles.backToLoginText}>Quay lại đăng nhập</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11181C',
  },
  scrollContent: {
    padding: 24,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e6f5f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#11181C',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#687076',
    textAlign: 'center',
    lineHeight: 22,
  },
  requirementsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requirementIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  requirementText: {
    flex: 1,
    fontSize: 15,
    color: '#687076',
    lineHeight: 22,
  },
  contactSection: {
    marginBottom: 32,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e6f5f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 13,
    color: '#687076',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
  },
  benefitsSection: {
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    color: '#687076',
    marginLeft: 12,
  },
  backToLoginButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  backToLoginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
