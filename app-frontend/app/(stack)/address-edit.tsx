import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import addressService from '../../src/services/addressService';
import type { Address } from '../../src/types/address';
import userProfileService from '../../src/services/userProfileService';
import { geocodeAutomatic, getDefaultCityCoordinates, DEFAULT_VIETNAM_COORDINATES, Coordinates } from '../../src/services/geocodeService';
import { useTheme } from '@/context/ThemeContext';

export default function AddressEdit() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const addressId = params.id as string | undefined;
  const { theme, isDarkMode } = useTheme();

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
        try {
          const defaultAddr = await addressService.getDefaultAddress();
          if (!defaultAddr) {
            // First address: pre-fill from profile (if available)
            try {
              const profile = await userProfileService.getMyProfile();
              if (profile?.fullName) setName(profile.fullName);
              if (profile?.phoneNumber) setPhone(profile.phoneNumber);
            } catch (profileError) {
              console.log('⚠️ Could not load profile for pre-fill (not critical):', profileError);
              // Ignore profile error - user can fill manually
            }
            setIsDefault(true); // first address is default
          }
        } catch (error) {
          console.log('⚠️ Could not check default address:', error);
          // If check fails, assume this might be first address
          setIsDefault(true);
        }
        // else: not first address, leave fields empty
      }
    } catch (error) {
      console.error('❌ Failed to load data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại.');
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
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <View style={[styles.headerRow, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{addressId ? 'Sửa Địa chỉ' : 'Thêm Địa chỉ'}</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading && (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Removed quick paste box per request */}

        <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Địa chỉ</Text>

          <Text style={[styles.label, { color: theme.textSecondary }]}>Họ và tên</Text>
          <TextInput 
            value={name} 
            onChangeText={setName} 
            placeholder="Họ và tên" 
            placeholderTextColor={theme.textTertiary}
            style={[styles.rowInput, { borderBottomColor: theme.border, color: theme.text }]} 
          />

          <Text style={[styles.label, { color: theme.textSecondary }]}>Số điện thoại</Text>
          <TextInput 
            value={phone} 
            onChangeText={setPhone} 
            placeholder="(+84)" 
            placeholderTextColor={theme.textTertiary}
            style={[styles.rowInput, { borderBottomColor: theme.border, color: theme.text }]} 
            keyboardType="phone-pad" 
          />

          <Text style={[styles.label, { color: theme.textSecondary }]}>Tỉnh/Thành phố</Text>
          <TextInput 
            value={city} 
            onChangeText={setCity} 
            placeholder="Hà Nội, TP.HCM..." 
            placeholderTextColor={theme.textTertiary}
            style={[styles.rowInput, { borderBottomColor: theme.border, color: theme.text }]} 
          />

          <Text style={[styles.label, { color: theme.textSecondary }]}>Quận/Huyện</Text>
          <TextInput 
            value={district} 
            onChangeText={setDistrict} 
            placeholder="Quận Đống Đa..." 
            placeholderTextColor={theme.textTertiary}
            style={[styles.rowInput, { borderBottomColor: theme.border, color: theme.text }]} 
          />

          <Text style={[styles.label, { color: theme.textSecondary }]}>Phường/Xã</Text>
          <TextInput 
            value={ward} 
            onChangeText={setWard} 
            placeholder="Phường Ô Chợ Dừa..." 
            placeholderTextColor={theme.textTertiary}
            style={[styles.rowInput, { borderBottomColor: theme.border, color: theme.text }]} 
          />

          <Text style={[styles.label, { color: theme.textSecondary }]}>Tên đường, Toà nhà, Số nhà.</Text>
          <TextInput 
            value={house} 
            onChangeText={setHouse} 
            placeholder="Số nhà, tên đường" 
            placeholderTextColor={theme.textTertiary}
            style={[styles.rowInput, { borderBottomColor: theme.border, color: theme.text }]} 
          />
        </View>

        <View style={styles.mapContainer}>
          {geocoding && (
            <View style={styles.mapOverlay}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={{ color: theme.textSecondary, marginTop: 8 }}>Đang tìm vị trí...</Text>
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
            <Ionicons name="warning-outline" size={18} color={theme.primary} />
            <Text style={{ color: theme.primary, fontSize: 13, marginLeft: 6, fontWeight: '500' }}>
              Vị trí có thể không chính xác - Kéo marker để điều chỉnh!
            </Text>
          </View>
        </View>

        <View style={[styles.sectionCard, { marginTop: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', backgroundColor: theme.cardBackground }]}>
          <Text style={{ color: theme.text }}>Đặt làm địa chỉ mặc định</Text>
          <Switch value={isDefault} onValueChange={setIsDefault} />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.footerActions}>
        {addressId && (
          <TouchableOpacity style={[styles.deleteBtn, { borderColor: theme.error, backgroundColor: theme.background }]} onPress={handleDelete}>
            <Text style={{ color: theme.error, fontWeight: '700' }}>Xóa địa chỉ</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave} disabled={loading}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>HOÀN THÀNH</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  headerRow: { paddingTop: 44, paddingHorizontal: 0, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1 },
  backBtn: { padding: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  sectionCard: { borderRadius: 8, padding: 12, marginTop: 8, shadowColor: '#000', shadowOpacity: 0.03 },
  sectionTitle: { fontWeight: '700', marginBottom: 8 },
  label: { marginTop: 8, marginBottom: 4 },
  rowInput: { borderBottomWidth: 1, paddingVertical: 8 },
  selectRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mapContainer: { height: 220, marginTop: 16, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f6f6f6' },
  map: { flex: 1 },
  mapOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.8)', zIndex: 10, alignItems: 'center', justifyContent: 'center' },
  mapHint: { position: 'absolute', bottom: 8, left: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, flexDirection: 'row', alignItems: 'center' },
  footerActions: { position: 'absolute', left: 0, right: 0, bottom: 18, flexDirection: 'row', paddingHorizontal: 16, justifyContent: 'space-between', gap: 12 },
  deleteBtn: { flex: 1, borderWidth: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
});
