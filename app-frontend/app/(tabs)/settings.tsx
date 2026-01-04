import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// ...existing imports above
import { useRouter } from 'expo-router';
import { useAuth } from '@/app/providers/AuthProvider';
import userProfileService from '@/src/services/userProfileService';
import { useEffect } from 'react';
import { useState } from 'react';
import avatarStore from '@/src/utils/avatarStore';
import { useTheme } from '@/context/ThemeContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { theme, isDarkMode, setDarkMode } = useTheme();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await userProfileService.getMyProfile();
        if (mounted && profile?.avatarUrl) setAvatarUri(profile.avatarUrl);
      } catch (e) {
        // ignore
      }
    })();
    const unsubscribe = avatarStore.onAvatarChanged((uri) => {
      if (mounted) setAvatarUri(uri);
    });
    return () => { mounted = false; unsubscribe(); };
  }, []);

  // Xử lý đăng xuất
  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?',
      [
        {
          text: 'Huỷ',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
              // AuthProvider sẽ tự động redirect về login
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const otherSettings = [
    { id: 1, icon: 'person-outline', label: 'Hồ sơ của tôi', hasArrow: true, onPress: () => router.push('/(stack)/profile-details') },
    { id: 2, icon: 'lock-closed-outline', label: 'Đổi mật khẩu', hasArrow: true, onPress: () => router.push('/(stack)/change-password') },
    { id: 3, icon: 'location-outline', label: 'Địa chỉ', hasArrow: true, onPress: () => router.push('/(stack)/addresses') },

  ];

  const moreSettings = [
    { id: 1, icon: 'receipt-outline', label: 'Đơn hàng của tôi', hasArrow: true, onPress: () => router.push('/(stack)/orders') },
    { id: 2, icon: 'heart-outline', label: 'Danh sách yêu thích', hasArrow: true, onPress: () => router.push('/(stack)/wishlist') },
    { id: 3, icon: 'chatbubbles-outline', label: 'Trợ lý ảo', hasArrow: true, onPress: () => router.push('/(stack)/chatbot') },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Cài Đặt</Text>
        <View style={styles.placeholder} />
      </View>

      {/* User Profile Card */}
      <TouchableOpacity style={[styles.profileCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.profileLeft}>
          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImageSmall} />
            ) : (
              <Text style={styles.avatarEmoji}>👨</Text>
            )}
          </View>
          <View>
            <Text style={[styles.userName, { color: theme.text }]}>{user?.userName || 'Người dùng'}</Text>
            <Text style={[styles.userRole, { color: theme.textTertiary }]}>{user?.email || 'Thành viên'}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Other Settings Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>Các thiết lập</Text>
        <View style={[styles.settingsGroup, { backgroundColor: theme.cardBackground }]}>
          {otherSettings.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.settingItem,
                { borderBottomColor: theme.border },
                index === otherSettings.length - 1 && styles.settingItemLast,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon as any} size={20} color={theme.text} />
                </View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>{item.label}</Text>
              </View>
              {item.hasArrow && (
                <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
              )}
            </TouchableOpacity>
          ))}
          
          {/* Dark Mode Toggle */}
          <View style={[styles.settingItem, styles.settingItemLast, { borderBottomColor: theme.border }]}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="moon-outline" size={20} color={theme.text} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Chế độ tối</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#ddd', true: '#4CAF50' }}
              thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
            />
          </View>


        </View>
      </View>

      {/* More Settings Section */}
      <View style={styles.section}>
        <View style={[styles.settingsGroup, { backgroundColor: theme.cardBackground }]}>
          {moreSettings.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.settingItem,
                { borderBottomColor: theme.border },
                index === moreSettings.length - 1 && styles.settingItemLast,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon as any} size={20} color={theme.text} />
                </View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>{item.label}</Text>
              </View>
              {item.hasArrow && (
                <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={[
          styles.deactivateButton, 
          { backgroundColor: theme.cardBackground },
          isLoggingOut && styles.deactivateButtonDisabled
        ]} 
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        <View style={styles.settingLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="log-out-outline" size={20} color="#d32f2f" />
          </View>
          <Text style={styles.deactivateText}>
            {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0ede4',
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#f0ede4',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 13,
    color: '#999',
  },
  section: {
    marginTop: 15,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#999',
    marginBottom: 10,
    marginLeft: 5,
  },
  settingsGroup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: '#333',
  },
  deactivateButton: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  deactivateButtonDisabled: {
    opacity: 0.5,
  },
  deactivateText: {
    fontSize: 15,
    color: '#d32f2f',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 100,
  },
  avatarImageSmall: { width: 50, height: 50, borderRadius: 25 },
});
