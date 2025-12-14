import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { getDirections, getMockDirections, getDirectionsKeyDebugInfo } from '@/services/directionsService';

type NavigationPhase = 'to_shop' | 'to_customer';

// Mock order data - Cập nhật địa điểm Hà Nội
const mockOrders: { [key: string]: any } = {
  ORD001: {
    id: 'ORD001',
    shopName: 'Nhà sách Tiền Phong',
    shopAddress: '175 Tây Sơn, Đống Đa, Hà Nội',
    shopPhone: '0243857302',
    shopLat: 21.0090,
    shopLng: 105.8210,
    
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    deliveryAddress: 'Royal City, 72 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    customerLat: 21.0031,
    customerLng: 105.8143,
  },
  ORD002: {
    id: 'ORD002',
    shopName: 'Nhà sách Fahasa Xã Đàn',
    shopAddress: '338 Xã Đàn, Đống Đa, Hà Nội',
    shopPhone: '0243573866',
    shopLat: 21.0146,
    shopLng: 105.8335,
    
    customerName: 'Trần Thị B',
    customerPhone: '0912345678',
    deliveryAddress: 'Times City, 458 Minh Khai, Hai Bà Trưng, Hà Nội',
    customerLat: 20.9959,
    customerLng: 105.8675,
  },
  ORD003: {
    id: 'ORD003',
    shopName: 'Nhà sách Tràng Tiền',
    shopAddress: '44 Tràng Tiền, Hoàn Kiếm, Hà Nội',
    shopPhone: '0243825350',
    shopLat: 21.0245,
    shopLng: 105.8550,
    
    customerName: 'Lê Văn C',
    customerPhone: '0923456789',
    deliveryAddress: 'Lotte Center, 54 Liễu Giai, Ba Đình, Hà Nội',
    customerLat: 21.0319,
    customerLng: 105.8123,
  },
};

