import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotificationScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Thông Báo</Text>
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <View style={styles.iconCircle}>
              <Ionicons name="notifications-outline" size={90} color="#2CB47B" />
            </View>
            <View style={styles.plusBadge}>
              <Ionicons name="add" size={14} color="#fff" />
            </View>
          </View>

          <Text style={styles.cardTitle}>Chưa có thông báo nào</Text>
          <Text style={styles.cardSubtitle}>Các thông báo về đơn hàng, khuyến mãi hoặc tin mới từ cửa hàng sẽ được hiển thị ở đây. Hãy mua sách hoặc theo dõi chương trình khuyến mãi để nhận cập nhật.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F0EDE4' },
  header: { backgroundColor: '#D5CCB3', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: 80, alignItems: 'center' },
  headerTitle: { color: '#111', fontSize: 26, fontWeight: '700', paddingTop: 0},
  contentWrapper: { flex: 1, paddingHorizontal: 20, marginTop: -50 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 6 },
  iconWrap: { marginTop: 30, marginBottom: 25, width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { width: 100, height:100, borderRadius: 50, backgroundColor: '#F0EDE4', alignItems: 'center', justifyContent: 'center' },
  plusBadge: { position: 'absolute', right: 8, top: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: '#2CB47B', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#333', textAlign: 'center', marginTop: 8 },
  cardSubtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 12, lineHeight: 20 },
});
