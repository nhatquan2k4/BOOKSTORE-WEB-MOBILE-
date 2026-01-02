import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import addressService from '../../src/services/addressService';
import type { Address } from '../../src/types/address';
import { useTheme } from '@/context/ThemeContext';

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = params.mode as string | undefined; // 'select' hoặc undefined
  const { theme, isDarkMode } = useTheme();

  const openAdd = () => router.push('/(stack)/address-edit');

  const handleSelectAddress = async (address: Address) => {
    if (mode === 'select') {
      // Set as default and go back to checkout
      try {
        await addressService.setDefaultAddress(address.id);
        router.back();
      } catch (error) {
        console.error('Failed to set default address:', error);
      }
    } else {
      // Normal edit flow
      router.push(`/(stack)/address-edit?id=${address.id}`);
    }
  };

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getMyAddresses();
      setAddresses(data);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchAddresses();
    }, [])
  );

  // add flow handled in full screen editor

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <View style={[styles.headerRow, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {mode === 'select' ? 'Chọn địa chỉ' : 'Địa chỉ của Tôi'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}

      <FlatList
        data={addresses.filter(a => 
          a.recipientName.toLowerCase().includes(query.toLowerCase()) || 
          a.phoneNumber.includes(query) || 
          a.streetAddress.toLowerCase().includes(query.toLowerCase())
        )}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={() => (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: theme.textSecondary }}>Chưa có địa chỉ nào. Thêm địa chỉ để bắt đầu.</Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={[styles.cardLine, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}
            onPress={() => handleSelectAddress(item)}
          >
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {item.recipientName} <Text style={[styles.cardPhone, { color: theme.textSecondary }]}>| {item.phoneNumber}</Text>
            </Text>
            <Text style={[styles.cardAddress, { color: theme.textSecondary }]}>
              {item.streetAddress}, {item.ward}, {item.district}, {item.province}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              {item.isDefault && (
                <View style={[styles.defaultBadge, { borderColor: theme.primary }]}>
                  <Text style={{ color: theme.primary, fontSize: 12 }}>Mặc định</Text>
                </View>
              )}
              {mode === 'select' && (
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} style={{ marginLeft: 'auto' }} />
              )}
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={() => (
          <TouchableOpacity style={[styles.footerAdd, { backgroundColor: theme.background }]} onPress={openAdd}>
            <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
            <Text style={[styles.footerAddText, { color: theme.primary }]}>Thêm Địa Chỉ Mới</Text>
          </TouchableOpacity>
        )}
      />

      {/* navigation opens full-screen editor now */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { paddingTop: 49, paddingHorizontal: 0, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1 },
  backBtn: { padding: 12 },
  headerTitle: { fontSize: 26, fontWeight: '700', textAlign: 'center' },
  searchBox: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
  cardLine: { paddingVertical: 16, paddingHorizontal: 12, borderBottomWidth: 1, borderRadius: 8, marginTop: 12 },
  cardTitle: { fontWeight: '700' },
  cardPhone: {},
  cardAddress: { marginTop: 8 },
  defaultBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginTop: 8 },
  addRow: { alignItems: 'center', paddingVertical: 18, backgroundColor: '#fff', marginTop: 12 },
  footerAdd: { alignItems: 'center', paddingVertical: 18, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  footerAddText: { marginLeft: 8, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#fff', marginTop: 8 },
});
