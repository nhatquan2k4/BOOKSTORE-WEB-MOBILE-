import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NotificationType = 'new_order' | 'status_update' | 'payment' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  orderId?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'new_order',
    title: 'Đơn hàng mới',
    message: 'Bạn có đơn hàng mới ORD007 cần giao tại Quận 1',
    time: '5 phút trước',
    isRead: false,
    orderId: 'ORD007',
  },
  {
    id: '2',
    type: 'status_update',
    title: 'Cập nhật đơn hàng',
    message: 'Đơn hàng ORD002 đã được giao thành công',
    time: '1 giờ trước',
    isRead: false,
    orderId: 'ORD002',
  },
  {
    id: '3',
    type: 'payment',
    title: 'Thanh toán thành công',
    message: 'Bạn đã nhận được 320,000đ từ đơn hàng ORD002',
    time: '2 giờ trước',
    isRead: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'Cập nhật hệ thống',
    message: 'Ứng dụng đã được cập nhật lên phiên bản mới 2.0.1',
    time: 'Hôm qua',
    isRead: true,
  },
];

export default function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(mockNotifications);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'new_order':
        return { name: 'cube', color: '#4CAF50', bgColor: '#E8F5E9' };
      case 'status_update':
        return { name: 'checkmark-circle', color: '#2196F3', bgColor: '#E3F2FD' };
      case 'payment':
        return { name: 'cash', color: '#FF9800', bgColor: '#FFF3E0' };
      case 'system':
        return { name: 'information-circle', color: '#9C27B0', bgColor: '#F3E5F5' };
      default:
        return { name: 'notifications', color: '#666', bgColor: '#F5F5F5' };
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Thông báo</Text>
          {unreadCount > 0 && (
            <Text style={styles.subtitle}>{unreadCount} thông báo chưa đọc</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Đánh dấu đã đọc</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
        renderItem={({ item }) => {
          const iconConfig = getNotificationIcon(item.type);
          return (
            <TouchableOpacity
              style={[
                styles.notificationCard,
                !item.isRead && styles.unreadCard,
              ]}
              onPress={() => markAsRead(item.id)}
            >
              {!item.isRead && <View style={styles.unreadDot} />}
              
              <View style={[styles.iconContainer, { backgroundColor: iconConfig.bgColor }]}>
                <Ionicons
                  name={iconConfig.name as any}
                  size={24}
                  color={iconConfig.color}
                />
              </View>

              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text
                  style={[
                    styles.notificationMessage,
                    !item.isRead && styles.unreadMessage,
                  ]}
                  numberOfLines={2}
                >
                  {item.message}
                </Text>
                <View style={styles.notificationFooter}>
                  <View style={styles.timeContainer}>
                    <Ionicons name="time-outline" size={14} color="#999" />
                    <Text style={styles.notificationTime}>{item.time}</Text>
                  </View>
                  {item.orderId && (
                    <TouchableOpacity style={styles.viewOrderButton}>
                      <Text style={styles.viewOrderText}>Xem đơn</Text>
                      <Ionicons name="chevron-forward" size={14} color="#E24A4A" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có thông báo</Text>
            <Text style={styles.emptySubtext}>
              Các thông báo về đơn hàng sẽ hiển thị tại đây
            </Text>
          </View>
        }
      />
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#E24A4A',
    marginTop: 4,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E24A4A',
    borderRadius: 6,
  },
  markAllText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  notificationsList: {
    padding: 15,
    paddingBottom: 100,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  unreadCard: {
    backgroundColor: '#FFF9F5',
    borderLeftWidth: 4,
    borderLeftColor: '#E24A4A',
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E24A4A',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  unreadMessage: {
    color: '#333',
    fontWeight: '500',
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  viewOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewOrderText: {
    fontSize: 13,
    color: '#E24A4A',
    fontWeight: '600',
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
    textAlign: 'center',
  },
});
