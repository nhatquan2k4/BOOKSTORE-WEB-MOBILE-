import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotifications } from '@/app/providers/NotificationProvider';
import { useRouter } from 'expo-router';

export default function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const router = useRouter();

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return 'cart-outline';
      case 'payment':
        return 'card-outline';
      case 'promotion':
        return 'gift-outline';
      default:
        return 'notifications-outline';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Thông Báo</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Đánh dấu đã đọc</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
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
            <Text style={styles.cardSubtitle}>
              Các thông báo về đơn hàng, khuyến mãi hoặc tin mới từ cửa hàng sẽ được hiển thị ở đây. 
              Hãy mua sách hoặc theo dõi chương trình khuyến mãi để nhận cập nhật.
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.listContainer}>
          {notifications.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
              onPress={() => {
                markAsRead(notif.id);
                // Can navigate to order detail in future
              }}
            >
              <View style={styles.notifIcon}>
                <Ionicons name={getIcon(notif.type) as any} size={24} color="#2CB47B" />
              </View>
              <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                <Text style={styles.notifMessage}>{notif.message}</Text>
                <Text style={styles.notifTime}>{formatTime(notif.timestamp)}</Text>
              </View>
              {!notif.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F0EDE4' },
  header: { backgroundColor: '#D5CCB3', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: 80, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  headerTitle: { color: '#111', fontSize: 26, fontWeight: '700', paddingTop: 0},
  markAllBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff', borderRadius: 12 },
  markAllText: { color: '#2CB47B', fontSize: 13, fontWeight: '600' },
  contentWrapper: { flex: 1, paddingHorizontal: 20, marginTop: -50 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 6 },
  iconWrap: { marginTop: 30, marginBottom: 25, width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { width: 100, height:100, borderRadius: 50, backgroundColor: '#F0EDE4', alignItems: 'center', justifyContent: 'center' },
  plusBadge: { position: 'absolute', right: 8, top: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: '#2CB47B', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#333', textAlign: 'center', marginTop: 8 },
  cardSubtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 12, lineHeight: 20 },
  listContainer: { flex: 1, paddingHorizontal: 16, marginTop: -50 },
  notifCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 },
  notifCardUnread: { backgroundColor: '#FFF9F0', borderLeftWidth: 3, borderLeftColor: '#2CB47B' },
  notifIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0EDE4', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  notifMessage: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 4 },
  notifTime: { fontSize: 12, color: '#999' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2CB47B', marginLeft: 8 },
});
