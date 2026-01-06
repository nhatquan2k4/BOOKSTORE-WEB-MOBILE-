import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import orderService from '@/src/services/orderService';
import type { Order } from '@/src/types/order';
import { MINIO_BASE_URL } from '@/src/config/api';
import { PLACEHOLDER_IMAGES } from '@/src/constants/placeholders';
import { useTheme } from '@/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

// Small local component: Image with fallback on error
function ImageWithFallback({ uri, style }: { uri?: string; style?: any }) {
  const [error, setError] = React.useState(false);
  const finalUri = React.useMemo(() => {
    if (!uri) return PLACEHOLDER_IMAGES.DEFAULT_BOOK;
    if (uri.startsWith('http')) return uri;
    // relative path from backend (MinIO)
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
  Paid: 'Chờ xác nhận',
  Confirmed: 'Đã xác nhận',
  Processing: 'Đang xử lý',
  Shipping: 'Đang giao',
  Delivered: 'Đã giao',
  Cancelled: 'Đã hủy',
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  Pending: '#FFA726',
  Paid: '#FFA726',
  Confirmed: '#42A5F5',
  Processing: '#AB47BC',
  Shipping: '#26C6DA',
  Delivered: '#66BB6A',
  Cancelled: '#EF5350',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  Pending: 'Chưa thanh toán',
  SUCCESS: 'Đã thanh toán',
  Success: 'Đã thanh toán',
  Failed: 'Thanh toán thất bại',
  Paid: 'Đã thanh toán',
  Refunded: 'Đã hoàn tiền',
};

export default function OrdersScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const tabs = [
    { key: 'all', label: 'Tất cả', status: undefined },
    { key: 'pending', label: 'Chờ xác nhận', status: 'Pending' },
    { key: 'processing', label: 'Đã xác nhận', status: 'Confirmed' },
    { key: 'shipping', label: 'Đang giao', status: 'Shipping' },
    { key: 'delivered', label: 'Đã giao', status: 'Delivered' },
    { key: 'cancelled', label: 'Đã hủy', status: 'Cancelled' },
  ];

  useEffect(() => {
    loadOrders(true);
  }, [selectedTab]);

  const loadOrders = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }

      const currentTab = tabs.find((t) => t.key === selectedTab);
      const response = await orderService.getMyOrders({
        status: currentTab?.status,
        pageNumber: reset ? 1 : page,
        pageSize: 10,
      });

      console.log('=== Orders API Response ===');
      console.log('Total orders:', response.items.length);
      if (response.items.length > 0) {
        console.log('First order sample:', JSON.stringify(response.items[0], null, 2));
        console.log('First order items:', response.items[0].items);
      }

      if (reset) {
        setOrders(response.items);
      } else {
        // Append new items but dedupe by order id in case API returns overlapping pages
        setOrders((prev) => {
          const combined = [...prev, ...response.items];
          const map = new Map<string, Order>();
          for (const o of combined) {
            map.set(o.id, o);
          }
          return Array.from(map.values());
        });
      }

      // Use pageNumber from response to avoid drifting page state
      setHasMore(response.pageNumber < response.totalPages);
      setPage(response.pageNumber + 1);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadOrders(false);
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusLabel = ORDER_STATUS_LABELS[item.status] || item.status;
    const statusColor = ORDER_STATUS_COLORS[item.status] || '#999';
    
  // Determine payment state: prefer explicit paidAt / paymentTransaction, fallback to order.status
  const paymentMethod = item.paymentTransaction?.paymentMethod || (item.note?.includes('COD') ? 'COD' : 'N/A');
  const rawPaymentStatus = item.paymentTransaction?.status;
  const isPaidFromPaidAt = !!item.paidAt;
  const isPaidFromTransaction = rawPaymentStatus && ['Paid', 'SUCCESS', 'Success'].includes(rawPaymentStatus);
  const isPaidFromOrderStatus = ['Delivered', 'Completed', 'Paid'].includes(item.status);
  const isPaid = isPaidFromPaidAt || isPaidFromTransaction || isPaidFromOrderStatus;
  const paymentStatusLabel = isPaid ? 'Đã thanh toán' : 'Chưa thanh toán';

    return (
      <TouchableOpacity
        style={[styles.orderCard, { backgroundColor: theme.cardBackground }]}
        onPress={() => router.push(`/(stack)/order-detail?id=${item.id}`)}
      >
        {/* Header */}
        <View style={[styles.orderHeader, { borderBottomColor: theme.border }]}>
          <View style={styles.orderHeaderLeft}>
            <Ionicons name="receipt-outline" size={18} color={theme.textSecondary} />
            <Text style={[styles.orderNumber, { color: theme.text }]}>{item.orderNumber}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        {/* Items Preview */}
        <View style={styles.itemsContainer}>
          {item.items.slice(0, 2).map((orderItem, index) => {
            let imageUrl = orderItem.bookImageUrl || PLACEHOLDER_IMAGES.DEFAULT_BOOK;
            if (orderItem.bookImageUrl && !orderItem.bookImageUrl.startsWith('http')) {
              imageUrl = `${MINIO_BASE_URL}${orderItem.bookImageUrl}`;
            }

            console.log(`Order ${item.orderNumber} - Item ${index}:`, {
              id: orderItem.id,
              bookId: orderItem.bookId,
              bookTitle: orderItem.bookTitle,
              unitPrice: orderItem.unitPrice,
              quantity: orderItem.quantity,
              bookImageUrl: orderItem.bookImageUrl,
              finalImageUrl: imageUrl,
            });

            return (
              <View key={orderItem.id} style={styles.itemRow}>
                <ImageWithFallback uri={orderItem.bookImageUrl} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text numberOfLines={2} style={[styles.itemTitle, { color: theme.text }]}>
                    {orderItem.bookTitle || 'Sản phẩm'}
                  </Text>
                  <Text style={[styles.itemQuantity, { color: theme.textSecondary }]}>x{orderItem.quantity || 1}</Text>
                </View>
                <Text style={[styles.itemPrice, { color: theme.text }]}>
                  {(orderItem.unitPrice || 0).toLocaleString('vi-VN')}₫
                </Text>
              </View>
            );
          })}
          {item.items.length > 2 && (
            <Text style={[styles.moreItems, { color: theme.textSecondary }]}>+{item.items.length - 2} sản phẩm khác</Text>
          )}
        </View>

        {/* Footer */}
        <View style={[styles.orderFooter, { borderTopColor: theme.border }]}>
          <View>
            <Text style={[styles.paymentMethodLabel, { color: theme.text }]}>
              {paymentMethod === 'Online' ? 'Online' : paymentMethod === 'COD' ? 'COD' : paymentMethod}
            </Text>
            <Text style={[styles.paymentStatusLabel, { color: theme.textSecondary }]}>
              {paymentStatusLabel}
            </Text>
            <Text style={[styles.orderDate, { color: theme.textTertiary }]}>
              {new Date(item.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          <View style={styles.totalContainer}>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Tổng tiền:</Text>
            <Text style={[styles.totalAmount, { color: theme.primary }]}>
              {(item.finalAmount || 0).toLocaleString('vi-VN')}₫
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Đơn hàng của tôi</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tabs}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tab, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F5F5F5' }, selectedTab === item.key && { backgroundColor: theme.primary }]}
              onPress={() => setSelectedTab(item.key)}
            >
              <Text
                style={[styles.tabText, { color: theme.textSecondary }, selectedTab === item.key && styles.tabTextActive]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.tabsContent}
        />
      </View>

      {/* Orders List */}
      {loading && orders.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Đang tải đơn hàng...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color={theme.border} />
          <Text style={[styles.emptyText, { color: theme.textTertiary }]}>Chưa có đơn hàng nào</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && orders.length > 0 ? (
              <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 20 }} />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0EDE4',
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
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  tabActive: {
    backgroundColor: '#D5CCB3',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  listContent: {
    padding: 16,
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
    borderBottomColor: '#F0F0F0',
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
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
  itemsContainer: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemImage: {
    width: 50,
    height: 70,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  moreItems: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  paymentMethodLabel: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  paymentStatusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D5CCB3',
  },
});
