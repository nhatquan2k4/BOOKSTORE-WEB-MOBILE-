import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data lịch sử giao hàng
const mockHistory = [
  {
    id: 'ORD012',
    date: '15/01/2024',
    time: '14:30',
    customerName: 'Nguyễn Văn A',
    deliveryAddress: '123 Nguyễn Huệ, Q.1, TP.HCM',
    totalAmount: 450000,
    shippingFee: 25000,
    status: 'completed',
    rating: 5,
  },
  {
    id: 'ORD011',
    date: '15/01/2024',
    time: '11:20',
    customerName: 'Trần Thị B',
    deliveryAddress: '456 Lê Lợi, Q.3, TP.HCM',
    totalAmount: 320000,
    shippingFee: 20000,
    status: 'failed',
    rating: 0,
  },
  {
    id: 'ORD010',
    date: '14/01/2024',
    time: '16:45',
    customerName: 'Lê Văn C',
    deliveryAddress: '789 Võ Văn Tần, Q.3, TP.HCM',
    totalAmount: 580000,
    shippingFee: 30000,
    status: 'completed',
    rating: 4,
  },
  {
    id: 'ORD009',
    date: '14/01/2024',
    time: '14:10',
    customerName: 'Phạm Thị D',
    deliveryAddress: '12 Pasteur, Q.1, TP.HCM',
    totalAmount: 195000,
    shippingFee: 15000,
    status: 'cancelled',
    rating: 0,
  },
  {
    id: 'ORD008',
    date: '13/01/2024',
    time: '10:30',
    customerName: 'Hoàng Văn E',
    deliveryAddress: '234 Điện Biên Phủ, Q.3, TP.HCM',
    totalAmount: 750000,
    shippingFee: 35000,
    status: 'completed',
    rating: 5,
  },
  {
    id: 'ORD007',
    date: '13/01/2024',
    time: '09:15',
    customerName: 'Ngô Thị F',
    deliveryAddress: '567 Nguyễn Đình Chiểu, Q.1, TP.HCM',
    totalAmount: 420000,
    shippingFee: 22000,
    status: 'completed',
    rating: 4,
  },
];

type FilterPeriod = 'today' | 'week' | 'month' | 'all';

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'completed':
      return {
        label: 'Giao thành công',
        color: '#4CAF50',
        bgColor: '#E8F5E9',
        icon: 'checkmark-circle' as const,
      };
    case 'failed':
      return {
        label: 'Giao thất bại',
        color: '#F44336',
        bgColor: '#FFEBEE',
        icon: 'close-circle' as const,
      };
    case 'cancelled':
      return {
        label: 'Đã hủy',
        color: '#FF9800',
        bgColor: '#FFF3E0',
        icon: 'ban' as const,
      };
    default:
      return {
        label: 'Không xác định',
        color: '#9E9E9E',
        bgColor: '#F5F5F5',
        icon: 'help-circle' as const,
      };
  }
};

export default function HistoryScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>('today');

  const getFilteredOrders = () => {
    const today = new Date();
    const todayStr = today.toLocaleDateString('vi-VN');
    
    switch (selectedPeriod) {
      case 'today':
        return mockHistory.filter(order => order.date === '15/01/2024'); // Mock today
      case 'week':
        return mockHistory.filter((_, index) => index < 4); // Last 7 days
      case 'month':
        return mockHistory;
      case 'all':
        return mockHistory;
      default:
        return mockHistory;
    }
  };

  const calculateStats = () => {
    const orders = getFilteredOrders();
    const totalOrders = orders.length;
    const totalEarnings = orders.reduce((sum, order) => sum + order.shippingFee, 0);
    const avgRating = orders.length > 0 
      ? orders.reduce((sum, order) => sum + order.rating, 0) / orders.length 
      : 0;

    return { totalOrders, totalEarnings, avgRating };
  };

  const stats = calculateStats();

  const handleOrderPress = (orderId: string) => {
    router.push({
      pathname: '/(stack)/order-detail',
      params: { orderId },
    });
  };

  const renderOrderCard = ({ item }: { item: typeof mockHistory[0] }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => handleOrderPress(item.id)}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderIdRow}>
            <Ionicons name="receipt-outline" size={20} color="#E24A4A" />
            <Text style={styles.orderId}>{item.id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

      <View style={styles.orderContent}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.customerName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.addressText} numberOfLines={1}>
            {item.deliveryAddress}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {item.date} • {item.time}
          </Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Tổng đơn:</Text>
          <Text style={styles.totalAmount}>
            {item.totalAmount.toLocaleString('vi-VN')}đ
          </Text>
        </View>
        {item.status === 'completed' ? (
          <View style={styles.earningContainer}>
            <Text style={styles.earningLabel}>Thu nhập:</Text>
            <Text style={styles.earningValue}>
              +{item.shippingFee.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        ) : (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFB800" />
            <Text style={styles.ratingText}>{item.rating}.0</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch sử giao hàng</Text>
      </View>

      {/* Period Filter */}
      <View style={styles.filterContainer}>
        {(['today', 'week', 'month', 'all'] as FilterPeriod[]).map((period, index) => (
          <React.Fragment key={period}>
            <TouchableOpacity
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.filterLink,
                  selectedPeriod === period && styles.filterLinkActive,
                ]}
              >
                {period === 'today' && 'Hôm nay'}
                {period === 'week' && 'Tuần này'}
                {period === 'month' && 'Tháng này'}
                {period === 'all' && 'Tất cả'}
              </Text>
            </TouchableOpacity>
            {index < 3 && <Text style={styles.filterSeparator}>•</Text>}
          </React.Fragment>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={getFilteredOrders()}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterLinkActive: {
    color: '#E24A4A',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  filterSeparator: {
    fontSize: 14,
    color: '#CCC',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFB800',
  },
  orderContent: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amountLabel: {
    fontSize: 13,
    color: '#666',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  earningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  earningLabel: {
    fontSize: 13,
    color: '#666',
  },
  earningValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
