import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [avatar, setAvatar] = useState('https://i.pravatar.cc/150?img=12');
  const [fullName, setFullName] = useState('Nguyễn Văn Shipper');
  const [phone, setPhone] = useState('0901234567');
  const [email, setEmail] = useState('shipper@example.com');
  const [address, setAddress] = useState('123 Nguyễn Văn Linh, Q.7, TP.HCM');
  const [idCard, setIdCard] = useState('079123456789');
  const [birthDate, setBirthDate] = useState('15/03/1995');
  const [isEditing, setIsEditing] = useState(false);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để thay đổi ảnh đại diện');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    Alert.alert(
      'Lưu thành công',
      'Thông tin cá nhân đã được cập nhật',
      [{ text: 'OK', onPress: () => setIsEditing(false) }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text style={styles.editText}>{isEditing ? 'Hủy' : 'Sửa'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            {isEditing && (
              <TouchableOpacity style={styles.cameraButton} onPress={handlePickAvatar}>
                <Ionicons name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.avatarHint}>Nhấn vào ảnh để thay đổi</Text>
        </View>

        {/* Info Form */}
        <View style={styles.formContainer}>
          {/* Full Name */}
          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.label}>Họ và tên</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={fullName}
              onChangeText={setFullName}
              editable={isEditing}
              placeholder="Nhập họ và tên"
            />
          </View>

          {/* Phone */}
          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <Text style={styles.label}>Số điện thoại</Text>
            </View>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={phone}
              editable={false}
              keyboardType="phone-pad"
            />
            <Text style={styles.hint}>Số điện thoại không thể thay đổi</Text>
          </View>

          {/* Email */}
          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <Text style={styles.label}>Email</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={email}
              onChangeText={setEmail}
              editable={isEditing}
              keyboardType="email-address"
              placeholder="Nhập email"
            />
          </View>

          {/* Birth Date */}
          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.label}>Ngày sinh</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={birthDate}
              onChangeText={setBirthDate}
              editable={isEditing}
              placeholder="DD/MM/YYYY"
            />
          </View>

          {/* ID Card */}
          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="card-outline" size={20} color="#666" />
              <Text style={styles.label}>CCCD/CMND</Text>
            </View>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={idCard}
              editable={false}
              keyboardType="number-pad"
            />
            <Text style={styles.hint}>CCCD không thể thay đổi</Text>
          </View>

          {/* Address */}
          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.label}>Địa chỉ</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={address}
              onChangeText={setAddress}
              editable={isEditing}
              placeholder="Nhập địa chỉ"
              multiline
            />
          </View>

          {/* Verification Status */}
          <View style={styles.verificationCard}>
            <View style={styles.verificationHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
              <Text style={styles.verificationTitle}>Trạng thái xác minh</Text>
            </View>
            <View style={styles.verificationItem}>
              <Text style={styles.verificationLabel}>Số điện thoại</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.verifiedText}>Đã xác minh</Text>
              </View>
            </View>
            <View style={styles.verificationItem}>
              <Text style={styles.verificationLabel}>CCCD/CMND</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.verifiedText}>Đã xác minh</Text>
              </View>
            </View>
            <View style={styles.verificationItem}>
              <Text style={styles.verificationLabel}>Email</Text>
              <View style={styles.pendingBadge}>
                <Ionicons name="time-outline" size={16} color="#FF9800" />
                <Text style={styles.pendingText}>Chưa xác minh</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Save Button */}
        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  editText: {
    fontSize: 16,
    color: '#E24A4A',
    fontWeight: '600',
  },
  avatarSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 15,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#E24A4A',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#E24A4A',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarHint: {
    marginTop: 10,
    fontSize: 12,
    color: '#999',
  },
  formContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  formGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E24A4A',
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
    color: '#999',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  verificationCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  verificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  verificationLabel: {
    fontSize: 14,
    color: '#666',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  verifiedText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pendingText: {
    fontSize: 13,
    color: '#FF9800',
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#E24A4A',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#E24A4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
