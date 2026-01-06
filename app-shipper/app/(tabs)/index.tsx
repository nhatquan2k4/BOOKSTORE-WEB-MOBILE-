import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
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
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import shipperOrderService, { ShipperOrder } from '@/services/shipperOrderService';

type OrderTab = 'available' | 'delivering';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OrderTab>('available');
  const [orders, setOrders] = useState<ShipperOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      let data: ShipperOrder[];
      
      if (activeTab === 'available') {
        data = await shipperOrderService.getConfirmedOrders();
      } else {
        data = await shipperOrderService.getMyShippingOrders();
      }
      
      setOrders(data);
    } catch (error: any) {
      console.error('[HomeScreen] Error loading orders:', error);
      // If no token or 401, navigate to login
      if (error?.code === 'NO_TOKEN' || error?.response?.status === 401) {
        // Redirect to login screen
        router.replace('/(auth)/login');
        return;
      }

      // Other errors: clear list and keep user on screen
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleAcceptOrder = async (orderId: string, event: any) => {
    event.stopPropagation();
    Alert.alert(
      'Nhận đơn hàng',
      'Bạn có chắc muốn nhận đơn hàng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Nhận đơn',
          onPress: async () => {
            try {
              await shipperOrderService.acceptAndStartDelivery(orderId);
              Alert.alert('Thành công', 'Đã nhận đơn hàng!');
              loadOrders(); // Reload list
            } catch (error) {
              console.error('Error accepting order:', error);
              Alert.alert('Lỗi', 'Không thể nhận đơn hàng');
            }
          },
        },
      ]
    );
  };

  const handleCompleteDelivery = async (orderId: string, event: any) => {
    event.stopPropagation();
    // When delivering COD orders, ask shipper to confirm cash collection before marking payment as paid
    Alert.alert(
      'Xác nhận giao hàng',
      'Đơn hàng đã giao thành công chứ? Bạn đã thu tiền khách (nếu COD)?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Chưa thu tiền',
          onPress: async () => {
            try {
              // Mark delivered without confirming payment
              await shipperOrderService.markAsDelivered(orderId, 'Đã giao (chưa thu tiền)');
              Alert.alert('Thành công', 'Đã cập nhật trạng thái giao hàng!');
              loadOrders();
            } catch (error) {
              console.error('Error completing delivery (no payment):', error);
              Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
            }
          },
        },
        {
          text: 'Đã thu tiền',
          onPress: async () => {
            try {
              // First confirm payment (for COD) then mark delivered
              await shipperOrderService.confirmCodPayment(orderId);
              await shipperOrderService.markAsDelivered(orderId, 'Đã giao và thu tiền');
              Alert.alert('Thành công', 'Đã cập nhật trạng thái và xác nhận thanh toán!');
              loadOrders();
            } catch (error) {
              console.error('Error completing delivery (with payment):', error);
              Alert.alert('Lỗi', 'Không thể cập nhật trạng thái hoặc xác nhận thanh toán');
            }
          },
        },
      ]
    );
  };

  const handleOrderPress = (order: ShipperOrder) => {
    router.push({
      pathname: '/(stack)/order-detail',
      params: { 
        orderId: order.id,
        orderData: JSON.stringify(order), // Pass full order data
      },
    });
  };

  const handleCallPhone = (phone: string, event: any) => {
    event.stopPropagation();
    Linking.openURL(`tel:${phone}`);
  };

  const handleNavigate = (order: ShipperOrder, event: any) => {
    event.stopPropagation();
    const address = `${order.address.street}, ${order.address.ward}, ${order.address.district}, ${order.address.province}`;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
  case 'Paid': return '#2196F3';
      case 'Confirmed': return '#2196F3';
      case 'Shipping': return '#4CAF50';
      case 'Delivered': return '#9E9E9E';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
  case 'Paid': return 'Chờ xác nhận';
      case 'Confirmed': return 'Sẵn sàng giao';
      case 'Shipping': return 'Đang giao';
      case 'Delivered': return 'Đã giao';
      default: return status;
    }
  };

  const renderOrderCard = ({ item }: { item: ShipperOrder }) => {
    const isAvailable = activeTab === 'available';
    
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => handleOrderPress(item)}
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderIdContainer}>
            <Ionicons name="receipt-outline" size={20} color="#E24A4A" />
            <Text style={styles.orderId}>#{item.orderNumber}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.customerInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color="#666" />
            <Text style={styles.customerName}>{item.address.recipientName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#666" />
            <TouchableOpacity onPress={(e) => handleCallPhone(item.address.phoneNumber, e)}>
              <Text style={[styles.customerPhone, { color: '#2196F3' }]}>{item.address.phoneNumber}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.address} numberOfLines={2}>
              {`${item.address.street}, ${item.address.ward}, ${item.address.district}, ${item.address.province}`}
            </Text>
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sản phẩm:</Text>
            <Text style={styles.detailValue}>{item.items.length} Quyển</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tổng tiền:</Text>
            <Text style={styles.totalAmount}>{item.finalAmount.toLocaleString('vi-VN')}₫</Text>
          </View>
        </View>

        {/* Order Date */}
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleString('vi-VN')}
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isAvailable ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.navigateButton]}
                onPress={(e) => handleNavigate(item, e)}
              >
                <Ionicons name="navigate-outline" size={20} color="#2196F3" />
                <Text style={styles.navigateButtonText}>Chỉ đường</Text>
              </TouchableOpacity>
              {(item.status === 'Confirmed' || item.status === 'Paid') && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={(e) => handleAcceptOrder(item.id, e)}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.acceptButtonText}>Nhận đơn</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.callButton]}
                onPress={(e) => handleCallPhone(item.address.phoneNumber, e)}
              >
                <Ionicons name="call-outline" size={20} color="#4CAF50" />
                <Text style={styles.callButtonText}>Gọi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.navigateButton]}
                onPress={(e) => handleNavigate(item, e)}
              >
                <Ionicons name="navigate-outline" size={20} color="#2196F3" />
                <Text style={styles.navigateButtonText}>Chỉ đường</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={(e) => handleCompleteDelivery(item.id, e)}
              >
                <Ionicons name="checkmark-done-circle" size={20} color="#fff" />
                <Text style={styles.completeButtonText}>Giao thành công</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
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
            <Text style={styles.subtitle}>
              {loading ? 'Đang tải...' : `Bạn có ${orders.length} đơn hàng ${activeTab === 'available' ? 'mới' : 'đang giao'}`}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/(tabs)/notification')}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Ionicons 
            name="list-outline" 
            size={20} 
            color={activeTab === 'available' ? '#E24A4A' : '#999'} 
          />
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            Đơn hàng mới
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'delivering' && styles.activeTab]}
          onPress={() => setActiveTab('delivering')}
        >
          <Ionicons 
            name="bicycle-outline" 
            size={20} 
            color={activeTab === 'delivering' ? '#E24A4A' : '#999'} 
          />
          <Text style={[styles.tabText, activeTab === 'delivering' && styles.activeTabText]}>
            Đang giao
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E24A4A" />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E24A4A']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {activeTab === 'available'
                  ? 'Chưa có đơn hàng mới'
                  : 'Bạn chưa có đơn hàng nào đang giao'}
              </Text>
            </View>
          }
        />
      )}
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
    paddingBottom: 20,
  },
  headerBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 8,
  },
  activeTab: {
    borderBottomColor: '#E24A4A',
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#E24A4A',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  customerInfo: {
    marginBottom: 16,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
  },
  address: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  orderDetails: {
    backgroundColor: '#F5F5F5',
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
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E24A4A',
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#E24A4A',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  navigateButton: {
    backgroundColor: '#E3F2FD',
  },
  navigateButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  callButton: {
    backgroundColor: '#E8F5E9',
  },
  callButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
