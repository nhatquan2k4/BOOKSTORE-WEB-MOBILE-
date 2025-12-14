import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function ProfileDetails() {
  const router = useRouter();
  // use inline SVG Path via react-native-svg

  const info = {
    name: 'Nguyên Phạm',
    bio: 'Yêu sách, cà phê và code.',
    gender: 'Nam',
    dob: '01/01/1990',
    phone: '+84 912 345 678',
    email: 'nguyen@example.com',
  };

  const [avatar, setAvatar] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền bị từ chối', 'Cần quyền truy cập kho ảnh để chọn avatar.');
      }
    })();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ backgroundColor: '#f0ede4' }}>  
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerWrapper}>
          <Svg width={width} height={180} style={styles.wave} viewBox="0 0 1440 320">
            <Path fill="#f0ede4" d="M0,128L30,133.3C60,139,120,149,180,170.7C240,192,300,224,360,240C420,256,480,256,540,250.7C600,245,660,235,720,208C780,181,840,139,900,149.3C960,160,1020,224,1080,245.3C1140,267,1200,245,1260,229.3C1320,213,1380,203,1410,197.3L1440,192L1440,0L1410,0C1380,0,1320,0,1260,0C1200,0,1140,0,1080,0C1020,0,960,0,900,0C840,0,780,0,720,0C660,0,600,0,540,0C480,0,420,0,360,0C300,0,240,0,180,0C120,0,60,0,30,0L0,0Z" />
          </Svg>
          <Text style={styles.title}>Hồ sơ của tôi</Text>

          <TouchableOpacity 
            style={styles.avatarWrap} 
            onPress={async () => {
                try {
                  const result = await ImagePicker.launchImageLibraryAsync({ 
                    mediaTypes: 'images',        // ĐÃ SỬA: hết warning ngay lập tức
                    quality: 0.7, 
                    allowsEditing: true, 
                    aspect: [1,1] 
                  });
                  if (!result.canceled) {
                    setAvatar({ uri: result.assets[0].uri });
                  }
                } catch (e) {
                  console.warn(e);
                }
            }} 
            activeOpacity={0.8}>
            {avatar ? (
              <Image source={avatar} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarRed}>
                <Text style={styles.avatarText}>AVT</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>  

  {/* (system gallery used on avatar tap) */}

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Tên</Text>
          <Text style={styles.value}>{info.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Bio</Text>
          <Text style={styles.value}>{info.bio}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Giới tính</Text>
          <Text style={styles.value}>{info.gender}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Ngày sinh</Text>
          <Text style={styles.value}>{info.dob}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Điện thoại</Text>
          <Text style={styles.value}>{info.phone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{info.email}</Text>
        </View>
      </View>
      <View style={styles.footerAction}>
        <TouchableOpacity style={styles.editProfileBtn} onPress={() => { /* noop for now */ }} activeOpacity={0.85}>
          <View style={styles.editBtnContent}>
            <Ionicons name="create-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.editProfileBtnText}>Sửa hồ sơ</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerWrapper: { height: 140, backgroundColor: '#fff', alignItems: 'center', marginTop: 200 },
  wave: { position: 'absolute', width: width, height: 140, top: -45, left: 0 },
  back: { position: 'absolute', top: 36, left: 12, zIndex: 10, padding: 6, backgroundColor: 'transparent' },
  title: { marginTop: -70, fontSize: 25, fontWeight: '700', color: '#111' },
  avatarWrap: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' },
  avatarRed: { width: 130, height: 130, borderRadius: 70, backgroundColor: '#e53935', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, borderWidth: 2, borderColor: '#fff' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  card: { marginTop: 48, marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  label: { color: '#777', fontSize: 14 },
  value: { color: '#333', fontSize: 15, maxWidth: '65%', textAlign: 'right' },
  avatarImage: { width: 130, height: 130, borderRadius: 70, borderWidth: 2, borderColor: '#fff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  avatarChoice: { marginRight: 12 },
  modalBtnSecondary: { backgroundColor: '#f0f0f0', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  footerAction: { marginTop: 50, paddingHorizontal: 16, marginBottom: 24, width: '50%', alignSelf: 'center' },
  editProfileBtn: { backgroundColor: '#d2b48c', paddingVertical: 12, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 6 }, shadowRadius: 10, elevation: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  editBtnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  editProfileBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
