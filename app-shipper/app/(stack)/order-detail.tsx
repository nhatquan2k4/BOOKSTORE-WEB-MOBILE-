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
  Linking,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

// Mock order data với thông tin CHUẨN HÀ NỘI
const mockOrderDetail = {
  id: 'ORD001',
  orderDate: '15/01/2024 09:30',
  
  // Thông tin shop (điểm lấy hàng) - Tại Cầu Giấy
  shopName: 'Nhà sách Nhã Nam',
  shopAddress: '59 Đỗ Quang, Trung Hoà, Cầu Giấy, Hà Nội',
  shopPhone: '02437564321', // Mã vùng 024 (Hà Nội)
  shopCoordinates: { lat: 21.009059, lng: 105.803189 }, // Tọa độ Hà Nội
  
  // Thông tin khách hàng (điểm giao hàng) - Tại Hoàn Kiếm
  customerName: 'Nguyễn Văn An',
  customerPhone: '0988123456',
  deliveryAddress: '40 P. Nhà Chung, Hàng Trống, Hoàn Kiếm, Hà Nội',
  deliveryCoordinates: { lat: 21.028795, lng: 105.849265 }, // Tọa độ Hà Nội
  
  // Thông tin đơn hàng
  items: [
    { 
      id: 1, 
      name: 'Hà Nội Băm Sáu Phố Phường', 
      quantity: 1, 
      price: 85000,
      image: 'https://via.placeholder.com/80',
    },
    { 
      id: 2, 
      name: 'Thương Nhớ Mười Hai', 
      quantity: 1, 
      price: 120000,
      image: 'https://via.placeholder.com/80',
    },
  ],
  totalAmount: 205000,
  shippingFee: 30000,
  paymentStatus: 'paid', // Khách đã thanh toán 100%
  paymentMethod: 'Chuyển khoản',
  
  // Thông tin giao hàng
  pickupDistance: '2.5 km',
  deliveryDistance: '5.2 km',
  estimatedPickupTime: '10 phút',
  estimatedDeliveryTime: '25 phút',
  notes: 'Giao hàng giờ hành chính. Đến sảnh tòa nhà gọi tôi xuống lấy.',
  
  // Trạng thái: new, accepted, picking_up, picked_up, delivering, completed, cancelled
  status: 'accepted',
  
  // Timeline
  timeline: [
    { status: 'created', time: '15/01/2024 09:30', label: 'Đơn hàng được tạo' },
    { status: 'accepted', time: '15/01/2024 09:35', label: 'Shipper nhận đơn' },
  ],
};

