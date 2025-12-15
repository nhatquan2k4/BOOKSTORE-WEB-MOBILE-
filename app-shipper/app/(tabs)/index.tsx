import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock data cho đơn hàng
const initialOrders = [
  {
    id: 'ORD001',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    shopName: 'Nhà sách Văn Hóa',
    shopAddress: '50 Nguyễn Thị Minh Khai, Q.1, TP.HCM',
    shopPhone: '0283822456',
    deliveryAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    orderDate: '2024-01-15 09:30',
    totalAmount: 450000,
    shippingFee: 25000,
    status: 'new', // new, accepted, picking_up, picked_up, delivering, completed, cancelled
    paymentStatus: 'paid', // Khách đã thanh toán 100%
    items: [
      { id: 1, name: 'Đắc Nhân Tâm', quantity: 2, price: 125000, image: 'https://via.placeholder.com/80' },
      { id: 2, name: 'Nhà Giả Kim', quantity: 1, price: 200000, image: 'https://via.placeholder.com/80' },
    ],
    pickupDistance: '1.5 km',
    deliveryDistance: '2.5 km',
    estimatedPickupTime: '10 phút',
    estimatedDeliveryTime: '15 phút',
    notes: 'Giao trước 12h trưa',
  },
  {
    id: 'ORD002',
    customerName: 'Trần Thị B',
    customerPhone: '0912345678',
    shopName: 'Nhà sách Fahasa',
    shopAddress: '60-62 Lê Lợi, Q.1, TP.HCM',
    shopPhone: '0283829966',
    deliveryAddress: '456 Lê Lợi, Quận 3, TP.HCM',
    orderDate: '2024-01-15 10:00',
    totalAmount: 320000,
    shippingFee: 20000,
    status: 'picking_up',
    paymentStatus: 'paid',
    items: [
      { id: 1, name: 'Sapiens', quantity: 1, price: 320000, image: 'https://via.placeholder.com/80' },
    ],
    pickupDistance: '0.8 km',
    deliveryDistance: '1.2 km',
    estimatedPickupTime: '5 phút',
    estimatedDeliveryTime: '8 phút',
    notes: '',
  },
  {
    id: 'ORD003',
    customerName: 'Lê Văn C',
    customerPhone: '0923456789',
    shopName: 'Nhà sách Phương Nam',
    shopAddress: '20 Đinh Tiên Hoàng, Q.1, TP.HCM',
    shopPhone: '0283910724',
    deliveryAddress: '789 Võ Văn Tần, Quận 3, TP.HCM',
    orderDate: '2024-01-15 10:15',
    totalAmount: 580000,
    shippingFee: 30000,
    status: 'new',
    paymentStatus: 'paid',
    items: [
      { id: 1, name: 'Thinking Fast and Slow', quantity: 1, price: 280000, image: 'https://via.placeholder.com/80' },
      { id: 2, name: 'Atomic Habits', quantity: 1, price: 300000, image: 'https://via.placeholder.com/80' },
    ],
    pickupDistance: '2.0 km',
    deliveryDistance: '3.8 km',
    estimatedPickupTime: '12 phút',
    estimatedDeliveryTime: '20 phút',
    notes: 'Gọi trước khi đến',
  },
  {
    id: 'ORD004',
    customerName: 'Phạm Thị D',
    customerPhone: '0934567890',
    shopName: 'Nhà sách Văn Hóa',
    shopAddress: '50 Nguyễn Thị Minh Khai, Q.1, TP.HCM',
    shopPhone: '0283822456',
    deliveryAddress: '12 Pasteur, Quận 1, TP.HCM',
    orderDate: '2024-01-15 11:00',
    totalAmount: 195000,
    shippingFee: 15000,
    status: 'delivering',
    paymentStatus: 'paid',
    items: [
      { id: 1, name: 'Tuổi Trẻ Đáng Giá Bao Nhiêu', quantity: 1, price: 95000, image: 'https://via.placeholder.com/80' },
      { id: 2, name: 'Cà Phê Cùng Tony', quantity: 1, price: 100000, image: 'https://via.placeholder.com/80' },
    ],
    pickupDistance: '1.5 km',
    deliveryDistance: '0.5 km',
    estimatedPickupTime: '8 phút',
    estimatedDeliveryTime: '5 phút',
    notes: '',
  },
];

