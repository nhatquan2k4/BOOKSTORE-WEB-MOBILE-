import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import shipperOrderService, { ShipperOrder } from '../../services/shipperOrderService';
import { API_CONFIG } from '../../constants/config';

export default function OrderDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ orderId: string; orderData?: string }>();
  const { orderId, orderData: orderDataParam } = params;
  
  // States
  const [orderData, setOrderData] = useState<ShipperOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState('');
  const [timeline, setTimeline] = useState<Array<{ status: string; time: string; label: string }>>([]);
  const [pickupProof, setPickupProof] = useState<string | null>(null);
  const [deliveryProof, setDeliveryProof] = useState<string | null>(null);

  // Fetch order detail from API or use passed data
  useEffect(() => {
    fetchOrderDetail();
  }, [orderId, orderDataParam]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      if (!orderId) {
        Alert.alert('Lỗi', 'Không tìm thấy mã đơn hàng');
        router.back();
        return;
      }

      let data: ShipperOrder;

      // If order data was passed in params, use it directly
      if (orderDataParam) {
        try {
          data = JSON.parse(orderDataParam);
          console.log('[OrderDetail] Using passed order data');
        } catch (parseError) {
          console.error('[OrderDetail] Error parsing order data:', parseError);
          // Fallback to API call
          data = await shipperOrderService.getOrderDetail(orderId);
        }
      } else {
        // Fetch from API if no data was passed
        console.log('[OrderDetail] Fetching order from API');
        data = await shipperOrderService.getOrderDetail(orderId);
      }

      setOrderData(data);
      setOrderStatus(data.status);
      
      // Debug: Log order data structure
      console.log('[OrderDetail] Full order data:', JSON.stringify(data, null, 2));
      console.log('[OrderDetail] Items:', data.items);
      if (data.items && data.items.length > 0) {
        console.log('[OrderDetail] First item bookImageUrl:', data.items[0].bookImageUrl);
        console.log('[OrderDetail] Full image URL:', getImageUrl(data.items[0].bookImageUrl));
      }
      
      // Initialize timeline based on current status
      const initialTimeline = [
        { status: 'created', time: formatDate(data.createdAt), label: 'Đơn hàng được tạo' },
      ];
      
      if (data.status === 'Shipping' || data.status === 'Delivered') {
        initialTimeline.push({
          status: 'shipping',
          time: formatDate(data.createdAt),
          label: 'Shipper đã nhận đơn',
        });
      }
      
      if (data.status === 'Delivered') {
        initialTimeline.push({
          status: 'delivered',
          time: formatDate(data.createdAt),
          label: 'Giao hàng thành công',
        });
      }
      
      setTimeline(initialTimeline);
    } catch (error: any) {
      console.error('[OrderDetail] Error fetching order:', error);
      if (error.code === 'NO_TOKEN') {
        Alert.alert('Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại', [
          { text: 'OK', onPress: () => router.replace('/(auth)/login') },
        ]);
      } else if (error.response?.status === 403) {
        Alert.alert(
          'Lỗi truy cập', 
          'Không có quyền xem chi tiết đơn hàng này. Vui lòng liên hệ quản trị viên.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng. Vui lòng thử lại.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format full address
  const formatAddress = (address: any) => {
    if (!address) return '';
    const parts = [address.street, address.ward, address.district, address.province];
    return parts.filter(Boolean).join(', ');
  };

  // Build full image URL
  const getImageUrl = (imagePath?: string) => {
    console.log('[OrderDetail] getImageUrl input:', imagePath);
    
    if (!imagePath) {
      console.log('[OrderDetail] No image path provided, using placeholder');
      return 'https://via.placeholder.com/80?text=No+Image';
    }
    
    // If imagePath already starts with http, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      console.log('[OrderDetail] Image path is full URL:', imagePath);
      return imagePath;
    }
    
    // Otherwise, prepend the IMAGE_BASE_URL
    // Remove leading slash from imagePath if exists
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    const fullUrl = `${API_CONFIG.IMAGE_BASE_URL}/${cleanPath}`;
    console.log('[OrderDetail] Built image URL:', fullUrl);
    return fullUrl;
  };

  // Xử lý gọi điện
  const handleCallCustomer = () => {
    if (orderData?.customerPhone) {
      Linking.openURL(`tel:${orderData.customerPhone}`);
    }
  };

  const handleCallShop = () => {
    if (orderData?.address?.phoneNumber) {
      Linking.openURL(`tel:${orderData.address.phoneNumber}`);
    }
  };

  // Xử lý chỉ đường (Sử dụng Google Maps query chuẩn)
  const handleNavigateToShop = () => {
    if (orderData?.address) {
      const query = encodeURIComponent(formatAddress(orderData.address));
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
  };

  const handleNavigateToCustomer = () => {
    if (orderData?.address) {
      const query = encodeURIComponent(formatAddress(orderData.address));
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
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
  const handleAcceptOrder = async () => {
    try {
      if (!orderId) return;
      
      await shipperOrderService.acceptAndStartDelivery(orderId);
      setOrderStatus('Shipping');
      const newEvent = {
        status: 'shipping',
        time: new Date().toLocaleString('vi-VN'),
        label: 'Shipper nhận đơn và bắt đầu giao hàng',
      };
      setTimeline([...timeline, newEvent]);
      Alert.alert('Thành công', 'Bạn đã nhận đơn hàng');
      fetchOrderDetail(); // Refresh data
    } catch (error) {
      console.error('[OrderDetail] Error accepting order:', error);
      Alert.alert('Lỗi', 'Không thể nhận đơn hàng. Vui lòng thử lại.');
    }
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

  const handleCompleteDelivery = async () => {
    try {
      if (!deliveryProof) {
        Alert.alert('Thông báo', 'Vui lòng chụp ảnh chứng từ giao hàng');
        return;
      }
      
      if (!orderId) return;
      
      await shipperOrderService.markAsDelivered(orderId, 'Đơn hàng đã được giao thành công');
      setOrderStatus('Delivered');
      const newEvent = {
        status: 'delivered',
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
    } catch (error) {
      console.error('[OrderDetail] Error completing delivery:', error);
      Alert.alert('Lỗi', 'Không thể hoàn thành giao hàng. Vui lòng thử lại.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return '#2196F3';
      case 'Shipping': return '#FF9800';
      case 'Delivered': return '#4CAF50';
      case 'Cancelled': return '#F44336';
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
      case 'Confirmed': return 'Đã xác nhận';
      case 'Shipping': return 'Đang giao';
      case 'Delivered': return 'Đã giao';
      case 'Cancelled': return 'Đã hủy';
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

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#E24A4A" />
        <Text style={styles.loadingText}>Đang tải thông tin đơn hàng...</Text>
      </View>
    );
  }

  // Show error state if no data
  if (!orderData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={64} color="#999" />
        <Text style={styles.errorText}>Không tìm thấy thông tin đơn hàng</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrderDetail}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          <Text style={styles.orderId}>#{orderData.orderNumber}</Text>
          <Text style={styles.orderDate}>{formatDate(orderData.createdAt)}</Text>
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

        {/* Shop Info (Pickup) - Sử dụng thông tin từ backend */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏪 Lấy hàng tại</Text>
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <View>
                <Text style={styles.locationName}>Nhà sách (BookStore)</Text>
                <Text style={styles.locationPhone}>{orderData.address?.phoneNumber || 'Chưa có SĐT'}</Text>
              </View>
              <TouchableOpacity onPress={handleCallShop} style={styles.callIconButton}>
                <Ionicons name="call" size={20} color="#4CAF50" />
              </TouchableOpacity>
            </View>
            <View style={styles.locationAddress}>
              <Ionicons name="location-outline" size={18} color="#666" />
              <Text style={styles.addressText}>{formatAddress(orderData.address)}</Text>
            </View>
            <View style={styles.locationFooter}>
              <TouchableOpacity onPress={handleNavigateToShop} style={styles.navigateSmallButton}>
                <Ionicons name="navigate" size={16} color="#2196F3" />
                <Text style={styles.navigateSmallText}>Chỉ đường</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View> */}

        {/* Customer Info (Delivery) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Giao hàng đến</Text>
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <View>
                <Text style={styles.locationName}>{orderData.address?.recipientName || orderData.customerName}</Text>
                <Text style={styles.locationPhone}>{orderData.customerPhone || orderData.address?.phoneNumber}</Text>
              </View>
              <TouchableOpacity onPress={handleCallCustomer} style={styles.callIconButton}>
                <Ionicons name="call" size={20} color="#4CAF50" />
              </TouchableOpacity>
            </View>
            <View style={styles.locationAddress}>
              <Ionicons name="location-outline" size={18} color="#666" />
              <Text style={styles.addressText}>{formatAddress(orderData.address)}</Text>
            </View>
            <View style={styles.locationFooter}>
              <TouchableOpacity onPress={handleNavigateToCustomer} style={styles.navigateSmallButton}>
                <Ionicons name="navigate" size={16} color="#2196F3" />
                <Text style={styles.navigateSmallText}>Chỉ đường</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Notes */}
        {orderData.address?.note && (
          <View style={styles.notesCard}>
            <Ionicons name="alert-circle" size={20} color="#FF9800" />
            <View style={{ flex: 1 }}>
              <Text style={styles.notesTitle}>Ghi chú</Text>
              <Text style={styles.notesText}>{orderData.address.note}</Text>
            </View>
          </View>
        )}

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Sản phẩm ({orderData.items.length})</Text>
          {orderData.items.map((item, index) => {
            const imageUrl = getImageUrl(item.bookImageUrl);
            console.log(`[OrderDetail] Rendering item ${index}:`, item.bookTitle, 'Image URL:', imageUrl);
            
            return (
              <View key={item.id} style={styles.itemCard}>
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.itemImage}
                  resizeMode="cover"
                  onError={(e) => {
                    console.error(`[OrderDetail] Image load error for item ${index} (${item.bookTitle}):`, e.nativeEvent.error);
                  }}
                  onLoad={() => {
                    console.log(`[OrderDetail] Image loaded successfully for: ${item.bookTitle}`);
                  }}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.bookTitle}</Text>
                  <Text style={styles.itemPrice}>{item.unitPrice.toLocaleString('vi-VN')}đ x {item.quantity}</Text>
                </View>
                <Text style={styles.itemTotal}>{(item.unitPrice * item.quantity).toLocaleString('vi-VN')}đ</Text>
              </View>
            );
          })}
        </View>

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Thanh toán</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Tổng tiền hàng:</Text>
              <Text style={styles.paymentValue}>{orderData.totalAmount.toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Phí vận chuyển:</Text>
              <Text style={styles.shippingFeeText}>
                +{(orderData.finalAmount - orderData.totalAmount).toLocaleString('vi-VN')}đ
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.paymentRow}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalValue}>
                {orderData.finalAmount.toLocaleString('vi-VN')}đ
              </Text>
            </View>
            <View style={styles.paymentStatusRow}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
              <Text style={styles.paymentStatusText}>
                Khách đã thanh toán
              </Text>
            </View>
            <View style={styles.shippingFeeEarn}>
              <Text style={styles.earnLabel}>Thu nhập của bạn:</Text>
              <Text style={styles.earnValue}>
                +{(orderData.finalAmount - orderData.totalAmount).toLocaleString('vi-VN')}đ
              </Text>
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
        {orderStatus === 'Confirmed' && (
          <TouchableOpacity style={styles.primaryButton} onPress={handleAcceptOrder}>
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.primaryButtonText}>Nhận đơn và bắt đầu giao</Text>
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

        {(orderStatus === 'Shipping' || orderStatus === 'delivering') && (
          <TouchableOpacity 
            style={[styles.primaryButton, !deliveryProof && styles.disabledButton]} 
            onPress={handleCompleteDelivery}
            disabled={!deliveryProof}
          >
            <Ionicons name="checkmark-done-circle" size={22} color="#fff" />
            <Text style={styles.primaryButtonText}>Hoàn thành giao hàng</Text>
          </TouchableOpacity>
        )}

        {(orderStatus === 'Delivered' || orderStatus === 'completed') && (
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#E24A4A',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});