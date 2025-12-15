import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Vehicle {
  id: number;
  type: string;
  brand: string;
  model: string;
  licensePlate: string;
  color: string;
  year: string;
  registrationPhoto?: string;
  insurancePhoto?: string;
  vehiclePhoto?: string;
  registrationExpiry: string;
  insuranceExpiry: string;
  isActive: boolean;
}

export default function VehicleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 1,
      type: 'Xe máy',
      brand: 'Honda',
      model: 'Wave Alpha',
      licensePlate: '59X1-12345',
      color: 'Đỏ',
      year: '2020',
      registrationExpiry: '15/12/2025',
      insuranceExpiry: '20/06/2025',
      isActive: true,
      vehiclePhoto: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=400',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    type: 'Xe máy',
    brand: '',
    model: '',
    licensePlate: '',
    color: '',
    year: '',
    registrationExpiry: '',
    insuranceExpiry: '',
  });

  const handlePickImage = async (vehicleId: number, type: 'registration' | 'insurance' | 'vehicle') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setVehicles(vehicles.map(v => {
        if (v.id === vehicleId) {
          if (type === 'registration') return { ...v, registrationPhoto: result.assets[0].uri };
          if (type === 'insurance') return { ...v, insurancePhoto: result.assets[0].uri };
          if (type === 'vehicle') return { ...v, vehiclePhoto: result.assets[0].uri };
        }
        return v;
      }));
      Alert.alert('Thành công', 'Đã tải ảnh lên');
    }
  };

  const handleSetActive = (id: number) => {
    setVehicles(vehicles.map(v => ({
      ...v,
      isActive: v.id === id,
    })));
    Alert.alert('Thành công', 'Đã chọn phương tiện đang sử dụng');
  };

  const handleDeleteVehicle = (id: number) => {
    const vehicle = vehicles.find(v => v.id === id);
    if (vehicle?.isActive && vehicles.length > 1) {
      Alert.alert('Không thể xóa', 'Vui lòng chọn phương tiện khác làm mặc định trước khi xóa.');
      return;
    }

    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa phương tiện này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setVehicles(vehicles.filter(v => v.id !== id));
          },
        },
      ]
    );
  };

  const handleAddVehicle = () => {
    if (!newVehicle.brand || !newVehicle.licensePlate || !newVehicle.color) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    const vehicle: Vehicle = {
      id: Date.now(),
      ...newVehicle,
      isActive: vehicles.length === 0,
    };

    setVehicles([...vehicles, vehicle]);
    setNewVehicle({
      type: 'Xe máy',
      brand: '',
      model: '',
      licensePlate: '',
      color: '',
      year: '',
      registrationExpiry: '',
      insuranceExpiry: '',
    });
    setShowAddModal(false);
    Alert.alert('Thành công', 'Đã thêm phương tiện');
  };

  const getVehicleIcon = (type: string) => {
    if (type === 'Xe máy') return 'bicycle';
    if (type === 'Xe ô tô') return 'car';
    return 'bicycle';
  };

  const isExpiringSoon = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    const expiryDate = new Date(year, month - 1, day);
    const today = new Date();
    const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phương tiện</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle" size={28} color="#E24A4A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#2196F3" />
          <Text style={styles.infoBannerText}>
            Thông tin phương tiện được sử dụng để xác minh và hỗ trợ trong quá trình giao hàng
          </Text>
        </View>

        {/* Vehicles List */}
        <View style={styles.vehiclesList}>
          {vehicles.map((vehicle) => (
            <View key={vehicle.id} style={styles.vehicleCard}>
              {vehicle.isActive && (
                <View style={styles.activeBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                  <Text style={styles.activeText}>Đang sử dụng</Text>
                </View>
              )}

              {/* Vehicle Photo */}
              {vehicle.vehiclePhoto && (
                <Image source={{ uri: vehicle.vehiclePhoto }} style={styles.vehicleImage} />
              )}

              <View style={styles.vehicleHeader}>
                <View style={styles.vehicleIconContainer}>
                  <Ionicons name={getVehicleIcon(vehicle.type)} size={30} color="#E24A4A" />
                </View>
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleType}>{vehicle.type}</Text>
                  <Text style={styles.vehicleModel}>
                    {vehicle.brand} {vehicle.model}
                  </Text>
                </View>
              </View>

              <View style={styles.vehicleDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="car-outline" size={18} color="#666" />
                  <Text style={styles.detailLabel}>Biển số:</Text>
                  <Text style={styles.detailValue}>{vehicle.licensePlate}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="color-palette-outline" size={18} color="#666" />
                  <Text style={styles.detailLabel}>Màu sắc:</Text>
                  <Text style={styles.detailValue}>{vehicle.color}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={18} color="#666" />
                  <Text style={styles.detailLabel}>Năm sản xuất:</Text>
                  <Text style={styles.detailValue}>{vehicle.year || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              {/* Documents Section */}
              <View style={styles.documentsSection}>
                <Text style={styles.documentsTitle}>Giấy tờ xe</Text>
                
                <View style={styles.documentRow}>
                  <View style={styles.documentInfo}>
                    <Ionicons name="document-text-outline" size={20} color="#666" />
                    <View style={styles.documentTextContainer}>
                      <Text style={styles.documentLabel}>Đăng ký xe</Text>
                      <Text style={[
                        styles.documentExpiry,
                        isExpiringSoon(vehicle.registrationExpiry) && styles.expiryWarning
                      ]}>
                        Hết hạn: {vehicle.registrationExpiry}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => handlePickImage(vehicle.id, 'registration')}
                  >
                    <Ionicons
                      name={vehicle.registrationPhoto ? 'checkmark-circle' : 'cloud-upload-outline'}
                      size={20}
                      color={vehicle.registrationPhoto ? '#4CAF50' : '#E24A4A'}
                    />
                    <Text style={styles.uploadText}>
                      {vehicle.registrationPhoto ? 'Đã tải' : 'Tải lên'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.documentRow}>
                  <View style={styles.documentInfo}>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
                    <View style={styles.documentTextContainer}>
                      <Text style={styles.documentLabel}>Bảo hiểm</Text>
                      <Text style={[
                        styles.documentExpiry,
                        isExpiringSoon(vehicle.insuranceExpiry) && styles.expiryWarning
                      ]}>
                        Hết hạn: {vehicle.insuranceExpiry}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => handlePickImage(vehicle.id, 'insurance')}
                  >
                    <Ionicons
                      name={vehicle.insurancePhoto ? 'checkmark-circle' : 'cloud-upload-outline'}
                      size={20}
                      color={vehicle.insurancePhoto ? '#4CAF50' : '#E24A4A'}
                    />
                    <Text style={styles.uploadText}>
                      {vehicle.insurancePhoto ? 'Đã tải' : 'Tải lên'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.uploadVehiclePhotoButton}
                  onPress={() => handlePickImage(vehicle.id, 'vehicle')}
                >
                  <Ionicons name="camera-outline" size={20} color="#E24A4A" />
                  <Text style={styles.uploadVehiclePhotoText}>
                    {vehicle.vehiclePhoto ? 'Đổi ảnh phương tiện' : 'Thêm ảnh phương tiện'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Actions */}
              <View style={styles.vehicleActions}>
                {!vehicle.isActive && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSetActive(vehicle.id)}
                  >
                    <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
                    <Text style={styles.actionButtonText}>Đang sử dụng</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteVehicle(vehicle.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#E24A4A" />
                  <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {vehicles.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="bicycle-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có phương tiện</Text>
            <Text style={styles.emptySubtext}>Thêm phương tiện để bắt đầu giao hàng</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Vehicle Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm phương tiện</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close-circle" size={28} color="#9999" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Loại xe *</Text>
                <View style={styles.typeSelector}>
                  {['Xe máy', 'Xe ô tô'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        newVehicle.type === type && styles.typeButtonActive,
                      ]}
                      onPress={() => setNewVehicle({ ...newVehicle, type })}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          newVehicle.type === type && styles.typeButtonTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Hãng xe *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newVehicle.brand}
                  onChangeText={(text) => setNewVehicle({ ...newVehicle, brand: text })}
                  placeholder="VD: Honda, Yamaha, Toyota..."
                  placeholderTextColor="#777777" 
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Dòng xe</Text>
                <TextInput
                  style={styles.formInput}
                  value={newVehicle.model}
                  onChangeText={(text) => setNewVehicle({ ...newVehicle, model: text })}
                  placeholder="VD: Wave Alpha, Vision..."
                  placeholderTextColor="#777777" 
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Biển số xe *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newVehicle.licensePlate}
                  onChangeText={(text) =>
                    setNewVehicle({ ...newVehicle, licensePlate: text.toUpperCase() })
                  }
                  placeholder="VD: 59X1-12345"
                  placeholderTextColor="#777777" 
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Màu sắc *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newVehicle.color}
                  onChangeText={(text) => setNewVehicle({ ...newVehicle, color: text })}
                  placeholder="VD: Đỏ, Đen, Trắng..."
                  placeholderTextColor="#777777" 
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Năm sản xuất</Text>
                <TextInput
                  style={styles.formInput}
                  value={newVehicle.year}
                  onChangeText={(text) => setNewVehicle({ ...newVehicle, year: text })}
                  placeholder="VD: 2020"
                  placeholderTextColor="#777777" 
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Hết hạn đăng ký</Text>
                <TextInput
                  style={styles.formInput}
                  value={newVehicle.registrationExpiry}
                  onChangeText={(text) =>
                    setNewVehicle({ ...newVehicle, registrationExpiry: text })
                  }
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#777777" 
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Hết hạn bảo hiểm</Text>
                <TextInput
                  style={styles.formInput}
                  value={newVehicle.insuranceExpiry}
                  onChangeText={(text) =>
                    setNewVehicle({ ...newVehicle, insuranceExpiry: text })
                  }
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#777777" 
                />
              </View>

              <TouchableOpacity style={styles.addButton} onPress={handleAddVehicle}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Thêm phương tiện</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoBanner: {
    backgroundColor: '#E3F2FD',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
  },
  vehiclesList: {
    padding: 15,
  },
  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  activeText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  vehicleImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 15,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  vehicleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  vehicleModel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  vehicleDetails: {
    gap: 10,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  documentsSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  documentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  documentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  documentTextContainer: {
    flex: 1,
  },
  documentLabel: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  documentExpiry: {
    fontSize: 11,
    color: '#666',
  },
  expiryWarning: {
    color: '#FF9800',
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  uploadText: {
    fontSize: 12,
    color: '#666',
  },
  uploadVehiclePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E24A4A',
    borderStyle: 'dashed',
    marginTop: 5,
  },
  uploadVehiclePhotoText: {
    fontSize: 13,
    color: '#E24A4A',
    fontWeight: '600',
  },
  vehicleActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  deleteButtonText: {
    color: '#E24A4A',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formGroup: {
    marginTop: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  typeButtonActive: {
    borderColor: '#E24A4A',
    backgroundColor: '#FFEBEE',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#E24A4A',
    fontWeight: '600',
  },
  formInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E24A4A',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#E24A4A',
    marginTop: 30,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});