export default function OrderDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [orderStatus, setOrderStatus] = useState(mockOrderDetail.status);
  const [timeline, setTimeline] = useState(mockOrderDetail.timeline);
  const [pickupProof, setPickupProof] = useState<string | null>(null);
  const [deliveryProof, setDeliveryProof] = useState<string | null>(null);

  // Xử lý gọi điện
  const handleCallCustomer = () => {
    Linking.openURL(`tel:${mockOrderDetail.customerPhone}`);
  };

  const handleCallShop = () => {
    Linking.openURL(`tel:${mockOrderDetail.shopPhone}`);
  };

  // Xử lý chỉ đường (Sử dụng Google Maps query chuẩn)
  const handleNavigateToShop = () => {
    const query = encodeURIComponent(mockOrderDetail.shopAddress);
    // Dùng schema chuẩn của Google Maps để mở app bản đồ
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const handleNavigateToCustomer = () => {
    const query = encodeURIComponent(mockOrderDetail.deliveryAddress);
    // Dùng schema chuẩn của Google Maps để mở app bản đồ
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  // Xử lý chụp ảnh chứng từ
  const handleTakePhoto = async (type: 'pickup' | 'delivery') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần cấp quyền truy cập camera để chụp ảnh');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (type === 'pickup') {
        setPickupProof(result.assets[0].uri);
      } else {
        setDeliveryProof(result.assets[0].uri);
      }
    }
  };

  // Workflow actions
  const handleAcceptOrder = () => {
    setOrderStatus('accepted');
    const newEvent = {
      status: 'accepted',
      time: new Date().toLocaleString('vi-VN'),
      label: 'Shipper nhận đơn',
    };
    setTimeline([...timeline, newEvent]);
    Alert.alert('Thành công', 'Bạn đã nhận đơn hàng');
  };

  const handleStartPickup = () => {
    setOrderStatus('picking_up');
    const newEvent = {
      status: 'picking_up',
      time: new Date().toLocaleString('vi-VN'),
      label: 'Đang đến lấy hàng',
    };
    setTimeline([...timeline, newEvent]);
  };

  const handleConfirmPickup = () => {
    if (!pickupProof) {
      Alert.alert('Thông báo', 'Vui lòng chụp ảnh chứng từ lấy hàng');
      return;
    }
    setOrderStatus('picked_up');
    const newEvent = {
      status: 'picked_up',
      time: new Date().toLocaleString('vi-VN'),
      label: 'Đã lấy hàng từ shop',
    };
    setTimeline([...timeline, newEvent]);
    Alert.alert('Thành công', 'Đã xác nhận lấy hàng');
  };

  const handleStartDelivery = () => {
    setOrderStatus('delivering');
    const newEvent = {
      status: 'delivering',
      time: new Date().toLocaleString('vi-VN'),
      label: 'Đang giao hàng đến khách',
    };
    setTimeline([...timeline, newEvent]);
  };

  const handleCompleteDelivery = () => {
    if (!deliveryProof) {
      Alert.alert('Thông báo', 'Vui lòng chụp ảnh chứng từ giao hàng');
      return;
    }
    setOrderStatus('completed');
    const newEvent = {
      status: 'completed',
      time: new Date().toLocaleString('vi-VN'),
      label: 'Giao hàng thành công',
    };
    setTimeline([...timeline, newEvent]);
    Alert.alert('Hoàn thành', 'Bạn đã giao hàng thành công!', [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
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
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Order Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(orderStatus)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(orderStatus) }]}>
              {getStatusText(orderStatus)}
            </Text>
          </View>
          <Text style={styles.orderId}>#{mockOrderDetail.id}</Text>
          <Text style={styles.orderDate}>{mockOrderDetail.orderDate}</Text>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Tiến trình giao hàng</Text>
          <View style={styles.timelineContainer}>
            {timeline.map((event, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                {index < timeline.length - 1 && <View style={styles.timelineLine} />}
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>{event.label}</Text>
                  <Text style={styles.timelineTime}>{event.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Shop Info (Pickup) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏪 Lấy hàng tại</Text>
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <View>
                <Text style={styles.locationName}>{mockOrderDetail.shopName}</Text>
                <Text style={styles.locationPhone}>{mockOrderDetail.shopPhone}</Text>
              </View>
              <TouchableOpacity onPress={handleCallShop} style={styles.callIconButton}>
                <Ionicons name="call" size={20} color="#4CAF50" />
              </TouchableOpacity>
            </View>
            <View style={styles.locationAddress}>
              <Ionicons name="location-outline" size={18} color="#666" />
              <Text style={styles.addressText}>{mockOrderDetail.shopAddress}</Text>
            </View>
            <View style={styles.locationFooter}>
              <View style={styles.distanceInfo}>
                <Ionicons name="navigate-outline" size={16} color="#FF9800" />
                <Text style={styles.distanceText}>{mockOrderDetail.pickupDistance}</Text>
                <Text style={styles.separator}>•</Text>
                <Ionicons name="time-outline" size={16} color="#2196F3" />
                <Text style={styles.distanceText}>{mockOrderDetail.estimatedPickupTime}</Text>
              </View>
              <TouchableOpacity onPress={handleNavigateToShop} style={styles.navigateSmallButton}>
                <Ionicons name="navigate" size={16} color="#2196F3" />
                <Text style={styles.navigateSmallText}>Chỉ đường</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Customer Info (Delivery) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Giao hàng đến</Text>
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <View>
                <Text style={styles.locationName}>{mockOrderDetail.customerName}</Text>
                <Text style={styles.locationPhone}>{mockOrderDetail.customerPhone}</Text>
              </View>
              <TouchableOpacity onPress={handleCallCustomer} style={styles.callIconButton}>
                <Ionicons name="call" size={20} color="#4CAF50" />
              </TouchableOpacity>
            </View>
            <View style={styles.locationAddress}>
              <Ionicons name="location-outline" size={18} color="#666" />
              <Text style={styles.addressText}>{mockOrderDetail.deliveryAddress}</Text>
            </View>
            <View style={styles.locationFooter}>
              <View style={styles.distanceInfo}>
                <Ionicons name="navigate-outline" size={16} color="#4CAF50" />
                <Text style={styles.distanceText}>{mockOrderDetail.deliveryDistance}</Text>
                <Text style={styles.separator}>•</Text>
                <Ionicons name="time-outline" size={16} color="#2196F3" />
                <Text style={styles.distanceText}>{mockOrderDetail.estimatedDeliveryTime}</Text>
              </View>
              <TouchableOpacity onPress={handleNavigateToCustomer} style={styles.navigateSmallButton}>
                <Ionicons name="navigate" size={16} color="#2196F3" />
                <Text style={styles.navigateSmallText}>Chỉ đường</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Notes */}
        {mockOrderDetail.notes && (
          <View style={styles.notesCard}>
            <Ionicons name="alert-circle" size={20} color="#FF9800" />
            <View style={{ flex: 1 }}>
              <Text style={styles.notesTitle}>Ghi chú</Text>
              <Text style={styles.notesText}>{mockOrderDetail.notes}</Text>
            </View>
          </View>
        )}

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Sản phẩm ({mockOrderDetail.items.length})</Text>
          {mockOrderDetail.items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')}đ x {item.quantity}</Text>
              </View>
              <Text style={styles.itemTotal}>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</Text>
            </View>
          ))}
        </View>

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Thanh toán</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Tổng tiền hàng:</Text>
              <Text style={styles.paymentValue}>{mockOrderDetail.totalAmount.toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Phí vận chuyển:</Text>
              <Text style={styles.shippingFeeText}>+{mockOrderDetail.shippingFee.toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.paymentRow}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalValue}>
                {(mockOrderDetail.totalAmount + mockOrderDetail.shippingFee).toLocaleString('vi-VN')}đ
              </Text>
            </View>
            <View style={styles.paymentStatusRow}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
              <Text style={styles.paymentStatusText}>
                Khách đã thanh toán {mockOrderDetail.paymentMethod}
              </Text>
            </View>
            <View style={styles.shippingFeeEarn}>
              <Text style={styles.earnLabel}>Thu nhập của bạn:</Text>
              <Text style={styles.earnValue}>+{mockOrderDetail.shippingFee.toLocaleString('vi-VN')}đ</Text>
            </View>
          </View>
        </View>

        {/* Pickup Proof */}
        {(orderStatus === 'picking_up' || orderStatus === 'picked_up' || orderStatus === 'delivering' || orderStatus === 'completed') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📷 Ảnh lấy hàng</Text>
            {pickupProof ? (
              <Image source={{ uri: pickupProof }} style={styles.proofImage} />
            ) : (
              <TouchableOpacity 
                style={styles.uploadButton} 
                onPress={() => handleTakePhoto('pickup')}
              >
                <Ionicons name="camera-outline" size={32} color="#666" />
                <Text style={styles.uploadText}>Chụp ảnh chứng từ lấy hàng</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Delivery Proof */}
        {(orderStatus === 'delivering' || orderStatus === 'completed') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📷 Ảnh giao hàng</Text>
            {deliveryProof ? (
              <Image source={{ uri: deliveryProof }} style={styles.proofImage} />
            ) : (
              <TouchableOpacity 
                style={styles.uploadButton} 
                onPress={() => handleTakePhoto('delivery')}
              >
                <Ionicons name="camera-outline" size={32} color="#666" />
                <Text style={styles.uploadText}>Chụp ảnh chứng từ giao hàng</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 10 }]}>
        {orderStatus === 'new' && (
          <TouchableOpacity style={styles.primaryButton} onPress={handleAcceptOrder}>
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.primaryButtonText}>Nhận đơn hàng</Text>
          </TouchableOpacity>
        )}

        {orderStatus === 'accepted' && (
          <TouchableOpacity style={styles.primaryButton} onPress={handleStartPickup}>
            <Ionicons name="bicycle" size={22} color="#fff" />
            <Text style={styles.primaryButtonText}>Bắt đầu lấy hàng</Text>
          </TouchableOpacity>
        )}

        {orderStatus === 'picking_up' && (
          <TouchableOpacity 
            style={[styles.primaryButton, !pickupProof && styles.disabledButton]} 
            onPress={handleConfirmPickup}
            disabled={!pickupProof}
          >
            <Ionicons name="checkbox" size={22} color="#fff" />
            <Text style={styles.primaryButtonText}>Xác nhận đã lấy hàng</Text>
          </TouchableOpacity>
        )}

        {orderStatus === 'picked_up' && (
          <TouchableOpacity style={styles.primaryButton} onPress={handleStartDelivery}>
            <Ionicons name="rocket" size={22} color="#fff" />
            <Text style={styles.primaryButtonText}>Bắt đầu giao hàng</Text>
          </TouchableOpacity>
        )}

        {orderStatus === 'delivering' && (
          <TouchableOpacity 
            style={[styles.primaryButton, !deliveryProof && styles.disabledButton]} 
            onPress={handleCompleteDelivery}
            disabled={!deliveryProof}
          >
            <Ionicons name="checkmark-done-circle" size={22} color="#fff" />
            <Text style={styles.primaryButtonText}>Hoàn thành giao hàng</Text>
          </TouchableOpacity>
        )}

        {orderStatus === 'completed' && (
          <View style={styles.completedBanner}>
            <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
            <Text style={styles.completedText}>Đã hoàn thành giao hàng</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderId: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  timelineContainer: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginRight: 16,
    marginTop: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: 5.5,
    top: 16,
    width: 1,
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 13,
    color: '#999',
  },
  locationCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  locationPhone: {
    fontSize: 14,
    color: '#666',
  },
  callIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationAddress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  locationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceText: {
    fontSize: 13,
    color: '#666',
  },
  separator: {
    color: '#999',
    marginHorizontal: 4,
  },
  navigateSmallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  navigateSmallText: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '600',
  },
  notesCard: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    color: '#666',
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#E24A4A',
  },
  paymentCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  shippingFeeText: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E24A4A',
  },
  paymentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    padding: 10,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  paymentStatusText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },
  shippingFeeEarn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  earnLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
  },
  earnValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  uploadButton: {
    backgroundColor: '#F8F9FA',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  proofImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  bottomActions: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: '#E24A4A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  completedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});