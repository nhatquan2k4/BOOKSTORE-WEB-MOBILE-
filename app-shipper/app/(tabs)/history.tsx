import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../../constants/config';

type ShipmentItem = {
  id: string;
  orderId: string;
  shipperId: string;
  shipperName?: string;
  trackingCode?: string;
  status?: string;
  createdAt?: string;
  deliveredAt?: string | null;
  notes?: string | null;
  order: any;
};

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
        label: 'Đã giao',
        color: '#4CAF50',
        bgColor: '#F5F5F5',
        icon: 'help-circle' as const,
      };
  }
};

export default function HistoryScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>('all');
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      setLoading(true);
      // get current user and shipperId
      const userStr = await AsyncStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) {
        setShipments([]);
        return;
      }

      // fetch shipper record to get shipperId
      const shipperResp = await axios.get(`${API_CONFIG.BASE_URL}/shippers/me`, { headers: { Authorization: `Bearer ${await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)}` } });
      const shipperId = shipperResp.data?.id;
      if (!shipperId) {
        setShipments([]);
        return;
      }

      const resp = await axios.get(`${API_CONFIG.BASE_URL}/shipments/shipper/${shipperId}`, { headers: { Authorization: `Bearer ${await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)}` } });
      setShipments(resp.data || []);
    } catch (error) {
      console.error('[History] Error loading shipments:', error);
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadShipments();
    setRefreshing(false);
  };

  const handleOrderPress = (orderId: string, orderNumber?: string, fullOrder?: any) => {
    router.push({ 
      pathname: '/(stack)/order-detail', 
      params: { 
        orderId,
        orderNumber: orderNumber || orderId,
        orderData: fullOrder ? JSON.stringify(fullOrder) : undefined // Pass full order data
      } 
    });
  };

  const renderOrderCard = ({ item }: { item: ShipmentItem }) => {
    const order = item.order;
    const statusInfo = getStatusInfo(item.status ?? '');

    return (
      <TouchableOpacity style={styles.orderCard} onPress={() => handleOrderPress(order.id, order.orderNumber, order)}>
        <View style={styles.orderHeader}>
          <View style={styles.orderIdRow}>
            <Ionicons name="receipt-outline" size={20} color="#E24A4A" />
            <Text style={styles.orderId}>{order.orderNumber || order.id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.orderContent}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{order.address?.recipientName || order.customerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.addressText} numberOfLines={1}>{order.address?.fullAddress || ''}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{new Date(item.createdAt || order.createdAt).toLocaleString('vi-VN')}</Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Tổng đơn:</Text>
            <Text style={styles.totalAmount}>{(order.finalAmount ?? 0).toLocaleString('vi-VN')}đ</Text>
          </View>
          {item.status === 'Delivered' || item.status === 'completed' ? (
            <View style={styles.earningContainer}>
              <Text style={styles.earningLabel}>Thu nhập:</Text>
              <Text style={styles.earningValue}>+{((order.shippingFee ?? 0)).toLocaleString('vi-VN')}đ</Text>
            </View>
          ) : (
            <View style={styles.ratingContainer}>
              {/* <Ionicons name="star" size={16} color="#FFB800" /> */}
              <Text style={styles.ratingText}></Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // derive filtered shipments based on selectedPeriod
  const filteredShipments = React.useMemo(() => {
    if (!shipments || shipments.length === 0) return [];
    if (selectedPeriod === 'all') return shipments;

    const now = new Date();
    return shipments.filter((s) => {
      const dtStr = s.createdAt ?? s.order?.createdAt;
      if (!dtStr) return false;
      const dt = new Date(dtStr);
      if (!isFinite(dt.getTime())) return false;

      if (selectedPeriod === 'today') {
        return dt.toDateString() === now.toDateString();
      }

      if (selectedPeriod === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return dt >= weekAgo && dt <= now;
      }

      if (selectedPeriod === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return dt >= monthAgo && dt <= now;
      }

      return true;
    });
  }, [shipments, selectedPeriod]);

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
        data={filteredShipments}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E24A4A']} />}
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
