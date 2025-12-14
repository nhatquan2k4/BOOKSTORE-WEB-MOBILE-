import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [orderNotification, setOrderNotification] = useState(true);
  const [promotionNotification, setPromotionNotification] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleClearCache = () => {
    Alert.alert(
      'Xóa bộ nhớ đệm',
      'Bạn có chắc chắn muốn xóa bộ nhớ đệm?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          onPress: () => {
            Alert.alert('Thành công', 'Đã xóa bộ nhớ đệm');
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.alert('Đổi mật khẩu', 'Tính năng đang được phát triển');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications-outline" size={22} color="#E24A4A" />
            <Text style={styles.sectionTitle}>Thông báo</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Bật thông báo</Text>
              <Text style={styles.settingDescription}>
                Nhận tất cả thông báo từ ứng dụng
              </Text>
            </View>
            <Switch
              value={notificationEnabled}
              onValueChange={setNotificationEnabled}
              trackColor={{ false: '#ddd', true: '#E24A4A' }}
              thumbColor="#fff"
            />
          </View>

          {notificationEnabled && (
            <>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingLabel}>Đơn hàng mới</Text>
                  <Text style={styles.settingDescription}>
                    Thông báo khi có đơn hàng mới
                  </Text>
                </View>
                <Switch
                  value={orderNotification}
                  onValueChange={setOrderNotification}
                  trackColor={{ false: '#ddd', true: '#E24A4A' }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingLabel}>Khuyến mãi</Text>
                  <Text style={styles.settingDescription}>
                    Thông báo về chương trình khuyến mãi
                  </Text>
                </View>
                <Switch
                  value={promotionNotification}
                  onValueChange={setPromotionNotification}
                  trackColor={{ false: '#ddd', true: '#E24A4A' }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingLabel}>Âm thanh</Text>
                  <Text style={styles.settingDescription}>
                    Phát âm thanh khi có thông báo
                  </Text>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={{ false: '#ddd', true: '#E24A4A' }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingLabel}>Rung</Text>
                  <Text style={styles.settingDescription}>
                    Rung khi có thông báo
                  </Text>
                </View>
                <Switch
                  value={vibrationEnabled}
                  onValueChange={setVibrationEnabled}
                  trackColor={{ false: '#ddd', true: '#E24A4A' }}
                  thumbColor="#fff"
                />
              </View>
            </>
          )}
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette-outline" size={22} color="#E24A4A" />
            <Text style={styles.sectionTitle}>Giao diện</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Chế độ tối</Text>
              <Text style={styles.settingDescription}>
                Sử dụng giao diện màu tối
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#ddd', true: '#E24A4A' }}
              thumbColor="#fff"
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Ngôn ngữ</Text>
              <Text style={styles.settingDescription}>Tiếng Việt</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Delivery Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bicycle-outline" size={22} color="#E24A4A" />
            <Text style={styles.sectionTitle}>Giao hàng</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Tự động nhận đơn</Text>
              <Text style={styles.settingDescription}>
                Tự động nhận đơn hàng phù hợp
              </Text>
            </View>
            <Switch
              value={autoAcceptOrders}
              onValueChange={setAutoAcceptOrders}
              trackColor={{ false: '#ddd', true: '#E24A4A' }}
              thumbColor="#fff"
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Khu vực giao hàng</Text>
              <Text style={styles.settingDescription}>
                Quận 7, TP.HCM
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Giờ làm việc</Text>
              <Text style={styles.settingDescription}>
                8:00 - 22:00
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#E24A4A" />
            <Text style={styles.sectionTitle}>Bảo mật</Text>
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={handleChangePassword}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Đổi mật khẩu</Text>
              <Text style={styles.settingDescription}>
                Thay đổi mật khẩu đăng nhập
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Sinh trắc học</Text>
              <Text style={styles.settingDescription}>
                Đăng nhập bằng vân tay/Face ID
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: '#ddd', true: '#E24A4A' }}
              thumbColor="#fff"
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Mã PIN</Text>
              <Text style={styles.settingDescription}>
                Thiết lập mã PIN bảo vệ
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Data & Storage Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="folder-outline" size={22} color="#E24A4A" />
            <Text style={styles.sectionTitle}>Dữ liệu & Bộ nhớ</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Bộ nhớ đệm</Text>
              <Text style={styles.settingDescription}>42.5 MB</Text>
            </View>
            <TouchableOpacity onPress={handleClearCache}>
              <Text style={styles.clearText}>Xóa</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Tự động tải ảnh</Text>
              <Text style={styles.settingDescription}>
                Chỉ qua WiFi
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={22} color="#E24A4A" />
            <Text style={styles.sectionTitle}>Về ứng dụng</Text>
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Phiên bản</Text>
              <Text style={styles.settingDescription}>2.0.1</Text>
            </View>
            <View style={styles.updateBadge}>
              <Text style={styles.updateText}>Mới nhất</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Điều khoản dịch vụ</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Chính sách bảo mật</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Giấy phép mã nguồn mở</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  section: {
    backgroundColor: '#fff',
    marginTop: 15,
    paddingVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  settingLeft: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
  },
  clearText: {
    fontSize: 14,
    color: '#E24A4A',
    fontWeight: '600',
  },
  updateBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  updateText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
});
