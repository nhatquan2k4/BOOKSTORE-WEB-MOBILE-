import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dữ liệu mẫu cho tìm kiếm đơn hàng
const recentSearches = ['ORD001', 'Quận 1', 'Nguyễn Văn A'];
const nearbyOrders = [
  { id: 'ORD004', address: 'Quận 1, TP.HCM', distance: '0.5 km', amount: 250000 },
  { id: 'ORD005', address: 'Quận 3, TP.HCM', distance: '1.2 km', amount: 380000 },
  { id: 'ORD006', address: 'Quận 1, TP.HCM', distance: '0.8 km', amount: 420000 },
];

const quickFilters = [
  { id: 1, name: 'Gần nhất', icon: 'location', color: '#4CAF50' },
  { id: 2, name: 'Giá trị cao', icon: 'cash', color: '#FF9800' },
  { id: 3, name: 'Khẩn cấp', icon: 'flash', color: '#E24A4A' },
  { id: 4, name: 'Hôm nay', icon: 'today', color: '#2196F3' },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Mã đơn', 'Địa chỉ', 'Khách hàng'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tìm kiếm đơn hàng</Text>
          <Text style={styles.headerSubtitle}>Tìm đơn theo mã, địa chỉ hoặc khách hàng</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Nhập mã đơn, địa chỉ, tên khách hàng..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Filters */}
          <View style={styles.quickFilters}>
            <TouchableOpacity style={styles.scanButton}>
              <Ionicons name="qr-code-outline" size={18} color="#E24A4A" />
              <Text style={styles.scanButtonText}>Quét mã</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapFilterButton}>
              <Ionicons name="map-outline" size={18} color="#E24A4A" />
              <Text style={styles.mapFilterButtonText}>Bản đồ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterChipsContainer}
          contentContainerStyle={styles.filterChipsContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === filter && styles.filterChipTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
              <TouchableOpacity>
                <Text style={styles.clearButton}>Xóa tất cả</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentSearches}>
              {recentSearches.map((search, index) => (
                <TouchableOpacity key={index} style={styles.recentSearchItem}>
                  <Ionicons name="time-outline" size={18} color="#666" />
                  <Text style={styles.recentSearchText}>{search}</Text>
                  <TouchableOpacity style={styles.removeSearch}>
                    <Ionicons name="close" size={16} color="#999" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Quick Filter Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lọc nhanh</Text>
          <View style={styles.quickFilterGrid}>
            {quickFilters.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.quickFilterCard, { borderColor: item.color }]}
              >
                <View style={[styles.quickFilterIcon, { backgroundColor: `${item.color}20` }]}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <Text style={styles.quickFilterName}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nearby Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📍 Đơn hàng gần bạn</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {nearbyOrders.map((order) => (
            <TouchableOpacity key={order.id} style={styles.orderItem}>
              <View style={styles.orderIcon}>
                <Ionicons name="location" size={24} color="#4CAF50" />
              </View>
              <View style={styles.orderInfo}>
                <Text style={styles.orderId}>{order.id}</Text>
                <View style={styles.orderDetails}>
                  <Ionicons name="navigate-outline" size={14} color="#666" />
                  <Text style={styles.orderAddress}>{order.address}</Text>
                </View>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderDistance}>{order.distance}</Text>
                <Text style={styles.orderAmount}>{order.amount.toLocaleString('vi-VN')}đ</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thống kê hôm nay</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Đã giao</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="bicycle" size={28} color="#FF9800" />
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Đang giao</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="cash" size={28} color="#E24A4A" />
              <Text style={styles.statValue}>2.5M</Text>
              <Text style={styles.statLabel}>Thu nhập</Text>
            </View>
          </View>
        </View>

        {/* Padding bottom */}
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#E24A4A',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  quickFilters: {
    flexDirection: 'row',
    gap: 12,
  },
  scanButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scanButtonText: {
    fontSize: 14,
    color: '#E24A4A',
    fontWeight: '600',
  },
  mapFilterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mapFilterButtonText: {
    fontSize: 14,
    color: '#E24A4A',
    fontWeight: '600',
  },
  filterChipsContainer: {
    marginBottom: 20,
  },
  filterChipsContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#E24A4A',
    borderColor: '#E24A4A',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    fontSize: 14,
    color: '#E24A4A',
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    color: '#E24A4A',
    fontWeight: '600',
  },
  recentSearches: {
    gap: 10,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  recentSearchText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  removeSearch: {
    padding: 4,
  },
  quickFilterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickFilterCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickFilterIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickFilterName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  orderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orderAddress: {
    fontSize: 13,
    color: '#666',
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderDistance: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  orderAmount: {
    fontSize: 14,
    color: '#E24A4A',
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
