import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data
const earningsData = {
  available: 450000, // Số dư khả dụng
  pending: 125000, // Đang chờ xử lý
  totalThisWeek: 575000,
  totalThisMonth: 2350000,
  totalAllTime: 15750000,
};

const transactions = [
  { id: 1, type: 'earning', amount: 25000, date: '15/01/2024 14:30', orderId: 'ORD012', description: 'Phí giao hàng' },
  { id: 2, type: 'earning', amount: 20000, date: '15/01/2024 11:20', orderId: 'ORD011', description: 'Phí giao hàng' },
  { id: 3, type: 'withdraw', amount: -200000, date: '14/01/2024 16:00', description: 'Rút tiền về VCB ***1234' },
  { id: 4, type: 'earning', amount: 30000, date: '14/01/2024 16:45', orderId: 'ORD010', description: 'Phí giao hàng' },
  { id: 5, type: 'earning', amount: 15000, date: '14/01/2024 14:10', orderId: 'ORD009', description: 'Phí giao hàng' },
  { id: 6, type: 'bonus', amount: 50000, date: '13/01/2024 18:00', description: 'Thưởng hoàn thành 50 đơn' },
  { id: 7, type: 'earning', amount: 35000, date: '13/01/2024 10:30', orderId: 'ORD008', description: 'Phí giao hàng' },
  { id: 8, type: 'earning', amount: 22000, date: '13/01/2024 09:15', orderId: 'ORD007', description: 'Phí giao hàng' },
];

const weeklyStats = [
  { day: 'T2', orders: 8, earnings: 185000 },
  { day: 'T3', orders: 12, earnings: 295000 },
  { day: 'T4', orders: 10, earnings: 240000 },
  { day: 'T5', orders: 15, earnings: 380000 },
  { day: 'T6', orders: 18, earnings: 450000 },
  { day: 'T7', orders: 14, earnings: 340000 },
  { day: 'CN', orders: 10, earnings: 260000 },
];

export default function EarningsScreen() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'transactions'>('overview');

  const handleWithdraw = () => {
    Alert.alert(
      'Rút tiền',
      `Số dư khả dụng: ${earningsData.available.toLocaleString('vi-VN')}đ\n\nBạn muốn rút về tài khoản ngân hàng?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            Alert.alert('Thành công', 'Yêu cầu rút tiền đã được gửi. Tiền sẽ được chuyển trong 1-2 ngày làm việc.');
          },
        },
      ]
    );
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning':
        return { name: 'add-circle', color: '#4CAF50' };
      case 'withdraw':
        return { name: 'remove-circle', color: '#E24A4A' };
      case 'bonus':
        return { name: 'gift', color: '#FF9800' };
      default:
        return { name: 'cash', color: '#666' };
    }
  };

  const maxEarnings = Math.max(...weeklyStats.map(s => s.earnings));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Thu nhập</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
            <TouchableOpacity>
              <Ionicons name="refresh" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {earningsData.available.toLocaleString('vi-VN')}đ
          </Text>
          <View style={styles.pendingRow}>
            <Ionicons name="time-outline" size={16} color="#FFE082" />
            <Text style={styles.pendingText}>
              Đang chờ: {earningsData.pending.toLocaleString('vi-VN')}đ
            </Text>
          </View>
          <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
            <Ionicons name="wallet-outline" size={20} color="#E24A4A" />
            <Text style={styles.withdrawButtonText}>Rút tiền</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Ionicons name="calendar-outline" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>
              {(earningsData.totalThisWeek / 1000).toFixed(0)}K
            </Text>
            <Text style={styles.statLabel}>Tuần này</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="trending-up" size={24} color="#FF9800" />
            <Text style={styles.statValue}>
              {(earningsData.totalThisMonth / 1000).toFixed(0)}K
            </Text>
            <Text style={styles.statLabel}>Tháng này</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="trophy" size={24} color="#FFB800" />
            <Text style={styles.statValue}>
              {(earningsData.totalAllTime / 1000000).toFixed(1)}M
            </Text>
            <Text style={styles.statLabel}>Tổng cộng</Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'overview' && styles.tabActive]}
            onPress={() => setSelectedTab('overview')}
          >
            <Text style={[styles.tabText, selectedTab === 'overview' && styles.tabTextActive]}>
              Tổng quan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'transactions' && styles.tabActive]}
            onPress={() => setSelectedTab('transactions')}
          >
            <Text style={[styles.tabText, selectedTab === 'transactions' && styles.tabTextActive]}>
              Lịch sử
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {selectedTab === 'overview' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Thu nhập 7 ngày qua</Text>
            <View style={styles.chartContainer}>
              {weeklyStats.map((stat, index) => (
                <View key={index} style={styles.barContainer}>
                  <Text style={styles.barValue}>
                    {(stat.earnings / 1000).toFixed(0)}K
                  </Text>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${(stat.earnings / maxEarnings) * 100}%`,
                          backgroundColor: index === weeklyStats.length - 1 ? '#E24A4A' : '#4CAF50',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{stat.day}</Text>
                  <Text style={styles.barOrders}>{stat.orders} đơn</Text>
                </View>
              ))}
            </View>

            {/* Performance Insights */}
            <View style={styles.insightsContainer}>
              <View style={styles.insightCard}>
                <Ionicons name="trending-up" size={28} color="#4CAF50" />
                <View style={styles.insightContent}>
                  <Text style={styles.insightValue}>+15%</Text>
                  <Text style={styles.insightLabel}>So với tuần trước</Text>
                </View>
              </View>
              <View style={styles.insightCard}>
                <Ionicons name="flash" size={28} color="#FF9800" />
                <View style={styles.insightContent}>
                  <Text style={styles.insightValue}>82đơn</Text>
                  <Text style={styles.insightLabel}>Tổng đơn tuần này</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💳 Lịch sử giao dịch</Text>
            {transactions.map((transaction) => {
              const icon = getTransactionIcon(transaction.type);
              return (
                <View key={transaction.id} style={styles.transactionCard}>
                  <View style={[styles.transactionIcon, { backgroundColor: `${icon.color}20` }]}>
                    <Ionicons name={icon.name as any} size={24} color={icon.color} />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>{transaction.description}</Text>
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                    {transaction.orderId && (
                      <Text style={styles.transactionOrder}>#{transaction.orderId}</Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      { color: transaction.amount > 0 ? '#4CAF50' : '#E24A4A' },
                    ]}
                  >
                    {transaction.amount > 0 ? '+' : ''}
                    {transaction.amount.toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
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
  balanceCard: {
    backgroundColor: '#E24A4A',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  pendingText: {
    fontSize: 13,
    color: '#FFE082',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  withdrawButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E24A4A',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#E24A4A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    marginBottom: 20,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  barWrapper: {
    width: '80%',
    height: 140,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
    minHeight: 10,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  barOrders: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  insightsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  insightCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  insightLabel: {
    fontSize: 11,
    color: '#666',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionOrder: {
    fontSize: 11,
    color: '#E24A4A',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
