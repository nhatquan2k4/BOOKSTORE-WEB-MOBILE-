import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import orderService, { Order, OrderStatusHistory } from '@/src/services/orderService';
import { MINIO_BASE_URL } from '@/src/config/api';
import { PLACEHOLDER_IMAGES } from '@/src/constants/placeholders';

function ImageWithFallback({ uri, style }: { uri?: string; style?: any }) {
  const [error, setError] = React.useState(false);
  const finalUri = React.useMemo(() => {
    if (!uri) return PLACEHOLDER_IMAGES.DEFAULT_BOOK;
    if (uri.startsWith('http')) return uri;
    return `${MINIO_BASE_URL}${uri}`;
  }, [uri]);

  return (
    <Image
      source={{ uri: error ? PLACEHOLDER_IMAGES.DEFAULT_BOOK : finalUri }}
      style={style}
      onError={() => setError(true)}
      defaultSource={{ uri: PLACEHOLDER_IMAGES.DEFAULT_BOOK }}
    />
  );
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  Pending: 'Chờ xác nhận',
  Confirmed: 'Đã xác nhận',
  Processing: 'Đang xử lý',
  Shipped: 'Đang giao',
  Completed: 'Hoàn thành',
  Cancelled: 'Đã hủy',
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  Pending: '#FFA726',
  Confirmed: '#42A5F5',
  Processing: '#AB47BC',
  Shipped: '#26C6DA',
  Completed: '#66BB6A',
  Cancelled: '#EF5350',
};

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrderDetail();
    }
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const [orderData, historyData] = await Promise.all([
        orderService.getOrderById(orderId),
        orderService.getOrderStatusHistory(orderId),
      ]);
      console.log('Order Detail Data:', JSON.stringify(orderData, null, 2));
      console.log('Order Items:', orderData.items);
      setOrder(orderData);
      setStatusHistory(historyData);
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    Alert.alert(
      'Xác nhận hủy đơn',
      'Bạn có chắc chắn muốn hủy đơn hàng này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              await orderService.cancelOrder(orderId, 'Khách hàng yêu cầu hủy');
              Alert.alert('Thành công', 'Đơn hàng đã được hủy');
              loadOrderDetail(); // Reload to show updated status
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể hủy đơn hàng');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#D5CCB3" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Không tìm thấy đơn hàng</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Lấy thông tin thanh toán từ paymentTransaction
  const paymentMethod = order.paymentTransaction?.paymentMethod || 'N/A';
  const paymentStatus = order.paymentTransaction?.status || 'Pending';
  const isPaid = paymentStatus === 'SUCCESS' || paymentStatus === 'Success' || order.paidAt !== null;
  
  // Chỉ cho phép hủy nếu: đơn hàng ở trạng thái có thể hủy VÀ chưa thanh toán
  const canCancel = ['Pending', 'Confirmed', 'Processing'].includes(order.status) && !isPaid;
  
  const statusLabel = ORDER_STATUS_LABELS[order.status] || order.status;
  const statusColor = ORDER_STATUS_COLORS[order.status] || '#999';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusBadgeLarge, { backgroundColor: `${statusColor}20` }]}>
            <Ionicons name="receipt-outline" size={32} color={statusColor} />
          </View>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <View style={[styles.statusChip, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.statusChipText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
          <Text style={styles.orderDate}>
            {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : ''}
          </Text>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
          <View style={styles.card}>
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <View style={styles.addressInfo}>
                <Text style={styles.recipientName}>{order.address.recipientName}</Text>
                <Text style={styles.recipientPhone}>{order.address.phoneNumber}</Text>
                <Text style={styles.addressText}>
                  {order.address.street}, {order.address.ward}, {order.address.district},{' '}
                  {order.address.province}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm ({order.items?.length ?? 0})</Text>
          <View style={styles.card}>
            {order.items?.map((item, index) => {
              let imageUrl = item.bookImageUrl || PLACEHOLDER_IMAGES.DEFAULT_BOOK;
              if (item.bookImageUrl && !item.bookImageUrl.startsWith('http')) {
                imageUrl = `${MINIO_BASE_URL}${item.bookImageUrl}`;
              }

              console.log(`Item ${index}:`, {
                id: item.id,
                bookId: item.bookId,
                bookTitle: item.bookTitle,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                bookImageUrl: item.bookImageUrl,
                finalImageUrl: imageUrl,
              });

              return (
                <View
                  key={item.id}
                  style={[styles.itemRow, index < order.items.length - 1 && styles.itemBorder]}
                >
                  <ImageWithFallback uri={item.bookImageUrl} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <Text numberOfLines={2} style={styles.itemTitle}>
                      {item.bookTitle || 'Sản phẩm'}
                    </Text>
                    <Text style={styles.itemPrice}>
                      {(item.unitPrice ?? 0).toLocaleString('vi-VN')}₫ x {item.quantity ?? 1}
                    </Text>
                  </View>
                  <Text style={styles.itemTotal}>
                    {((item.unitPrice ?? 0) * (item.quantity ?? 1)).toLocaleString('vi-VN')}₫
                  </Text>
                </View>
              );
            }) ?? null}
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thanh toán</Text>
          <View style={styles.card}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng tiền hàng</Text>
              <Text style={styles.summaryValue}>
                {(order.totalAmount ?? 0).toLocaleString('vi-VN')}₫
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
              <Text style={styles.summaryValue}>
                {(order.shippingFee ?? 0).toLocaleString('vi-VN')}₫
              </Text>
            </View>
            {(order.discountAmount ?? 0) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Giảm giá</Text>
                <Text style={[styles.summaryValue, { color: '#66BB6A' }]}>
                  -{(order.discountAmount ?? 0).toLocaleString('vi-VN')}₫
                </Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.totalLabel}>Tổng thanh toán</Text>
              <Text style={styles.totalValue}>
                {(order.finalAmount ?? 0).toLocaleString('vi-VN')}₫
              </Text>
            </View>
            <View style={styles.paymentMethodRow}>
              <Text style={styles.summaryLabel}>Phương thức thanh toán</Text>
              <Text style={styles.summaryValue}>
                {paymentMethod === 'Online' ? 'Thanh toán online (VietQR)' : paymentMethod === 'COD' ? 'Ship COD' : paymentMethod}
              </Text>
            </View>
            <View style={styles.paymentMethodRow}>
              <Text style={styles.summaryLabel}>Trạng thái thanh toán</Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: isPaid ? '#66BB6A' : '#FFA726' },
                ]}
              >
                {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </Text>
            </View>
            {order.paidAt && (
              <View style={styles.paymentMethodRow}>
                <Text style={styles.summaryLabel}>Thời gian thanh toán</Text>
                <Text style={styles.summaryValue}>
                  {new Date(order.paidAt).toLocaleString('vi-VN')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Status History */}
        {statusHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lịch sử trạng thái</Text>
            <View style={styles.card}>
              {statusHistory.map((history, index) => (
                <View
                  key={history.id}
                  style={[
                    styles.historyRow,
                    index < statusHistory.length - 1 && styles.historyBorder,
                  ]}
                >
                  <View style={styles.historyDot} />
                  <View style={styles.historyContent}>
                    <Text style={styles.historyStatus}>
                      {ORDER_STATUS_LABELS[history.status] || history.status}
                    </Text>
                    <Text style={styles.historyDate}>
                      {history.changedAt ? new Date(history.changedAt).toLocaleString('vi-VN') : ''}
                    </Text>
                    {history.note && <Text style={styles.historyNote}>{history.note}</Text>}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Cancel Button */}
        {canCancel && (
          <TouchableOpacity
            style={[styles.cancelButton, cancelling && styles.cancelButtonDisabled]}
            onPress={handleCancelOrder}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={20} color="#fff" />
                <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0EDE4',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#F0EDE4',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  backBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#D5CCB3',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadgeLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 13,
    color: '#999',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressRow: {
    flexDirection: 'row',
  },
  addressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recipientPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 13,
    color: '#666',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  summaryTotal: {
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D5CCB3',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  historyRow: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  historyBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D5CCB3',
    marginRight: 12,
    marginTop: 4,
  },
  historyContent: {
    flex: 1,
  },
  historyStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  historyNote: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  cancelButton: {
    backgroundColor: '#EF5350',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  cancelButtonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
