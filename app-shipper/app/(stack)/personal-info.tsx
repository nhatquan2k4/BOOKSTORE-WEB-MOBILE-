import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { profileService, UserProfile } from '@/services/profileService';
import { API_CONFIG } from '@/constants/config';
import { useAuth } from '@/context/AuthContext';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatar, setAvatar] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [idCard, setIdCard] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const profileData = await profileService.getMyProfile();
      setProfile(profileData);
      
      // Populate form fields
      setFullName(profileData.fullName || '');
      setPhone(profileData.phoneNumber || '');
      setEmail(user?.email || ''); // Email from user context
      setAddress('');
      setIdCard('');
      setBirthDate(profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString('vi-VN') : '');
      setAvatar(getAvatarUrl(profileData.avatarUrl));
    } catch (error: any) {
      console.error('Error loading profile:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (avatarUrl?: string) => {
    if (avatarUrl) {
      if (avatarUrl.startsWith('http')) {
        console.log('[PersonalInfo] Avatar URL (full):', avatarUrl);
        return avatarUrl;
      }
      const fullUrl = `${API_CONFIG.IMAGE_BASE_URL}${avatarUrl}`;
      console.log('[PersonalInfo] Avatar URL (constructed):', fullUrl);
      return fullUrl;
    }
    console.log('[PersonalInfo] Using default avatar');
    return 'https://i.pravatar.cc/150?img=12';
  };

  const handlePickAvatar = async () => {
    if (!isEditing) return;
    
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
      try {
        setUploading(true);
        const imageUri = result.assets[0].uri;
        
        console.log('[PersonalInfo] Selected image URI:', imageUri);
        console.log('[PersonalInfo] Image details:', {
          width: result.assets[0].width,
          height: result.assets[0].height,
          fileSize: result.assets[0].fileSize,
        });
        
        // Show local image immediately for better UX
        setAvatar(imageUri);
        
        console.log('[PersonalInfo] Starting upload...');
        
        // Upload to server
        const newAvatarUrl = await profileService.uploadAvatar(imageUri);
        
        console.log('[PersonalInfo] Upload successful, new URL:', newAvatarUrl);
        
        // Update avatar URL directly without reloading entire profile
        setAvatar(getAvatarUrl(newAvatarUrl));
        
        // Update profile state
        if (profile) {
          setProfile({
            ...profile,
            avatarUrl: newAvatarUrl,
          });
        }
        
        console.log('[PersonalInfo] Avatar updated in state');
        
        Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện');
      } catch (error: any) {
        console.error('[PersonalInfo] Error uploading avatar:', {
          message: error.message,
          error: error,
        });
        Alert.alert(
          'Lỗi upload ảnh', 
          error.message || 'Không thể tải lên ảnh đại diện'
        );
        // Reload original avatar on error
        await loadProfileData();
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare update DTO - only include fields that are changed
      const updateDto: any = {};
      
      if (fullName && fullName !== profile?.fullName) {
        updateDto.fullName = fullName;
      }
      
      if (phone && phone !== profile?.phoneNumber) {
        updateDto.phoneNumber = phone;
      }
      
      if (birthDate) {
        const isoDate = convertToISODate(birthDate);
        // Only add if valid ISO date
        if (isoDate && isoDate !== profile?.dateOfBirth) {
          updateDto.dateOfBirth = isoDate;
        }
      }

      console.log('[PersonalInfo] Updating profile with:', updateDto);

      // Only call API if there are changes
      if (Object.keys(updateDto).length === 0) {
        Alert.alert('Thông báo', 'Không có thay đổi nào để lưu');
        setIsEditing(false);
        return;
      }

      await profileService.updateMyProfile(updateDto);
      
      Alert.alert(
        'Lưu thành công',
        'Thông tin cá nhân đã được cập nhật',
        [{ text: 'OK', onPress: () => {
          setIsEditing(false);
          loadProfileData();
        }}]
      );
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert('Lỗi', error.message || 'Không thể lưu thông tin');
    } finally {
      setSaving(false);
    }
  };

  const convertToISODate = (dateString: string): string | null => {
    try {
      // Convert DD/MM/YYYY to ISO format YYYY-MM-DD
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        
        // Validate date
        const date = new Date(`${year}-${month}-${day}`);
        if (!isNaN(date.getTime())) {
          return `${year}-${month}-${day}T00:00:00.000Z`;
        }
      }
      return null;
    } catch (error) {
      console.error('Error converting date:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E24A4A" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </KeyboardAvoidingView>
    );
  }

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
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)} disabled={saving}>
          <Text style={styles.editText}>{isEditing ? 'Hủy' : 'Sửa'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: avatar }} 
              style={styles.avatar}
              onError={(error) => {
                console.error('[PersonalInfo] Image load error:', error.nativeEvent.error);
                console.error('[PersonalInfo] Failed URL:', avatar);
              }}
              onLoad={() => {
                console.log('[PersonalInfo] Image loaded successfully:', avatar);
              }}
            />
            {isEditing && (
              <TouchableOpacity 
                style={styles.cameraButton} 
                onPress={handlePickAvatar}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="camera" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.avatarHint}>
            {isEditing ? 'Nhấn vào ảnh để thay đổi' : 'Bấm "Sửa" để thay đổi ảnh'}
          </Text>
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
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.saveButtonText}>Đang lưu...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
              </>
            )}
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
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
});
