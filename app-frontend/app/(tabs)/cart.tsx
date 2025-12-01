import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { useCart } from '@/app/providers/CartProvider';
import { getBookById } from '@/data/mockBooks';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { totalCount: selectedCount, totalPrice, items, toggleSelect, setQuantity, selectAll, selectedRowCount, removeFromCart } = useCart();
  const [isEditing, setIsEditing] = useState(false);
  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (!isFocused) setIsEditing(false);
  }, [isFocused]);
  // approximate bottom tab height used in BottomTabBar (70) + extra margins
  const tabBarApproxHeight = 90;
  const bottomOffset = insets.bottom + tabBarApproxHeight;

  // Per-row component to handle slide-to-delete
  const CartRow: React.FC<any> = ({ item }) => {
  const router = useRouter();
    const cover = getBookById(item.id)?.cover;
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
            <TouchableOpacity onPress={() => router.push(`/(stack)/book-detail?id=${item.id}`)} activeOpacity={0.75} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <TouchableOpacity onPress={() => toggleSelect(item.id)} style={styles.checkboxButton}>
                <View style={[styles.checkbox, item.selected ? styles.checkboxSelected : {}]}>{item.selected && <Text style={styles.checkboxTick}>✓</Text>}</View>
              </TouchableOpacity>

              {cover ? (
                <Image source={{ uri: cover }} style={styles.cartImage} />
              ) : (
                <View style={[styles.cartImage, { backgroundColor: '#eee' }]} />
              )}

              <View style={styles.cartInfo}>
                <Text numberOfLines={2} style={styles.cartTitle}>{item.title}</Text>
                <Text style={styles.unitPrice}>{item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.qtyWrap}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setQuantity(item.id, item.quantity - 1)}>
                <Text style={styles.stepText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setQuantity(item.id, item.quantity + 1)}>
                <Text style={styles.stepText}>+</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/** animated delete button slides in from the right as the card translates left */}
          {
            // interpolate so when translate goes 0 -> -DELETE_WIDTH, deleteTranslate goes DELETE_WIDTH -> 0
          }
          <Animated.View
            style={[
              styles.deleteActionWrapper,
              { transform: [{ translateX: translate.interpolate({ inputRange: [-DELETE_WIDTH, 0], outputRange: [0, DELETE_WIDTH] }) }] },
              { opacity: translate.interpolate({ inputRange: [-DELETE_WIDTH, 0], outputRange: [1, 0] }) },
            ]}
            pointerEvents={open ? 'auto' : 'none'}
          >
            <TouchableOpacity style={styles.rowDeleteBtn} onPress={() => removeFromCart(item.id)}>
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

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.id)}
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
          {(() => {
            const allSelected = items.length > 0 && items.every((i) => i.selected);
            return (
              <TouchableOpacity
                  style={styles.selectAll}
                  onPress={() => selectAll(!allSelected)}
                >
                  <View style={[styles.checkbox, allSelected ? styles.checkboxSelected : {}]}>{allSelected && <Text style={styles.checkboxTick}>✓</Text>}</View>
                  <Text style={styles.selectAllText}>Tất cả</Text>
                </TouchableOpacity>
            );
          })()}

          {!isEditing && (
            <View style={styles.priceWrap}>
              <Text style={styles.totalLabel}>Tổng:</Text>
              <Text style={styles.totalPrice}>{totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
            </View>
          )}

          {isEditing ? (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => {
                const toDelete = items.filter((i) => i.selected).map((i) => i.id);
                toDelete.forEach((id) => removeFromCart(id));
              }}
            >
              <Text style={styles.deleteBtnText}>Xóa</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.buyBtn} onPress={() => { /* noop */ }}>
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
