import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock data chi tiết đơn hàng lịch sử
const mockHistoryOrders: { [key: string]: any } = {
  ORD012: {
    id: 'ORD012',
    orderDate: '15/01/2024 13:30',
    completedDate: '15/01/2024 14:30',
    status: 'completed',
    
    // Thông tin shop
    shopName: 'Nhà sách Fahasa',
    shopAddress: '60-62 Lê Lợi, Quận 1, TP.HCM',
    shopPhone: '1900636467',
    
    // Thông tin khách hàng
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    deliveryAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    
    // Thông tin đơn hàng
    items: [
      { 
        id: 1, 
        name: 'Đắc Nhân Tâm', 
        quantity: 2, 
        price: 125000,
        image: 'https://via.placeholder.com/80',
      },
      { 
        id: 2, 
        name: 'Nhà Giả Kim', 
        quantity: 1, 
        price: 200000,
        image: 'https://via.placeholder.com/80',
      },
    ],
    totalAmount: 450000,
    shippingFee: 25000,
    paymentMethod: 'Chuyển khoản',
    
    // Thông tin giao hàng
    distance: '2.5 km',
    deliveryTime: '45 phút',
    rating: 5,
    customerReview: 'Shipper giao hàng nhanh, nhiệt tình!',
    
    // Timeline
    timeline: [
      { time: '15/01/2024 13:30', label: 'Đơn hàng được tạo' },
      { time: '15/01/2024 13:35', label: 'Shipper nhận đơn' },
      { time: '15/01/2024 13:45', label: 'Đang đến lấy hàng' },
      { time: '15/01/2024 13:55', label: 'Đã lấy hàng từ shop' },
      { time: '15/01/2024 14:00', label: 'Đang giao hàng' },
      { time: '15/01/2024 14:30', label: 'Giao hàng thành công' },
    ],
  },
  ORD011: {
    id: 'ORD011',
    orderDate: '15/01/2024 10:20',
    completedDate: '15/01/2024 11:35',
    status: 'failed',
    failReason: 'Không liên lạc được với khách hàng sau 3 lần gọi',
    
    // Thông tin shop
    shopName: 'Nhà sách Phương Nam',
    shopAddress: '123 Lê Lợi, Quận 3, TP.HCM',
    shopPhone: '0283933045',
    
    // Thông tin khách hàng
    customerName: 'Trần Thị B',
    customerPhone: '0987654321',
    deliveryAddress: '456 Lê Lợi, Quận 3, TP.HCM',
    
    // Thông tin đơn hàng
    items: [
      { 
        id: 1, 
        name: 'Tuổi Trẻ Đáng Giá Bao Nhiêu', 
        quantity: 1, 
        price: 95000,
        image: 'https://via.placeholder.com/80',
      },
      { 
        id: 2, 
        name: 'Cà Phê Cùng Tony', 
        quantity: 2, 
        price: 112500,
        image: 'https://via.placeholder.com/80',
      },
    ],
    totalAmount: 320000,
    shippingFee: 20000,
    paymentMethod: 'Tiền mặt',
    
    // Thông tin giao hàng
    distance: '3.2 km',
    deliveryTime: '1 giờ 15 phút',
    rating: 0,
    
    // Timeline
    timeline: [
      { time: '15/01/2024 10:20', label: 'Đơn hàng được tạo' },
      { time: '15/01/2024 10:25', label: 'Shipper nhận đơn' },
      { time: '15/01/2024 10:35', label: 'Đang đến lấy hàng' },
      { time: '15/01/2024 10:50', label: 'Đã lấy hàng từ shop' },
      { time: '15/01/2024 11:00', label: 'Đang giao hàng' },
      { time: '15/01/2024 11:35', label: 'Giao hàng thất bại - Không liên lạc được khách' },
    ],
  },
  ORD009: {
    id: 'ORD009',
    orderDate: '14/01/2024 13:10',
    completedDate: '14/01/2024 14:10',
    status: 'cancelled',
    cancelReason: 'Khách hàng hủy đơn sau khi shipper đã lấy hàng',
    
    // Thông tin shop
    shopName: 'Nhà sách Trí Tuệ',
    shopAddress: '25 Pasteur, Quận 1, TP.HCM',
    shopPhone: '0283824789',
    
    // Thông tin khách hàng
    customerName: 'Phạm Thị D',
    customerPhone: '0912345678',
    deliveryAddress: '12 Pasteur, Quận 1, TP.HCM',
    
    // Thông tin đơn hàng
    items: [
      { 
        id: 1, 
        name: 'Sapiens - Lược Sử Loài Người', 
        quantity: 1, 
        price: 195000,
        image: 'https://via.placeholder.com/80',
      },
    ],
    totalAmount: 195000,
    shippingFee: 15000,
    paymentMethod: 'Chuyển khoản',
    compensationFee: 10000, // Phí bồi thường cho shipper
    
    // Thông tin giao hàng
    distance: '1.8 km',
    rating: 0,
    
    // Timeline
    timeline: [
      { time: '14/01/2024 13:10', label: 'Đơn hàng được tạo' },
      { time: '14/01/2024 13:15', label: 'Shipper nhận đơn' },
      { time: '14/01/2024 13:25', label: 'Đang đến lấy hàng' },
      { time: '14/01/2024 13:40', label: 'Đã lấy hàng từ shop' },
      { time: '14/01/2024 13:50', label: 'Khách hàng hủy đơn' },
      { time: '14/01/2024 14:10', label: 'Đã trả hàng về shop' },
    ],
  },
};

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