export default function MapNavigationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const orderId = params.id as string;
  
  const [phase, setPhase] = useState<NavigationPhase>('to_shop');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const mapRef = React.useRef<MapView>(null);

  const order = mockOrders[orderId] || mockOrders.ORD001;

  useEffect(() => {
    console.log('Directions key debug:', getDirectionsKeyDebugInfo());
  }, []);

  // Lấy thông tin đích đến dựa trên phase
  const getDestination = useCallback(() => {
    if (phase === 'to_shop') {
      return {
        name: order.shopName,
        address: order.shopAddress,
        phone: order.shopPhone,
        lat: order.shopLat,
        lng: order.shopLng,
      };
    } else {
      return {
        name: order.customerName,
        address: order.deliveryAddress,
        phone: order.customerPhone,
        lat: order.customerLat,
        lng: order.customerLng,
      };
    }
  }, [phase, order]);

  const destination = getDestination();

  // Hàm tính khoảng cách Haversine
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Bán kính Trái Đất tính bằng km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Tính toán route với Google Directions
  const calculateRoute = useCallback(async () => {
    if (!currentLocation) {
      return;
    }

    try {
      // Ưu tiên Directions API (đường đi chuẩn theo road network). Nếu thiếu key/lỗi API thì fallback sang mock.
      const result = await getDirections(
        { lat: currentLocation.lat, lng: currentLocation.lng },
        { lat: destination.lat, lng: destination.lng }
      );

      setRouteCoordinates(result.coordinates);
      setDistance(result.distance);
      setDuration(result.duration);
      
      // Fit map to show entire route - chỉ nếu có đủ điểm
      if (result.coordinates.length >= 2 && mapRef.current) {
        setTimeout(() => {
          try {
            mapRef.current?.fitToCoordinates(result.coordinates, {
              edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
              animated: true,
            });
          } catch (err) {
            console.warn('Failed to fit map:', err);
          }
        }, 1000);
      }
    } catch (error) {
      console.warn('Directions API failed, falling back to mock route:', error);

      try {
        const mock = await getMockDirections(
          { lat: currentLocation.lat, lng: currentLocation.lng },
          { lat: destination.lat, lng: destination.lng }
        );
        setRouteCoordinates(mock.coordinates);
        setDistance(mock.distance);
        setDuration(mock.duration);

        if (mock.coordinates.length >= 2 && mapRef.current) {
          setTimeout(() => {
            try {
              mapRef.current?.fitToCoordinates(mock.coordinates, {
                edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
                animated: true,
              });
            } catch {
              // ignore
            }
          }, 500);
        }
      } catch {
        // Hard fallback: đường thẳng
        const fallbackRoute = [
          { latitude: currentLocation.lat, longitude: currentLocation.lng },
          { latitude: destination.lat, longitude: destination.lng },
        ];
        setRouteCoordinates(fallbackRoute);

        const dist = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          destination.lat,
          destination.lng
        );
        setDistance(`${dist.toFixed(1)} km`);
        setDuration(`${Math.round(dist * 3)} phút`);
      }
    }
  }, [currentLocation, destination]);

  // Lấy vị trí hiện tại của shipper
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Lỗi', 'Cần cấp quyền truy cập vị trí để sử dụng chức năng chỉ đường');
          // Fallback to mock location (Ga Hà Nội - để hiển thị bản đồ khu vực HN)
          setCurrentLocation({ lat: 21.0244, lng: 105.8412 });
          setIsLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        setCurrentLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error getting location:', error);
        // Fallback to mock location (Ga Hà Nội)
        setCurrentLocation({ lat: 21.0244, lng: 105.8412 });
        setIsLoading(false);
      }
    })();
  }, []);

  // Tính toán route khi có vị trí
  useEffect(() => {
    if (currentLocation) {
      calculateRoute();
    }
  }, [currentLocation, phase, calculateRoute]); // recalculate khi đổi phase/destination

  // Xác nhận đã lấy hàng
  const handleConfirmPickup = () => {
    Alert.alert(
      'Xác nhận lấy hàng',
      'Bạn đã lấy hàng thành công từ shop?',
      [
        { text: 'Chưa', style: 'cancel' },
        {
          text: 'Đã lấy hàng',
          onPress: () => {
            setPhase('to_customer');
            Alert.alert('Thành công', 'Bắt đầu chỉ đường đến khách hàng!');
          },
        },
      ]
    );
  };

  // Xác nhận đã giao hàng
  const handleConfirmDelivery = () => {
    Alert.alert(
      'Xác nhận giao hàng',
      'Bạn đã giao hàng thành công cho khách?',
      [
        { text: 'Chưa', style: 'cancel' },
        {
          text: 'Đã giao hàng',
          onPress: () => {
            Alert.alert('Hoàn thành', 'Đơn hàng đã được giao thành công!', [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ]);
          },
        },
      ]
    );
  };

  // Gọi điện thoại
  const handleCall = () => {
    Linking.openURL(`tel:${destination.phone}`);
  };

  // Mở Google Maps bên ngoài
  const handleOpenExternalMaps = () => {
    if (!currentLocation) return;
    // Cập nhật link map chuẩn hơn
    const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
    Linking.openURL(url);
  };

  if (isLoading || !currentLocation) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#E24A4A" />
        <Text style={{ marginTop: 16, color: '#666' }}>Đang lấy vị trí...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {phase === 'to_shop' ? 'Đến lấy hàng' : 'Đến giao hàng'}
          </Text>
          <Text style={styles.headerSubtitle}>#{order.id}</Text>
        </View>
        <TouchableOpacity onPress={handleOpenExternalMaps} style={styles.externalButton}>
          <Ionicons name="open-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          // Tránh crash/blank map trên iOS + Expo Go (Google provider có thể không sẵn). Android vẫn dùng Google.
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={{
            latitude: currentLocation.lat,
            longitude: currentLocation.lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsTraffic={true}
        >
          {/* Marker vị trí hiện tại */}
          <Marker
            coordinate={{
              latitude: currentLocation.lat,
              longitude: currentLocation.lng,
            }}
            title="Vị trí của bạn"
            description="Shipper"
            pinColor="#2196F3"
          />

          {/* Marker điểm đến */}
          <Marker
            coordinate={{
              latitude: destination.lat,
              longitude: destination.lng,
            }}
            title={destination.name}
            description={destination.address}
            pinColor={phase === 'to_shop' ? '#FF9800' : '#4CAF50'}
          >
            <View style={styles.customMarker}>
              <View style={[
                styles.markerInner,
                { backgroundColor: phase === 'to_shop' ? '#FF9800' : '#4CAF50' }
              ]}>
                <Ionicons 
                  name={phase === 'to_shop' ? 'storefront' : 'person'} 
                  size={20} 
                  color="#fff" 
                />
              </View>
              <View style={[
                styles.markerArrow,
                { borderTopColor: phase === 'to_shop' ? '#FF9800' : '#4CAF50' }
              ]} />
            </View>
          </Marker>

          {/* Vẽ đường route với style đẹp hơn */}
          {routeCoordinates.length >= 2 && (
            <>
              {/* Đường viền ngoài (outline) - màu tối */}
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#1976D2"
                strokeWidth={8}
                lineJoin="round"
                lineCap="round"
              />
              {/* Đường chính - màu sáng */}
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#2196F3"
                strokeWidth={5}
                lineJoin="round"
                lineCap="round"
              />
            </>
          )}
        </MapView>

        {/* Distance & Duration Info Overlay */}
        {distance && duration && (
          <View style={styles.routeInfoOverlay}>
            <View style={styles.routeInfoItem}>
              <Ionicons name="navigate" size={18} color="#4CAF50" />
              <Text style={styles.routeInfoText}>{distance}</Text>
            </View>
            <View style={styles.routeInfoDivider} />
            <View style={styles.routeInfoItem}>
              <Ionicons name="time" size={18} color="#2196F3" />
              <Text style={styles.routeInfoText}>{duration}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Destination Info */}
      <View style={styles.infoContainer}>
        <View style={styles.phaseIndicator}>
          <View style={[styles.phaseStep, phase === 'to_shop' && styles.phaseStepActive]}>
            <Ionicons 
              name={phase === 'to_shop' ? 'location' : 'checkmark-circle'} 
              size={20} 
              color={phase === 'to_shop' ? '#fff' : '#4CAF50'} 
            />
            <Text style={[styles.phaseText, phase === 'to_shop' && styles.phaseTextActive]}>
              Lấy hàng
            </Text>
          </View>
          <View style={styles.phaseLine} />
          <View style={[styles.phaseStep, phase === 'to_customer' && styles.phaseStepActive]}>
            <Ionicons 
              name={phase === 'to_customer' ? 'location' : 'ellipse-outline'} 
              size={20} 
              color={phase === 'to_customer' ? '#fff' : '#999'} 
            />
            <Text style={[styles.phaseText, phase === 'to_customer' && styles.phaseTextActive]}>
              Giao hàng
            </Text>
          </View>
        </View>

        <View style={styles.destinationCard}>
          <View style={styles.destinationHeader}>
            <Ionicons 
              name={phase === 'to_shop' ? 'storefront' : 'person'} 
              size={24} 
              color="#E24A4A" 
            />
            <View style={styles.destinationInfo}>
              <Text style={styles.destinationName}>{destination.name}</Text>
              <Text style={styles.destinationAddress} numberOfLines={2}>
                {destination.address}
              </Text>
            </View>
            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
              <Ionicons name="call" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {phase === 'to_shop' ? (
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleConfirmPickup}
            >
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.confirmButtonText}>Xác nhận đã lấy hàng</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleConfirmDelivery}
            >
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.confirmButtonText}>Xác nhận đã giao hàng</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
    backgroundColor: '#E24A4A',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
    marginTop: 2,
  },
  externalButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#E8E8E8',
  },
  map: {
    flex: 1,
  },
  customMarker: {
    alignItems: 'center',
  },
  markerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  routeInfoOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  routeInfoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  routeInfoDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  phaseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  phaseStep: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  phaseStepActive: {
    opacity: 1,
  },
  phaseText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  phaseTextActive: {
    color: '#E24A4A',
    fontWeight: '600',
  },
  phaseLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  destinationCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  destinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  destinationAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContainer: {
    gap: 12,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E24A4A',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});