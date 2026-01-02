import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import userProfileService from '@/src/services/userProfileService';
import type { UserProfile, UpdateUserProfileDto } from '@/src/types/userProfile';
import avatarStore from '@/src/utils/avatarStore';
import { TextInput, Modal } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function ProfileDetails() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  
  // State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateUserProfileDto>({});
  const [saving, setSaving] = useState(false);

  // Fetch profile khi component mount
  useEffect(() => {
    fetchProfile();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền bị từ chối', 'Cần quyền truy cập kho ảnh để chọn avatar.');
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userProfileService.getMyProfile();
      setProfile(data);
      // Initialize form when profile loads
      setForm({
        fullName: data.fullName,
        bio: data.bio,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        phoneNumber: data.phoneNumber,
      });
      
      // Set avatar từ server nếu có
      if (data.avatarUrl) {
        setAvatar({ uri: data.avatarUrl });
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAvatar = async (fileUri: string) => {
    try {
      setUploading(true);
      const avatarUrl = await userProfileService.uploadAvatar(fileUri);
      
      // Cập nhật avatar local
  setAvatar({ uri: avatarUrl });
  // Notify other screens
  avatarStore.setAvatar(avatarUrl);
      
      // Refresh profile để lấy data mới nhất
      await fetchProfile();
      
      Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Lỗi', error.message || 'Không thể upload ảnh đại diện');
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ 
        mediaTypes: 'images',
        quality: 0.7, 
        allowsEditing: true, 
        aspect: [1, 1] 
      });
      
      if (!result.canceled) {
        const fileUri = result.assets[0].uri;
        setAvatar({ uri: fileUri }); // Preview local trước
        await handleUploadAvatar(fileUri); // Upload lên server
      }
    } catch (e) {
      console.warn('Error picking image:', e);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const openEdit = () => {
    setForm({
      fullName: profile?.fullName,
      bio: profile?.bio,
      gender: profile?.gender,
  dateOfBirth: profile?.dateOfBirth,
      phoneNumber: profile?.phoneNumber,
    });
    // If dateOfBirth exists, split into day/month/year in form helpers
    if (profile?.dateOfBirth) {
      try {
        const parts = profile.dateOfBirth.split('-'); // expecting YYYY-MM-DD
        if (parts.length === 3) {
          setForm((f) => ({ ...f, day: parts[2], month: parts[1], year: parts[0] } as any));
        }
      } catch {
        // ignore
      }
    }
    setEditing(true);
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      // If day/month/year fields exist in form, combine them into dateOfBirth
      const dto = { ...form } as any;
      if ((dto.day || dto.month || dto.year) && !(dto.dateOfBirth && dto.dateOfBirth.includes('-'))) {
        const day = (dto.day || '').toString().padStart(2, '0');
        const month = (dto.month || '').toString().padStart(2, '0');
        const year = (dto.year || '').toString();
        dto.dateOfBirth = `${year}-${month}-${day}`;
        // remove helper fields
        delete dto.day; delete dto.month; delete dto.year;
      }

      await userProfileService.updateMyProfile(dto);
      // Refresh
      await fetchProfile();
      setEditing(false);
      Alert.alert('Thành công', 'Đã cập nhật hồ sơ');
    } catch (e: any) {
      console.error('Error updating profile:', e);
      Alert.alert('Lỗi', e.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  // Show loading
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 10, color: theme.textSecondary }}>Đang tải...</Text>
      </View>
    );
  }

  // Show error if no profile
  if (!profile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: theme.background }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <Ionicons name="alert-circle-outline" size={64} color={theme.error} />
        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 20, color: theme.text }}>Không tìm thấy thông tin</Text>
        <TouchableOpacity onPress={fetchProfile} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.primary, fontWeight: '600' }}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <View style={{ backgroundColor: theme.headerBackground }}>  
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerWrapper}>
          <Svg width={width} height={180} style={styles.wave} viewBox="0 0 1440 320">
            <Path fill={theme.headerBackground} d="M0,128L30,133.3C60,139,120,149,180,170.7C240,192,300,224,360,240C420,256,480,256,540,250.7C600,245,660,235,720,208C780,181,840,139,900,149.3C960,160,1020,224,1080,245.3C1140,267,1200,245,1260,229.3C1320,213,1380,203,1410,197.3L1440,192L1440,0L1410,0C1380,0,1320,0,1260,0C1200,0,1140,0,1080,0C1020,0,960,0,900,0C840,0,780,0,720,0C660,0,600,0,540,0C480,0,420,0,360,0C300,0,240,0,180,0C120,0,60,0,30,0L0,0Z" />
          </Svg>
          <Text style={[styles.title, { color: theme.text }]}>Hồ sơ của tôi</Text>

          <TouchableOpacity 
            style={styles.avatarWrap} 
            onPress={pickImage}
            disabled={uploading}
            activeOpacity={0.8}>
            {uploading ? (
              <View style={styles.avatarRed}>
                <ActivityIndicator color="#fff" />
              </View>
            ) : avatar ? (
              <Image source={avatar} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: isDarkMode ? '#2A2A2A' : '#f5f5f5', borderColor: theme.border }]}>
                <Text style={[styles.avatarInitials, { color: theme.textSecondary }]}>{profile?.fullName ? profile.fullName.split(' ').map(n => n[0]).slice(-2).join('') : 'U'}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>  

  {/* (system gallery used on avatar tap) */}

      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <View style={[styles.row, { borderBottomColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Tên</Text>
          <Text style={[styles.value, { color: theme.text }]}>{profile.fullName || 'Chưa cập nhật'}</Text>
        </View>
        <View style={[styles.row, { borderBottomColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Bio</Text>
          <Text style={[styles.value, { color: theme.text }]}>{profile.bio || 'Chưa có giới thiệu'}</Text>
        </View>
        <View style={[styles.row, { borderBottomColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Giới tính</Text>
          <Text style={[styles.value, { color: theme.text }]}>{profile.gender || 'Chưa cập nhật'}</Text>
        </View>
        <View style={[styles.row, { borderBottomColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Ngày sinh</Text>
          <Text style={[styles.value, { color: theme.text }]}>{formatDate(profile.dateOfBirth)}</Text>
        </View>
        <View style={[styles.row, { borderBottomColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Điện thoại</Text>
          <Text style={[styles.value, { color: theme.text }]}>{profile.phoneNumber || 'Chưa cập nhật'}</Text>
        </View>
        {/* Email không có trong UserProfile, cần lấy từ User identity nếu cần */}
      </View>
      <View style={styles.footerAction}>
        <TouchableOpacity style={[styles.editProfileBtn, { backgroundColor: theme.primary }]} onPress={openEdit} activeOpacity={0.85}>
          <View style={styles.editBtnContent}>
            <Ionicons name="create-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.editProfileBtnText}>Sửa hồ sơ</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Edit Modal */}
      <Modal visible={editing} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Sửa hồ sơ</Text>
            <ScrollView>
              <Text style={{ marginBottom: 6, color: theme.text }}>Họ và tên</Text>
              <TextInput value={form.fullName} onChangeText={(t) => setForm({ ...form, fullName: t })} style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]} placeholderTextColor={theme.textTertiary} />

              <Text style={{ marginTop: 10, marginBottom: 6, color: theme.text }}>Bio</Text>
              <TextInput value={form.bio} onChangeText={(t) => setForm({ ...form, bio: t })} style={[styles.input, { height: 80, backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]} multiline placeholderTextColor={theme.textTertiary} />

              <Text style={{ marginTop: 10, marginBottom: 6, color: theme.text }}>Giới tính</Text>
              <TextInput value={form.gender} onChangeText={(t) => setForm({ ...form, gender: t })} style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]} placeholderTextColor={theme.textTertiary} />

              <Text style={{ marginTop: 10, marginBottom: 6, color: theme.text }}>Ngày sinh (YYYY-MM-DD)</Text>
              <TextInput value={form.dateOfBirth} onChangeText={(t) => setForm({ ...form, dateOfBirth: t })} style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]} placeholderTextColor={theme.textTertiary} />

              <Text style={{ marginTop: 10, marginBottom: 6, color: theme.text }}>Số điện thoại</Text>
              <TextInput value={form.phoneNumber} onChangeText={(t) => setForm({ ...form, phoneNumber: t })} style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]} keyboardType="phone-pad" placeholderTextColor={theme.textTertiary} />

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 14 }}>
                <TouchableOpacity onPress={() => setEditing(false)} style={{ marginRight: 12 }}>
                  <Text style={{ color: theme.textSecondary }}>Huỷ</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveProfile} disabled={saving}>
                  <Text style={{ color: theme.primary, fontWeight: '700' }}>{saving ? 'Đang lưu...' : 'Lưu'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerWrapper: { height: 10, backgroundColor: '#fff', alignItems: 'center', marginTop: 180, zIndex: 2 },
  wave: { position: 'absolute', width: width, height: 140, top: -45, left: 0, zIndex: 0 },
  back: { position: 'absolute', top: 36, left: 12, zIndex: 10, padding: 6, backgroundColor: 'transparent' },
  title: { marginTop: -70, fontSize: 25, fontWeight: '700', color: '#111', zIndex: 5 },
  avatarWrap: { position: 'absolute', top: -10, left: 0, right: 0, alignItems: 'center', zIndex: 10, elevation: 10, },
  avatarRed: { width: 130, height: 130, borderRadius: 70, backgroundColor: '#e53935', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, borderWidth: 2, borderColor: '#fff' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  avatarPlaceholder: { width: 130, height: 130, borderRadius: 70, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  avatarInitials: { color: '#777', fontSize: 24, fontWeight: '700' },
  card: { marginTop: 170, marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  label: { color: '#777', fontSize: 14 },
  value: { color: '#333', fontSize: 15, maxWidth: '65%', textAlign: 'right' },
  avatarImage: { width: 130, height: 130, borderRadius: 70, borderWidth: 2, borderColor: '#fff', elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  avatarChoice: { marginRight: 12 },
  modalBtnSecondary: { backgroundColor: '#f0f0f0', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#fff' },
  footerAction: { marginTop: 50, paddingHorizontal: 16, marginBottom: 24, width: '50%', alignSelf: 'center' },
  editProfileBtn: { backgroundColor: '#d2b48c', paddingVertical: 12, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 6 }, shadowRadius: 10, elevation: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  editBtnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  editProfileBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
