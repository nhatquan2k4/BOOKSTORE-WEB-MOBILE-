import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/context/ThemeContext';
import wishlistService from '@/src/services/wishlistService';
import type { WishlistItem } from '@/src/types/wishlist';
import { MINIO_BASE_URL } from '@/src/config/api';
import { PLACEHOLDER_IMAGES } from '@/src/constants/placeholders';

export default function WishlistScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const items = await wishlistService.getMyWishlist();
      setWishlistItems(items);
    } catch (error: any) {
      console.error('Error loading wishlist:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWishlist();
    setRefreshing(false);
  };

  const handleRemove = async (bookId: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa sách này khỏi danh sách yêu thích?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await wishlistService.removeFromWishlist(bookId);
              setWishlistItems(prev => prev.filter(item => item.bookId !== bookId));
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa sách khỏi danh sách');
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (wishlistItems.length === 0) return;
    
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa tất cả sách khỏi danh sách yêu thích?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: async () => {
            try {
              await wishlistService.clearWishlist();
              setWishlistItems([]);
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa danh sách');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: WishlistItem }) => {
    const imageUrl = item.bookImageUrl 
      ? (item.bookImageUrl.startsWith('http') ? item.bookImageUrl : `${MINIO_BASE_URL}${item.bookImageUrl}`)
      : PLACEHOLDER_IMAGES.DEFAULT_BOOK;

    return (
      <TouchableOpacity
        style={[styles.itemCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
        onPress={() => router.push(`/(stack)/book-detail?id=${item.bookId}`)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: imageUrl }} style={styles.bookImage} />
        
        <View style={styles.itemInfo}>
          <Text style={[styles.bookTitle, { color: theme.text }]} numberOfLines={2}>
            {item.bookTitle}
          </Text>
          
          {item.authorNames && (
            <Text style={[styles.authorText, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.authorNames}
            </Text>
          )}
          
          {item.bookPrice && (
            <View style={styles.priceRow}>
              {item.bookDiscountPrice && item.bookDiscountPrice < item.bookPrice ? (
                <>
                  <Text style={[styles.discountPrice, { color: theme.primary }]}>
                    {item.bookDiscountPrice.toLocaleString('vi-VN')}₫
                  </Text>
                  <Text style={[styles.originalPrice, { color: theme.textTertiary }]}>
                    {item.bookPrice.toLocaleString('vi-VN')}₫
                  </Text>
                </>
              ) : (
                <Text style={[styles.price, { color: theme.primary }]}>
                  {item.bookPrice.toLocaleString('vi-VN')}₫
                </Text>
              )}
            </View>
          )}
          
          <Text style={[styles.addedDate, { color: theme.textTertiary }]}>
            Đã thêm: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemove(item.bookId)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={28} color={theme.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.text }]}>Danh sách yêu thích</Text>
        
        {wishlistItems.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={22} color={theme.error} />
          </TouchableOpacity>
        )}
        {wishlistItems.length === 0 && <View style={styles.headerRight} />}
      </View>

      {/* Content */}
      {wishlistItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color={theme.textTertiary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Chưa có sách yêu thích
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Thêm sách bạn thích vào danh sách để dễ dàng tìm lại sau này
          </Text>
          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.browseButtonText}>Khám phá sách</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  clearButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  browseButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  authorText: {
    fontSize: 13,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  addedDate: {
    fontSize: 12,
  },
  removeButton: {
    padding: 4,
  },
});