export default function HistoryOrderDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const orderId = params.id as string;

  // Lấy thông tin đơn hàng từ mock data
  const order = mockHistoryOrders[orderId] || mockHistoryOrders.ORD012;
  const statusInfo = getStatusInfo(order.status);

  const renderProductItem = (item: any) => (
    <View key={item.id} style={styles.productItem}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>
          {item.price.toLocaleString('vi-VN')}đ × {item.quantity}
        </Text>
      </View>
      <Text style={styles.productTotal}>
        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Status Card */}
        <View style={styles.card}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
              <Ionicons name={statusInfo.icon} size={20} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
            <Text style={styles.orderId}>#{order.id}</Text>
          </View>

          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.dateText}>
              Ngày đặt: {order.orderDate}
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.dateText}>
              Hoàn thành: {order.completedDate}
            </Text>
          </View>

          {order.status === 'completed' && order.deliveryTime && (
            <View style={styles.dateRow}>
              <Ionicons name="speedometer-outline" size={16} color="#666" />
              <Text style={styles.dateText}>
                Thời gian giao: {order.deliveryTime}
              </Text>
            </View>
          )}

          {/* Fail/Cancel Reason */}
          {order.failReason && (
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonLabel}>Lý do thất bại:</Text>
              <Text style={styles.reasonText}>{order.failReason}</Text>
            </View>
          )}
          {order.cancelReason && (
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonLabel}>Lý do hủy:</Text>
              <Text style={styles.reasonText}>{order.cancelReason}</Text>
            </View>
          )}
        </View>

        {/* Shop Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="storefront" size={20} color="#E24A4A" />
            <Text style={styles.cardTitle}>Thông tin cửa hàng</Text>
          </View>
          <Text style={styles.shopName}>{order.shopName}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{order.shopAddress}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{order.shopPhone}</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={20} color="#E24A4A" />
            <Text style={styles.cardTitle}>Thông tin khách hàng</Text>
          </View>
          <Text style={styles.customerName}>{order.customerName}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{order.customerPhone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{order.deliveryAddress}</Text>
          </View>
          {order.distance && (
            <View style={styles.infoRow}>
              <Ionicons name="navigate-outline" size={16} color="#666" />
              <Text style={styles.infoText}>Khoảng cách: {order.distance}</Text>
            </View>
          )}
        </View>

        {/* Products List */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="bag-handle" size={20} color="#E24A4A" />
            <Text style={styles.cardTitle}>Sản phẩm ({order.items.length})</Text>
          </View>
          {order.items.map(renderProductItem)}
        </View>

        {/* Payment Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt" size={20} color="#E24A4A" />
            <Text style={styles.cardTitle}>Thanh toán</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tổng tiền hàng:</Text>
            <Text style={styles.summaryValue}>
              {order.totalAmount.toLocaleString('vi-VN')}đ
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí giao hàng:</Text>
            <Text style={styles.summaryValue}>
              {order.shippingFee.toLocaleString('vi-VN')}đ
            </Text>
          </View>
          {order.compensationFee && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí bồi thường:</Text>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                +{order.compensationFee.toLocaleString('vi-VN')}đ
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>
              {(order.totalAmount + order.shippingFee).toLocaleString('vi-VN')}đ
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.paymentMethod}>
              Thanh toán: {order.paymentMethod}
            </Text>
          </View>
        </View>

        {/* Earnings */}
        <View style={styles.earningCard}>
          <View style={styles.earningHeader}>
            <Ionicons name="wallet" size={24} color="#4CAF50" />
            <Text style={styles.earningLabel}>Thu nhập của bạn</Text>
          </View>
          <Text style={styles.earningValue}>
            +{(order.shippingFee + (order.compensationFee || 0)).toLocaleString('vi-VN')}đ
          </Text>
        </View>

        {/* Rating (chỉ hiển thị khi giao thành công) */}
        {order.status === 'completed' && order.rating > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="star" size={20} color="#FFB800" />
              <Text style={styles.cardTitle}>Đánh giá</Text>
            </View>
            
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= order.rating ? 'star' : 'star-outline'}
                    size={28}
                    color="#FFB800"
                  />
                ))}
              </View>
              <Text style={styles.ratingScore}>{order.rating}.0</Text>
            </View>

            {order.customerReview && (
              <View style={styles.reviewContainer}>
                <Text style={styles.reviewLabel}>Nhận xét:</Text>
                <Text style={styles.reviewText}>{order.customerReview}</Text>
              </View>
            )}
          </View>
        )}

        {/* Timeline */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time" size={20} color="#E24A4A" />
            <Text style={styles.cardTitle}>Lịch sử đơn hàng</Text>
          </View>
          
          {order.timeline.map((event: any, index: number) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              {index < order.timeline.length - 1 && (
                <View style={styles.timelineLine} />
              )}
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>{event.label}</Text>
                <Text style={styles.timelineTime}>{event.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E24A4A',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  reasonContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  reasonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  shopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  productItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    color: '#666',
  },
  productTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    alignSelf: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
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
  paymentMethod: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  earningCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  earningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  earningLabel: {
    fontSize: 15,
    color: '#2E7D32',
    fontWeight: '500',
  },
  earningValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  ratingContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  ratingScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFB800',
  },
  reviewContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFFAEB',
    borderRadius: 8,
  },
  reviewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 6,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
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
    backgroundColor: '#E24A4A',
    marginRight: 12,
    marginTop: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 16,
    bottom: -20,
    width: 2,
    backgroundColor: '#E0E0E0',
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 12,
    color: '#999',
  },
});
