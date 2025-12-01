import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getBookById } from '@/data/mockBooks';
import { useCart } from '@/app/providers/CartProvider';
import { Ionicons } from '@expo/vector-icons';

type PaymentMethod = 'COD' | 'EWALLET';

export default function CheckoutScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const bookId = params.bookId ? Number(params.bookId) : null;
  const book = bookId ? getBookById(bookId) : null;
  const qtyParam = params.qty ? Number(params.qty) : null;

  // Recipient info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Voucher
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');

  // Shipping fee - mock
  const shippingFee = 30000;

  // Voucher mock rules: 'SHIPFREE' => free shipping; 'SALE10' => 10% off product
  const voucherApply = (code: string) => {
    const c = code.trim().toUpperCase();
    if (c === 'SHIPFREE' || c === 'SALE10') return c;
    return null;
  };

  const applyVoucher = () => {
    const v = voucherApply(voucherCode);
    setAppliedVoucher(v);
  };

  // Cart / product quantity
  const { items, setQuantity } = useCart();
  const cartItem = book ? items.find((i) => i.id === book.id) : null;
  const qty = qtyParam ?? (cartItem ? cartItem.quantity : 1);

  // Totals
  const productPrice = book ? book.price || 0 : 0;
  const totalBefore = productPrice * qty;
  const discountOnProduct = useMemo(() => (appliedVoucher === 'SALE10' ? Math.round(totalBefore * 0.1) : 0), [appliedVoucher, totalBefore]);
  const discountOnShipping = useMemo(() => (appliedVoucher === 'SHIPFREE' ? shippingFee : 0), [appliedVoucher]);
  const shipping = shippingFee;
  const totalPayment = totalBefore - discountOnProduct + shipping - discountOnShipping;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#333" />
          </TouchableOpacity>
          <Text style={styles.header}>Thanh toán</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* 1. Recipient info */}
        <Text style={styles.sectionTitle}>Thông tin người nhận</Text>
        <View style={styles.card}>
          <TextInput placeholder="Họ và tên" value={name} onChangeText={setName} style={styles.input} />
          <TextInput placeholder="Số điện thoại" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
          <TextInput placeholder="Địa chỉ nhận hàng" value={address} onChangeText={setAddress} style={styles.input} />
        </View>

        {/* 2. Product info */}
        <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>
        <View style={styles.cartCardSmall}>
          {book ? (
            <>
              <View style={styles.cartContentRow}>
                <Image source={{ uri: book.cover }} style={styles.cartImage} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={2} style={styles.title}>{book.title}</Text>
                  <Text style={styles.unitPrice}>{productPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.qtyLabel}>x{qty}</Text>
                </View>
              </View>
            </>
          ) : (
            <Text>Không có sản phẩm</Text>
          )}
        </View>

        {/* 3. Voucher */}
        <Text style={styles.sectionTitle}>Mã giảm giá</Text>
        <View style={styles.cardRow}>
          <TextInput placeholder="Nhập mã khuyến mãi" value={voucherCode} onChangeText={setVoucherCode} style={[styles.input, { flex: 1 }]} />
          <TouchableOpacity style={styles.applyBtn} onPress={applyVoucher}>
            <Text style={styles.applyText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>
        {appliedVoucher && (
          <Text style={styles.voucherApplied}>Đã áp dụng: {appliedVoucher}</Text>
        )}

        {/* 4. Payment method */}
        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
        <View style={styles.cardRowSmall}>
          <TouchableOpacity style={[styles.methodBtn, paymentMethod === 'COD' ? styles.methodActive : null]} onPress={() => setPaymentMethod('COD')}>
            <Text style={paymentMethod === 'COD' ? styles.methodTextActive : styles.methodText}>Thanh toán khi nhận hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.methodBtn, paymentMethod === 'EWALLET' ? styles.methodActive : null]} onPress={() => setPaymentMethod('EWALLET')}>
            <Text style={paymentMethod === 'EWALLET' ? styles.methodTextActive : styles.methodText}>Thanh toán qua ví</Text>
          </TouchableOpacity>
        </View>

        {/* 5. Payment details */}
        <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}><Text>Tổng tiền hàng</Text><Text>{totalBefore.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text></View>
          <View style={styles.summaryRow}><Text>Tổng tiền phí vận chuyển</Text><Text>{shipping.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text></View>
          {discountOnShipping > 0 && <View style={styles.summaryRow}><Text>Giảm giá phí vận chuyển</Text><Text>-{discountOnShipping.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text></View>}
          {discountOnProduct > 0 && <View style={styles.summaryRow}><Text>Giảm giá tiền hàng</Text><Text>-{discountOnProduct.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text></View>}
          <View style={[styles.summaryRow, styles.summaryTotal]}><Text style={styles.totalLabel}>Tổng thanh toán</Text><Text style={styles.totalValue}>{totalPayment.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text></View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.smallLabel}>Tổng cộng</Text>
          <Text style={styles.bottomTotal}>{totalPayment.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
        </View>
        {paymentMethod === 'COD' ? (
          <TouchableOpacity style={styles.placeOrderBtn} onPress={() => { /* place order flow */ }}>
            <Text style={styles.placeOrderText}>Đặt hàng</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.payNowBtn} onPress={() => { /* e-wallet flow */ }}>
            <Text style={styles.payNowText}>Tiến hành thanh toán</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 32 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 12, marginTop: 50 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  backIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 14, color: '#666', marginTop: 8, marginBottom: 8 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 3, marginBottom: 12 },
  cartCardSmall: { backgroundColor: '#fff', padding: 12, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 3, marginBottom: 12 },
  cartContentRow: { flexDirection: 'row', alignItems: 'center' },
  cartImage: { width: 64, height: 88, borderRadius: 8, marginRight: 12, backgroundColor: '#f0f0f0' },
  unitPrice: { fontSize: 12, color: '#666', marginTop: 4 },
  qtyLabel: { fontSize: 14, color: '#333', fontWeight: '600' },
  qtyWrap: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 18, lineHeight: 18, fontWeight: '600' },
  qtyText: { marginHorizontal: 8, minWidth: 20, textAlign: 'center' },
  cardRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 8, borderRadius: 10, marginBottom: 8 },
  cardRowSmall: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#EEE', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
  applyBtn: { backgroundColor: '#1976d2', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginLeft: 8 },
  applyText: { color: '#fff', fontWeight: '700' },
  voucherApplied: { color: '#2CB47B', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700' },
  author: { color: '#666', marginBottom: 8 },
  price: { fontSize: 16, fontWeight: '700', color: '#FF4757' },
  methodBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#EEE', alignItems: 'center' },
  methodActive: { borderColor: '#FF4757', backgroundColor: '#FFF0F0' },
  methodText: { color: '#333' },
  methodTextActive: { color: '#FF4757', fontWeight: '700' },
  summaryCard: { backgroundColor: '#fff', padding: 12, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 3 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryTotal: { borderTopWidth: 1, borderTopColor: '#F0F0F0', marginTop: 8, paddingTop: 8 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#FF4757' },
  bottomBar: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: '#fff', padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 6 },
  smallLabel: { fontSize: 12, color: '#666' },
  bottomTotal: { fontSize: 18, fontWeight: '700', color: '#FF4757' },
  placeOrderBtn: { backgroundColor: '#2CB47B', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
  placeOrderText: { color: '#fff', fontWeight: '700' },
  payNowBtn: { backgroundColor: '#FF4757', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
  payNowText: { color: '#fff', fontWeight: '700' },
});
