import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleViewMonthlyDetails = () => {
    router.push('/earnings');
  };

  const handleMenuPress = (id: number) => {
    switch (id) {
      case 1:
        router.push('/(stack)/personal-info');
        break;
      case 2:
        router.push('/(stack)/bank-account');
        break;
      case 3:
        router.push('/(stack)/vehicle');
        break;
      case 4:
        router.push('/history');
        break;
      case 5:
        router.push('/earnings');
        break;
      case 6:
        router.push('/(stack)/settings');
        break;
      case 7:
        router.push('/(stack)/help');
        break;
    }
  };

  const menuItems = [
    { id: 1, icon: 'person-outline', title: 'Thông tin cá nhân', color: '#2196F3' },
    { id: 2, icon: 'card-outline', title: 'Tài khoản ngân hàng', color: '#4CAF50' },
    { id: 3, icon: 'bicycle-outline', title: 'Phương tiện', color: '#FF9800' },
    { id: 4, icon: 'document-text-outline', title: 'Lịch sử giao hàng', color: '#9C27B0' },
    { id: 5, icon: 'wallet-outline', title: 'Thu nhập', color: '#E91E63' },
    { id: 6, icon: 'settings-outline', title: 'Cài đặt', color: '#607D8B' },
    { id: 7, icon: 'help-circle-outline', title: 'Trợ giúp', color: '#00BCD4' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
                style={styles.avatar}
              />
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Nguyễn Văn Shipper</Text>
              <Text style={styles.userPhone}>0901234567</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>4.9</Text>
                <Text style={styles.ratingCount}>(128 đánh giá)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
            </View>
            <Text style={styles.statValue}>245</Text>
            <Text style={styles.statLabel}>Đơn hoàn thành</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="trending-up" size={28} color="#2196F3" />
            </View>
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statLabel}>Thành công</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="cash" size={28} color="#FF9800" />
            </View>
            <Text style={styles.statValue}>45M</Text>
            <Text style={styles.statLabel}>Tổng thu nhập</Text>
          </View>
        </View>

        {/* This Month Stats */}
        <View style={styles.monthlyStats}>
          <View style={styles.monthlyHeader}>
            <Text style={styles.monthlyTitle}>Tháng này</Text>
            <TouchableOpacity onPress={handleViewMonthlyDetails}>
              <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.monthlyContent}>
            <View style={styles.monthlyItem}>
              <View style={styles.monthlyItemHeader}>
                <Ionicons name="cube-outline" size={20} color="#666" />
                <Text style={styles.monthlyItemLabel}>Đơn hàng</Text>
              </View>
              <Text style={styles.monthlyItemValue}>32</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.monthlyItem}>
              <View style={styles.monthlyItemHeader}>
                <Ionicons name="wallet-outline" size={20} color="#666" />
                <Text style={styles.monthlyItemLabel}>Thu nhập</Text>
              </View>
              <Text style={styles.monthlyItemValue}>5.8M</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.id)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#E24A4A" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Phiên bản 2.0.1</Text>

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#E24A4A',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  ratingCount: {
    fontSize: 12,
    color: '#999',
  },
  editButton: {
    padding: 8,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  monthlyStats: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthlyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthlyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#E24A4A',
    fontWeight: '600',
  },
  monthlyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthlyItem: {
    flex: 1,
  },
  monthlyItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  monthlyItemLabel: {
    fontSize: 14,
    color: '#666',
  },
  monthlyItemValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E24A4A',
  },
  logoutText: {
    fontSize: 16,
    color: '#E24A4A',
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 20,
  },
});
