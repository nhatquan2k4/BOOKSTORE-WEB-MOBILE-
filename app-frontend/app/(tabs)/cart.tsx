import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { useCart } from '@/app/providers/CartProvider';
import * as cartService from '@/src/services/cartService';
import bookService from '@/src/services/bookService';
import { API_BASE_URL, MINIO_BASE_URL } from '@/src/config/api';
import { PLACEHOLDER_IMAGES } from '@/src/constants/placeholders';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items: localItems, removeFromCart: removeFromLocalCart, clearCart: clearLocalCart } = useCart();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverCart, setServerCart] = useState<cartService.Cart | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bookImages, setBookImages] = useState<Record<string, string>>({});
  const isFocused = useIsFocused();

  // Load server cart when screen is focused
  const loadServerCart = useCallback(async () => {
    console.log('🔄 Loading server cart...');
    setLoading(true);
    try {
      const cart = await cartService.getMyCart();
      console.log('📦 Server cart loaded:', JSON.stringify(cart, null, 2));
      
      if (cart && cart.items) {
        console.log(`✅ Cart has ${cart.items.length} items`);
        console.log('Items:', cart.items.map(i => ({ bookId: i.bookId, title: i.bookTitle, qty: i.quantity })));
        
        // Fetch images for items that don't have imageUrl
        const imagesToFetch = cart.items.filter(item => !item.imageUrl);
        if (imagesToFetch.length > 0) {
          console.log(`🖼️ Fetching images for ${imagesToFetch.length} books...`);
          
          // Use functional update to avoid dependency on bookImages
          setBookImages(prevImages => {
            const imageMap: Record<string, string> = { ...prevImages };
            
            // Fetch images in parallel
            Promise.all(
              imagesToFetch.map(async (item) => {
                // Skip if already fetched
                if (imageMap[item.bookId]) return;
                
                try {
                  const coverDto = await bookService.getBookCover(item.bookId);
                  if (coverDto?.imageUrl) {
                    setBookImages(prev => ({ ...prev, [item.bookId]: coverDto.imageUrl }));
                    console.log(`✅ Fetched image for ${item.bookId}`);
                  }
                } catch (err) {
                  console.warn(`⚠️ Could not fetch image for ${item.bookId}`);
                  setBookImages(prev => ({ ...prev, [item.bookId]: PLACEHOLDER_IMAGES.DEFAULT_BOOK }));
                }
              })
            );
            
            return imageMap;
          });
        }
      } else {
        console.log('⚠️ Cart is empty or null');
      }
      
      setServerCart(cart);
    } catch (error) {
      console.error('❌ Error loading server cart:', error);
    } finally {
      setLoading(false);
    }
  }, []); // Remove bookImages dependency

  useEffect(() => {
    if (isFocused) {
      loadServerCart();
      setIsEditing(false);
    }
  }, [isFocused, loadServerCart]);
  // approximate bottom tab height used in BottomTabBar (70) + extra margins
  const tabBarApproxHeight = 90;
  const bottomOffset = insets.bottom + tabBarApproxHeight;

  // Use server cart if available, fallback to local
  const items = serverCart?.items || [];
  const cartEmpty = items.length === 0;

  // Helper functions for selection
  const toggleSelect = (bookId: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(bookId)) {
        next.delete(bookId);
      } else {
        next.add(bookId);
      }
      return next;
    });
  };

  const selectAll = (value: boolean) => {
    if (value) {
      setSelectedItems(new Set(items.map(item => item.bookId)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const isAllSelected = items.length > 0 && items.every(item => selectedItems.has(item.bookId));

  // Calculate totals from selected items
  const selectedCount = items.reduce((sum, item) => 
    selectedItems.has(item.bookId) ? sum + item.quantity : sum, 0
  );
  const totalPrice = items.reduce((sum, item) => 
    selectedItems.has(item.bookId) ? sum + (item.bookPrice * item.quantity) : sum, 0
  );
  const selectedRowCount = Array.from(selectedItems).length;

  // Update quantity on server
  const updateQuantity = async (bookId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      await cartService.updateCartItemQuantity({ bookId, quantity: newQty });
      await loadServerCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  // Remove item from server cart
  const removeItem = async (bookId: string) => {
    try {
      await cartService.removeFromCart({ bookId });
      await loadServerCart();
      // Also remove from selection
      setSelectedItems(prev => {
        const next = new Set(prev);
        next.delete(bookId);
        return next;
      });
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // Handle checkout navigation
  const handleCheckout = () => {
    if (selectedRowCount === 0) return;
    
    // Get selected items for checkout
    const checkoutItems = items
      .filter(item => selectedItems.has(item.bookId))
      .map(item => ({
        bookId: item.bookId,
        title: item.bookTitle,
        price: item.bookPrice,
        quantity: item.quantity,
        imageUrl: item.imageUrl
      }));

    console.log('🛒 Proceeding to checkout with items:', checkoutItems);
    
    // Navigate to checkout with fromCart flag
    router.push('/(stack)/checkout?fromCart=true');
  };

  // Per-row component to handle slide-to-delete
  const CartRow: React.FC<{ item: cartService.CartItem }> = ({ item }) => {
    const isSelected = selectedItems.has(item.bookId);
    
    // Try to get image from: 1) backend imageUrl, 2) fetched image map, 3) placeholder
    let imageUrl: string;
    if (item.imageUrl) {
      // Backend provided imageUrl
      imageUrl = item.imageUrl.startsWith('http') 
        ? item.imageUrl 
        : `${MINIO_BASE_URL}${item.imageUrl}`;
      console.log(`🖼️ Using backend imageUrl for ${item.bookId}:`, imageUrl);
    } else if (bookImages[item.bookId]) {
      // We fetched the image
      imageUrl = bookImages[item.bookId].startsWith('http')
        ? bookImages[item.bookId]
        : `${MINIO_BASE_URL}${bookImages[item.bookId]}`;
      console.log(`🖼️ Using fetched imageUrl for ${item.bookId}:`, imageUrl);
    } else {
      // Fallback to placeholder
      imageUrl = PLACEHOLDER_IMAGES.DEFAULT_BOOK;
      console.log(`🖼️ Using placeholder for ${item.bookId}`);
    }
    
    const translate = useRef(new Animated.Value(0)).current;
    const [open, setOpen] = useState(false);
    const DELETE_WIDTH = 96;

    const openRow = () => {
      Animated.timing(translate, { toValue: -DELETE_WIDTH, duration: 180, useNativeDriver: true }).start();
      setOpen(true);
    };
    const closeRow = () => {
      Animated.timing(translate, { toValue: 0, duration: 180, useNativeDriver: true }).start();
      setOpen(false);
    };

    return (
      <View style={styles.cartCard}>
        <View style={styles.cardTopBar}>
          <Text style={styles.cardTopTitle}>Bờ Úc Búc</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.cardTopEdit} onPress={() => (open ? closeRow() : openRow())}>
            <Text style={styles.editText}>Sửa</Text>
          </TouchableOpacity>
        </View>

        <View style={{ position: 'relative' }}>
          <Animated.View style={[styles.cardContentBox, { transform: [{ translateX: translate }] }]}> 
            <TouchableOpacity onPress={() => router.push(`/(stack)/book-detail?id=${item.bookId}`)} activeOpacity={0.75} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <TouchableOpacity onPress={() => toggleSelect(item.bookId)} style={styles.checkboxButton}>
                <View style={[styles.checkbox, isSelected ? styles.checkboxSelected : {}]}>
                  {isSelected && <Text style={styles.checkboxTick}>✓</Text>}
                </View>
              </TouchableOpacity>

              {imageUrl ? (
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.cartImage}
                  defaultSource={require('@/assets/images/react-logo.png')}
                />
              ) : (
                <View style={[styles.cartImage, { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ fontSize: 10, color: '#999' }}>📚</Text>
                </View>
              )}

              <View style={styles.cartInfo}>
                <Text numberOfLines={2} style={styles.cartTitle}>{item.bookTitle}</Text>
                <Text style={styles.unitPrice}>{item.bookPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.qtyWrap}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => updateQuantity(item.bookId, item.quantity - 1)}>
                <Text style={styles.stepText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => updateQuantity(item.bookId, item.quantity + 1)}>
                <Text style={styles.stepText}>+</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/** animated delete button slides in from the right as the card translates left */}
          <Animated.View
            style={[
              styles.deleteActionWrapper,
              { transform: [{ translateX: translate.interpolate({ inputRange: [-DELETE_WIDTH, 0], outputRange: [0, DELETE_WIDTH] }) }] },
              { opacity: translate.interpolate({ inputRange: [-DELETE_WIDTH, 0], outputRange: [1, 0] }) },
            ]}
            pointerEvents={open ? 'auto' : 'none'}
          >
            <TouchableOpacity style={styles.rowDeleteBtn} onPress={() => removeItem(item.bookId)}>
              <Text style={styles.rowDeleteText}>Xóa</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  };

  return (
  <SafeAreaView style={[styles.container, { paddingBottom: bottomOffset + 12 }]}>
      <View style={styles.header}>
        <Text style={styles.titleCentered}>Giỏ hàng</Text>
        {items.length > 0 && (
          <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing((v) => !v)}>
            <Text style={styles.editText}>{isEditing ? 'Hủy' : 'Sửa'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#D5CCB3" />
          <Text style={[styles.emptyText, { marginTop: 16 }]}>Đang tải giỏ hàng...</Text>
        </View>
      ) : cartEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống.</Text>
          {/* <TouchableOpacity 
            onPress={loadServerCart}
            style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#D5CCB3', borderRadius: 8 }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Tải lại</Text>
          </TouchableOpacity> */}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.bookId}
          contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: bottomOffset + 24 }}
          renderItem={({ item }) => {
            return <CartRow item={item} />;
          }}
        />
      )}

      {items.length > 0 && selectedCount === 0 && !isEditing && (
        <View style={styles.helperRow}>
          <Text style={styles.helperText}>Chưa có sản phẩm được chọn để thanh toán. Vui lòng đánh dấu các sản phẩm.</Text>
        </View>
      )}

      {items.length > 0 && (
        <View style={[styles.bottomBar, { bottom: bottomOffset, position: 'absolute', left: 0, right: 0, zIndex: 30 }] }>
          <TouchableOpacity
            style={styles.selectAll}
            onPress={() => selectAll(!isAllSelected)}
          >
            <View style={[styles.checkbox, isAllSelected ? styles.checkboxSelected : {}]}>
              {isAllSelected && <Text style={styles.checkboxTick}>✓</Text>}
            </View>
            <Text style={styles.selectAllText}>Tất cả</Text>
          </TouchableOpacity>

          {!isEditing && (
            <View style={styles.priceWrap}>
              <Text style={styles.totalLabel}>Tổng:</Text>
              <Text style={styles.totalPrice}>{totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
            </View>
          )}

          {isEditing ? (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={async () => {
                const toDelete = Array.from(selectedItems);
                for (const bookId of toDelete) {
                  await removeItem(bookId);
                }
              }}
            >
              <Text style={styles.deleteBtnText}>Xóa</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.buyBtn, selectedRowCount === 0 && { opacity: 0.5 }]} 
              onPress={handleCheckout}
              disabled={selectedRowCount === 0}
            >
              <Text style={styles.buyBtnText}>Mua hàng ({selectedRowCount})</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0EDE4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20, backgroundColor: '#F0EDE4' },
  editBtn: { position: 'absolute', right: 16, top: -10, padding: 8 },
  titleCentered: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 26, fontWeight: 'bold', color: '#222' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#888', fontSize: 16 },
  editText: { color: '#1976d2', fontWeight: '600' },
  helperRow: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FFF7E6', marginHorizontal: 12, borderRadius: 8, marginBottom: 12 },
  helperText: { color: '#7A6A3D' },
  cartRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 12 },
  cartCard: { marginBottom: 12, backgroundColor: '#fff', borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 },
  cardTopBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 0 },
  cardTopEdit: { padding: 6, marginRight: 6 },
  cardTopTitle: { fontSize: 14, fontWeight: '700', color: '#333', letterSpacing: 0.3 },
  cardContentBox: { backgroundColor: '#fff', padding: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  deleteActionWrapper: { position: 'absolute', right: 12, top: 6, bottom: 6, width: 96, justifyContent: 'center', alignItems: 'center' },
  rowDeleteBtn: { backgroundColor: '#D94A4A', width: 84, height: '100%', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  rowDeleteText: { color: '#fff', fontWeight: '700' },
  cartImage: { width: 64, height: 88, borderRadius: 8, marginRight: 12, backgroundColor: '#f0f0f0' },
  cartInfo: { flex: 1 },
  cartTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  cartAuthor: { fontSize: 12, color: '#888', marginTop: 4 },
  cartQty: { fontSize: 12, color: '#666', marginTop: 6 },
  checkboxButton: { marginRight: 8, padding: 6 },
  checkboxSelected: { backgroundColor: '#D5CCB3', borderColor: '#D5CCB3', justifyContent: 'center', alignItems: 'center' },
  checkboxTick: { color: '#fff', fontWeight: '700' },
  unitPrice: { fontSize: 12, color: '#666', marginTop: 4 },
  qtyWrap: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 18, lineHeight: 18, fontWeight: '600' },
  qtyText: { marginHorizontal: 8, minWidth: 20, textAlign: 'center' },
  rowPrice: { fontSize: 14, fontWeight: '700', color: '#111', marginLeft: 8 },
  bottomBar: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: -2 }, shadowRadius: 8, elevation: 8 },
  selectAll: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: '#ccc', marginRight: 8 },
  selectAllText: { fontSize: 14, color: '#333' },
  priceWrap: { flex: 1, alignItems: 'flex-end', marginRight: 12 },
  totalLabel: { fontSize: 12, color: '#888' },
  totalPrice: { fontSize: 16, fontWeight: '700', color: '#111' },
  buyBtn: { backgroundColor: '#D5CCB3', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginLeft: 'auto' },
  buyBtnText: { color: '#fff', fontWeight: '700' },
  deleteBtn: { borderWidth: 1, borderColor: '#D94A4A', backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginLeft: 'auto' },
  deleteBtnText: { color: '#D94A4A', fontWeight: '700' },
});