type OrderStatus = 'all' | 'new' | 'accepted' | 'picking_up' | 'picked_up' | 'delivering' | 'completed';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');
  const [orders, setOrders] = useState(initialOrders);

  const handleOrderPress = (orderId: string) => {
    router.push(`/(stack)/order-detail?id=${orderId}`);
  };

  const handleAcceptOrder = (orderId: string, event: any) => {
    event.stopPropagation();
    Alert.alert(
      'Nhận đơn hàng',
      `Bạn có chắc muốn nhận đơn hàng #${orderId}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Nhận đơn',
          onPress: () => {
            setOrders(prev =>
              prev.map(o => (o.id === orderId ? { ...o, status: 'picking_up' } : o))
            );
            Alert.alert('Thành công', 'Bạn đã nhận đơn hàng!');
          },
        },
      ]
    );
  };

  const handleCallPhone = (phone: string, event: any) => {
    event.stopPropagation();
    Linking.openURL(`tel:${phone}`);
  };

  const handleNavigate = (orderId: string, event: any) => {
    event.stopPropagation();
    router.push(`/(stack)/map-navigation?id=${orderId}`);
  };

  const getFilteredOrders = () => {
    if (selectedStatus === 'all') return orders;
    return orders.filter(order => order.status === selectedStatus);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#2196F3';
      case 'accepted': return '#9C27B0';
      case 'picking_up': return '#FF9800';
      case 'picked_up': return '#FFC107';
      case 'delivering': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Đơn mới';
      case 'accepted': return 'Đã nhận';
      case 'picking_up': return 'Đang lấy hàng';
      case 'picked_up': return 'Đã lấy hàng';
      case 'delivering': return 'Đang giao';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Header */}
      <View style={[styles.headerBannerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerBannerOverlay} />
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>Xin chào, Shipper!</Text>
            <Text style={styles.subtitle}>Bạn có {orders.filter(o => o.status === 'new').length} đơn hàng mới</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/(tabs)/notification')}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Status */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {(['all', 'new', 'picking_up', 'delivering', 'completed'] as OrderStatus[]).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                selectedStatus === status && styles.filterChipActive,
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text style={[
                styles.filterChipText,
                selectedStatus === status && styles.filterChipTextActive,
              ]}>
                {status === 'all' ? 'Tất cả' : getStatusText(status)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <FlatList
        data={getFilteredOrders()}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => handleOrderPress(item.id)}
          >
            {/* Order Header */}
            <View style={styles.orderHeader}>
              <View style={styles.orderIdContainer}>
                <Ionicons name="receipt-outline" size={20} color="#E24A4A" />
                <Text style={styles.orderId}>{item.id}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusText(item.status)}
                </Text>
              </View>
            </View>

            {/* Shop & Customer Info */}
            <View style={styles.customerInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="storefront-outline" size={18} color="#E24A4A" />
                <Text style={styles.shopName}>{item.shopName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={18} color="#666" />
                <Text style={styles.customerName}>{item.customerName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={18} color="#666" />
                <Text style={styles.address} numberOfLines={2}>{item.deliveryAddress}</Text>
              </View>
            </View>

            {/* Order Details */}
            <View style={styles.orderDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sản phẩm:</Text>
                <Text style={styles.detailValue}>{item.items.length} món</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tổng tiền:</Text>
                <Text style={styles.totalAmount}>{item.totalAmount.toLocaleString('vi-VN')}đ</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phí ship:</Text>
                <Text style={styles.shippingFee}>+{item.shippingFee.toLocaleString('vi-VN')}đ</Text>
              </View>
            </View>

            {/* Distance & Time */}
            <View style={styles.distanceInfo}>
              <View style={styles.distanceItem}>
                <Ionicons name="basket-outline" size={16} color="#FF9800" />
                <Text style={styles.distanceText}>Lấy: {item.pickupDistance}</Text>
              </View>
              <View style={styles.distanceItem}>
                <Ionicons name="navigate-outline" size={16} color="#4CAF50" />
                <Text style={styles.distanceText}>Giao: {item.deliveryDistance}</Text>
              </View>
              <View style={styles.distanceItem}>
                <Ionicons name="time-outline" size={16} color="#2196F3" />
                <Text style={styles.distanceText}>~{item.estimatedDeliveryTime}</Text>
              </View>
            </View>

            {/* Notes */}
            {item.notes && (
              <View style={styles.notesContainer}>
                <Ionicons name="alert-circle-outline" size={16} color="#FF9800" />
                <Text style={styles.notesText}>{item.notes}</Text>
              </View>
            )}

            {/* Action Buttons */}
            {item.status === 'new' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={(e) => handleAcceptOrder(item.id, e)}
                >
                  <Text style={styles.acceptButtonText}>Nhận đơn</Text>
                </TouchableOpacity>
              </View>
            )}
            {item.status === 'picking_up' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.callButton}
                  onPress={(e) => handleCallPhone(item.shopPhone, e)}
                >
                  <Ionicons name="call" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.navigateButton}
                  onPress={(e) => handleNavigate(item.id, e)}
                >
                  <Ionicons name="navigate" size={18} color="#fff" />
                  <Text style={styles.navigateButtonText}>Đến shop</Text>
                </TouchableOpacity>
              </View>
            )}
            {item.status === 'delivering' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.callButton}
                  onPress={(e) => handleCallPhone(item.customerPhone, e)}
                >
                  <Ionicons name="call" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.navigateButton}
                  onPress={(e) => handleNavigate(item.id, e)}
                >
                  <Ionicons name="navigate" size={18} color="#fff" />
                  <Text style={styles.navigateButtonText}>Đến khách</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="file-tray-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerBannerContainer: {
    backgroundColor: '#E24A4A',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerBannerOverlay: {
    display: 'none',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FFD700',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#E24A4A',
    fontSize: 10,
    fontWeight: 'bold',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#E24A4A',
    borderColor: '#E24A4A',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  ordersList: {
    padding: 15,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  customerInfo: {
    marginBottom: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  shopName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E24A4A',
    flex: 1,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
  },
  address: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  orderDetails: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    color: '#E24A4A',
    fontWeight: 'bold',
  },
  shippingFee: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  distanceInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  distanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceText: {
    fontSize: 13,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  callButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigateButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
