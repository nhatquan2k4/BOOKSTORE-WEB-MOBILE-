import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import addressService, { Address } from '../../src/services/addressService';
import userProfileService from '../../src/services/userProfileService';
import { geocodeAutomatic, getDefaultCityCoordinates, DEFAULT_VIETNAM_COORDINATES, Coordinates } from '../../src/services/geocodeService';

export default function AddressEdit() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const addressId = params.id as string | undefined;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [house, setHouse] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates>(DEFAULT_VIETNAM_COORDINATES);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    loadData();
  }, [addressId]);

  // Auto-geocode when user finishes typing address
  useEffect(() => {
    const timer = setTimeout(() => {
      if (house && ward && district && city) {
        handleGeocodeAddress();
      }
    }, 1000); // Wait 1 second after user stops typing

    return () => clearTimeout(timer);
  }, [house, ward, district, city]);

  const handleGeocodeAddress = async () => {
    if (!house || !ward || !district || !city) return;

    try {
      setGeocoding(true);
      
      // AUTO geocoding: Google (nếu có key) → Nominatim → City default
      const coords = await geocodeAutomatic(house, ward, district, city);
      setCoordinates(coords);
      console.log('✅ Final coordinates:', coords);
    } catch (error) {
      console.error('❌ Geocoding failed:', error);
      // Fallback: dùng tọa độ mặc định của thành phố
      const cityCoords = getDefaultCityCoordinates(city);
      setCoordinates(cityCoords);
    } finally {
      setGeocoding(false);
    }
  };

  // Cho phép user kéo thả marker để điều chỉnh vị trí
  const handleMarkerDragEnd = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setCoordinates({ latitude, longitude });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      if (addressId) {
        // Edit mode: load existing address
        const address = await addressService.getAddressById(addressId);
        setName(address.recipientName);
        setPhone(address.phoneNumber);
        setCity(address.province);
        setDistrict(address.district);
        setWard(address.ward);
        setHouse(address.streetAddress);
        setIsDefault(address.isDefault);
      } else {
        // Add mode: check if first address
        const defaultAddr = await addressService.getDefaultAddress();
        if (!defaultAddr) {
          // First address: pre-fill from profile
          const profile = await userProfileService.getMyProfile();
          if (profile.fullName) setName(profile.fullName);
          if (profile.phoneNumber) setPhone(profile.phoneNumber);
          setIsDefault(true); // first address is default
        }
        // else: not first address, leave fields empty
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name || !phone || !city || !district || !ward || !house) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      const data = {
        recipientName: name,
        phoneNumber: phone,
        province: city,
        district,
        ward,
        streetAddress: house,
        isDefault,
      };

      if (addressId) {
        await addressService.updateAddress(addressId, data);
        Alert.alert('Thành công', 'Cập nhật địa chỉ thành công');
      } else {
        await addressService.addAddress(data);
        Alert.alert('Thành công', 'Thêm địa chỉ thành công');
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!addressId) return;

    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa địa chỉ này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await addressService.deleteAddress(addressId);
              Alert.alert('Thành công', 'Đã xóa địa chỉ');
              router.back();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa địa chỉ');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.page}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#ff5a3c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{addressId ? 'Sửa Địa chỉ' : 'Thêm Địa chỉ'}</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading && (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#ff5a3c" />
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Removed quick paste box per request */}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Địa chỉ</Text>

          <Text style={styles.label}>Họ và tên</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Họ và tên" style={styles.rowInput} />

          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput value={phone} onChangeText={setPhone} placeholder="(+84)" style={styles.rowInput} keyboardType="phone-pad" />

          <Text style={styles.label}>Tỉnh/Thành phố</Text>
          <TextInput value={city} onChangeText={setCity} placeholder="Hà Nội, TP.HCM..." style={styles.rowInput} />

          <Text style={styles.label}>Quận/Huyện</Text>
          <TextInput value={district} onChangeText={setDistrict} placeholder="Quận Đống Đa..." style={styles.rowInput} />

          <Text style={styles.label}>Phường/Xã</Text>
          <TextInput value={ward} onChangeText={setWard} placeholder="Phường Ô Chợ Dừa..." style={styles.rowInput} />

          <Text style={styles.label}>Tên đường, Toà nhà, Số nhà.</Text>
          <TextInput value={house} onChangeText={setHouse} placeholder="Số nhà, tên đường" style={styles.rowInput} />
        </View>

        <View style={styles.mapContainer}>
          {geocoding && (
            <View style={styles.mapOverlay}>
              <ActivityIndicator size="small" color="#ff5a3c" />
              <Text style={{ color: '#666', marginTop: 8 }}>Đang tìm vị trí...</Text>
            </View>
          )}
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={{
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={coordinates}
              title="Địa chỉ giao hàng"
              description={`${house}, ${ward}, ${district}, ${city}`}
              draggable
              onDragEnd={handleMarkerDragEnd}
            />
          </MapView>
          <View style={styles.mapHint}>
            <Ionicons name="warning-outline" size={18} color="#ff5a3c" />
            <Text style={{ color: '#ff5a3c', fontSize: 13, marginLeft: 6, fontWeight: '500' }}>
              Vị trí có thể không chính xác - Kéo marker để điều chỉnh!
            </Text>
          </View>
        </View>

        <View style={[styles.sectionCard, { marginTop: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }]}>
          <Text>Đặt làm địa chỉ mặc định</Text>
          <Switch value={isDefault} onValueChange={setIsDefault} />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.footerActions}>
        {addressId && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={{ color: '#ff5a3c', fontWeight: '700' }}>Xóa địa chỉ</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>HOÀN THÀNH</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  headerRow: { paddingTop: 44, paddingHorizontal: 0, paddingBottom: 12, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f2f2f2' },
  backBtn: { padding: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  sectionCard: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginTop: 8, shadowColor: '#000', shadowOpacity: 0.03 },
  sectionTitle: { fontWeight: '700', marginBottom: 8 },
  label: { color: '#777', marginTop: 8, marginBottom: 4 },
  rowInput: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 8 },
  selectRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mapContainer: { height: 220, marginTop: 16, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f6f6f6' },
  map: { flex: 1 },
  mapOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.8)', zIndex: 10, alignItems: 'center', justifyContent: 'center' },
  mapHint: { position: 'absolute', bottom: 8, left: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, flexDirection: 'row', alignItems: 'center' },
  footerActions: { position: 'absolute', left: 0, right: 0, bottom: 18, flexDirection: 'row', paddingHorizontal: 16, justifyContent: 'space-between', gap: 12 },
  deleteBtn: { flex: 1, borderWidth: 1, borderColor: '#ff5a3c', paddingVertical: 14, borderRadius: 8, alignItems: 'center', backgroundColor: '#fff' },
  saveBtn: { flex: 1, backgroundColor: '#ff5a3c', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
});
