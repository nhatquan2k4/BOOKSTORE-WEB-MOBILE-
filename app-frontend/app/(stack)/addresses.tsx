import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import addressService, { Address } from '../../src/services/addressService';

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = params.mode as string | undefined; // 'select' hoặc undefined

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
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#ff5a3c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'select' ? 'Chọn địa chỉ' : 'Địa chỉ của Tôi'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#ff5a3c" />
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
            <Text style={{ color: '#666' }}>Chưa có địa chỉ nào. Thêm địa chỉ để bắt đầu.</Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={styles.cardLine}
            onPress={() => handleSelectAddress(item)}
          >
            <Text style={styles.cardTitle}>
              {item.recipientName} <Text style={styles.cardPhone}>| {item.phoneNumber}</Text>
            </Text>
            <Text style={styles.cardAddress}>
              {item.streetAddress}, {item.ward}, {item.district}, {item.province}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              {item.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={{ color: '#ff5a3c', fontSize: 12 }}>Mặc định</Text>
                </View>
              )}
              {mode === 'select' && (
                <Ionicons name="chevron-forward" size={20} color="#999" style={{ marginLeft: 'auto' }} />
              )}
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={() => (
          <TouchableOpacity style={styles.footerAdd} onPress={openAdd}>
            <Ionicons name="add-circle-outline" size={20} color="#ff5a3c" />
            <Text style={styles.footerAddText}>Thêm Địa Chỉ Mới</Text>
          </TouchableOpacity>
        )}
      />

      {/* navigation opens full-screen editor now */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0ede4' },
  headerRow: { paddingTop: 49, paddingHorizontal: 0, paddingBottom: 12, backgroundColor: '#f0ede4', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backBtn: { padding: 12 },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#111', textAlign: 'center' },
  searchBox: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
  cardLine: { backgroundColor: '#fff', paddingVertical: 16, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#f2f2f2' },
  cardTitle: { fontWeight: '700', color: '#222' },
  cardPhone: { color: '#999' },
  cardAddress: { color: '#777', marginTop: 8 },
  defaultBadge: { borderWidth: 1, borderColor: '#ff5a3c', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginTop: 8 },
  addRow: { alignItems: 'center', paddingVertical: 18, backgroundColor: '#fff', marginTop: 12 },
  footerAdd: { alignItems: 'center', paddingVertical: 18, backgroundColor: '#f0ede4', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  footerAddText: { color: '#ff5a3c', marginLeft: 8, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#fff', marginTop: 8 },
});
