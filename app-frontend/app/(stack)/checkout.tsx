import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator, Modal, Animated } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useCart } from '@/app/providers/CartProvider';
import { useNotifications } from '@/app/providers/NotificationProvider';
import { Ionicons } from '@expo/vector-icons';
import bookService from '@/src/services/bookService';
import addressService, { Address } from '@/src/services/addressService';
import userProfileService from '@/src/services/userProfileService';
import checkoutService from '@/src/services/checkoutService';
import * as cartService from '@/src/services/cartService';
import { toDisplayBookDetail } from '@/src/types/book';
import { PLACEHOLDER_IMAGES } from '@/src/constants/placeholders';
import { API_BASE_URL, MINIO_BASE_URL } from '@/src/config/api';

type PaymentMethod = 'COD' | 'EWALLET';

export default function CheckoutScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { addNotification } = useNotifications();

  // Local snackbar for transient in-page messages (better UX than Alert.alert)
  const [snackbar, setSnackbar] = useState<{ message: string; type?: 'info'|'error'|'success' } | null>(null);
  const showSnackbar = (message: string, type: 'info'|'error'|'success' = 'info', duration = 2500) => {
    setSnackbar({ message, type });
    setTimeout(() => setSnackbar(null), duration);
  };
  
  // Determine checkout source: from cart or from book-detail (buy-now)
  const fromCart = params.fromCart === 'true';
  const bookId = params.bookId ? params.bookId.toString() : null;
  const qtyParam = params.qty ? Number(params.qty) : null;
  
  // Parse selected items from cart (if provided)
  const selectedCartItems = useMemo(() => {
    if (params.selectedItems && typeof params.selectedItems === 'string') {
      try {
        return JSON.parse(decodeURIComponent(params.selectedItems));
      } catch (e) {
        console.error('Failed to parse selectedItems:', e);
        return null;
      }
    }
    return null;
  }, [params.selectedItems]);

  console.log('🛒 Checkout params:', { fromCart, bookId, qty: qtyParam, selectedItems: selectedCartItems, allParams: params });

  // Loading states
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [book, setBook] = useState<any>(null);
  const [serverCart, setServerCart] = useState<cartService.Cart | null>(null);
  const [bookImages, setBookImages] = useState<Record<string, string>>({});

  // QR Payment Modal
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentTransactionCode, setCurrentTransactionCode] = useState<string | null>(null);
  // Keep non-selected items to restore after successful checkout (when items were only partially selected)
  const [nonSelectedItems, setNonSelectedItems] = React.useState([] as Array<{ bookId: string; quantity: number }>);
  // Flag to prevent cleanup effect from restoring when checkout is successful
  const checkoutSuccessful = useRef(false);
  const qrModalAnim = useRef(new Animated.Value(0)).current;

  // Recipient info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Voucher
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');

  // Shipping method
  type ShippingMethod = 'STANDARD' | 'EXPRESS';
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('STANDARD');

  // Shipping fee based on method
  const getShippingFee = () => {
    switch (shippingMethod) {
      case 'STANDARD':
        return 30000; // Giao hàng nhanh
      case 'EXPRESS':
        return 50000; // Giao hàng hỏa tốc
      default:
        return 30000;
    }
  };

  const shippingFee = getShippingFee();

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

  // Cart / product quantity and pricing
  const { items } = useCart();
  const cartItem = book ? items.find((i) => i.id === book.id) : null;
  const qty = qtyParam ?? (cartItem ? cartItem.quantity : 1);

  // Calculate subtotal based on checkout source
  const calculateSubtotal = () => {
    if (fromCart && selectedCartItems) {
      // Calculate total from selected items only
      return selectedCartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    } else if (fromCart && serverCart) {
      // Fallback: use entire cart if no selection provided
      return serverCart.totalAmount;
    } else if (book) {
      return book.price * qty;
    }
    return 0;
  };

  const subtotal = calculateSubtotal();

  // Fetch book details and user info on mount
  useEffect(() => {
    loadData();
  }, [bookId]);

  // Cleanup: Restore non-selected items when leaving checkout screen without completing order
  useEffect(() => {
    return () => {
      // This runs when component unmounts (user goes back)
      // Only restore if checkout was NOT successful
      if (nonSelectedItems.length > 0 && !checkoutSuccessful.current) {
        console.log('🔙 User left checkout without completing, restoring non-selected items:', nonSelectedItems);
        // Restore items asynchronously (don't block unmount)
        (async () => {
          try {
            for (const item of nonSelectedItems) {
              await cartService.addToCart({ bookId: item.bookId, quantity: item.quantity });
            }
            console.log('✅ Non-selected items restored on exit');
          } catch (err) {
            console.error('❌ Failed to restore non-selected items on exit:', err);
          }
        })();
      } else if (checkoutSuccessful.current) {
        console.log('✅ Checkout successful, skipping cleanup restore');
      }
    };
  }, [nonSelectedItems]);

  // Reload addresses when coming back from address selection
  useFocusEffect(
    React.useCallback(() => {
      loadAddresses();
    }, [])
  );

  const loadAddresses = async () => {
    try {
      const addressList = await addressService.getMyAddresses();
      setAddresses(addressList);

      // Find default address or use first one
      const defaultAddr = addressList.find((a) => a.isDefault) || addressList[0];
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
        setName(defaultAddr.recipientName);
        setPhone(defaultAddr.phoneNumber);
        setAddress(`${defaultAddr.streetAddress}, ${defaultAddr.ward}, ${defaultAddr.district}, ${defaultAddr.province}`);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      if (fromCart) {
        // Checkout from cart - check if we have selected items
        if (selectedCartItems) {
          console.log('🛒 Using selected items from cart:', selectedCartItems);
          
          // IMPORTANT: Khi có selected items, clear cart và add lại ONLY selected items
          // Đây là cách đúng để backend chỉ checkout những items được chọn
          try {
            console.log('🔄 Preparing cart for partial checkout...');
            
            // 0. First, get current cart and identify non-selected items
            const currentCart = await cartService.getMyCart();
            if (currentCart && currentCart.items && currentCart.items.length > 0) {
              const selectedBookIds = new Set(selectedCartItems.map((item: any) => item.bookId));
              const nonSelected = currentCart.items
                .filter(item => !selectedBookIds.has(item.bookId))
                .map(item => ({ bookId: item.bookId, quantity: item.quantity }));
              
              if (nonSelected.length > 0) {
                setNonSelectedItems(nonSelected);
                console.log('💾 Saved non-selected items for later restoration:', nonSelected);
              }
            }
            
            // 1. Clear entire cart
            await cartService.clearCart();
            console.log('✅ Cart cleared');
            
            // 2. Wait after clear (longer delay for backend to process)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 3. Add back only selected items ONE BY ONE with delays
            for (const item of selectedCartItems) {
              await cartService.addToCart({ 
                bookId: item.bookId, 
                quantity: item.quantity 
              });
              console.log(`✅ Added ${item.title} x${item.quantity} to cart`);
              // Small delay between each add
              await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            // 4. Wait even longer for backend to fully process all additions
            console.log('⏳ Waiting for backend to process cart updates...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('✅ Cart prepared with selected items only');
            
            // 5. Verify cart has items
            const cart = await cartService.getMyCart();
            console.log('📦 Reloaded cart:', cart);
            if (!cart || !cart.items || cart.items.length === 0) {
              throw new Error('Giỏ hàng trống sau khi chuẩn bị');
            }
            
            if (cart.items.length !== selectedCartItems.length) {
              console.warn(`⚠️ Cart item count mismatch: expected ${selectedCartItems.length}, got ${cart.items.length}`);
            }
            
            setServerCart(cart);
            console.log('✅ Server cart verified and reloaded with', cart.items.length, 'items');
          } catch (err) {
            console.error('❌ Could not prepare cart for partial checkout:', err);
            throw new Error('Không thể chuẩn bị giỏ hàng');
          }
        } else {
          // Fallback: load entire cart
          console.log('🛒 Loading entire server cart for checkout...');
          try {
            const cart = await cartService.getMyCart();
            setServerCart(cart);
            console.log('✅ Server cart loaded:', cart);
            
            // Fetch images for items that don't have imageUrl
            if (cart && cart.items) {
              const imagesToFetch = cart.items.filter(item => !item.imageUrl);
              if (imagesToFetch.length > 0) {
                console.log(`🖼️ Fetching images for ${imagesToFetch.length} books in checkout...`);
                
                const imagePromises = imagesToFetch.map(async (item) => {
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
                });
                
                await Promise.all(imagePromises);
              }
            }
          } catch (cartErr: any) {
            console.error('❌ Failed to fetch cart:', cartErr.message);
            throw new Error('Không thể tải giỏ hàng');
          }
        }
      } else if (bookId) {
        // Buy-now checkout - load single book
        console.log('🔍 Fetching book with ID:', bookId);
        
        try {
          const bookDetail = await bookService.getBookById(bookId);
          const displayBook = toDisplayBookDetail(bookDetail as any);

          // Fetch cover image
          try {
            const coverDto = await bookService.getBookCover(bookId);
            if (coverDto) {
              displayBook.cover = coverDto.imageUrl;
            } else {
              displayBook.cover = PLACEHOLDER_IMAGES.DEFAULT_BOOK;
            }
          } catch (coverErr) {
            console.warn('⚠️ Cover image not found, using placeholder');
            displayBook.cover = PLACEHOLDER_IMAGES.DEFAULT_BOOK;
          }

          setBook(displayBook);
          console.log('✅ Book loaded:', displayBook.title, 'Price:', displayBook.price);
        } catch (bookErr: any) {
          console.error('❌ Failed to fetch book:', bookErr.message);
          throw new Error('Không tìm thấy sách với ID: ' + bookId);
        }
      }

      // 2. Fetch user profile for name & phone
      try {
        const profile = await userProfileService.getMyProfile();
        setName(profile.fullName || '');
        setPhone(profile.phoneNumber || '');
        console.log('✅ Profile loaded:', profile.fullName);
      } catch (err: any) {
        console.warn('⚠️ Failed to load profile:', err.message);
        // Not critical, user can still checkout
      }

      // 3. Fetch addresses and set default
      try {
        const addressList = await addressService.getMyAddresses();
        setAddresses(addressList);

        // Find default address or use first one
        const defaultAddr = addressList.find((a) => a.isDefault) || addressList[0];
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
          setName(defaultAddr.recipientName);
          setPhone(defaultAddr.phoneNumber);
          setAddress(`${defaultAddr.streetAddress}, ${defaultAddr.ward}, ${defaultAddr.district}, ${defaultAddr.province}`);
          console.log('✅ Default address loaded:', defaultAddr.recipientName);
        } else {
          console.warn('⚠️ No addresses found');
        }
      } catch (err: any) {
        console.warn('⚠️ Failed to load addresses:', err.message);
        // Not critical, user can enter manually
      }
    } catch (err: any) {
      console.error('❌ Failed to load checkout data:', err);
      showSnackbar(err.message || 'Không thể tải thông tin. Vui lòng thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeAddress = () => {
    router.push('/(stack)/addresses?mode=select');
  };

  // Handle COD Order
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showSnackbar('Vui lòng chọn địa chỉ giao hàng', 'error');
      return;
    }

    // Validate: must have either bookId (buy-now) or selectedCartItems/serverCart (cart checkout)
    if (!fromCart && !bookId) {
      showSnackbar('Không tìm thấy thông tin sản phẩm', 'error');
      return;
    }

    // If from cart, check if we have selected items OR server cart
    if (fromCart) {
      if (selectedCartItems) {
        if (selectedCartItems.length === 0) {
          showSnackbar('Không có sản phẩm nào được chọn', 'error');
          return;
        }
      } else if (!serverCart || serverCart.items.length === 0) {
        showSnackbar('Giỏ hàng trống', 'error');
        return;
      }
    }

    try {
      setProcessing(true);

      // CRITICAL: Backend lấy items từ cart database
      // Nếu "Mua ngay" (không từ cart), phải add vào cart trước
      if (!fromCart && bookId) {
        console.log('📦 Adding to cart before checkout:', bookId, 'x', qty);
        try {
          // Clear cart cũ để chỉ checkout sản phẩm được chọn
          await cartService.clearCart();
          console.log('✅ Cart cleared');
          
          // Add item mới vào cart
          await cartService.addToCart({ bookId, quantity: qty });
          console.log('✅ Added to cart successfully');
          
          // Wait a bit for backend to process
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (cartError: any) {
          console.error('❌ Failed to add to cart:', cartError);
          showSnackbar('Không thể thêm vào giỏ hàng', 'error');
          setProcessing(false);
          return;
        }
      }

      // Build address object matching CreateOrderAddressDto
      const checkoutRequest = {
        address: {
          recipientName: selectedAddress.recipientName,
          phoneNumber: selectedAddress.phoneNumber,
          province: selectedAddress.province,
          district: selectedAddress.district,
          ward: selectedAddress.ward,
          street: selectedAddress.streetAddress, // Map field name
          note: undefined,
        },
        couponCode: appliedVoucher || undefined,
        paymentMethod: "COD", // String literal, not TypeScript const
        provider: "VietQR",
        note: undefined,
      };

      console.log('📦 Placing COD order:');
      console.log('From cart:', fromCart);
      console.log('Selected Address:', JSON.stringify(selectedAddress, null, 2));
      console.log('Request:', JSON.stringify(checkoutRequest, null, 2));
      console.log('From cart?', fromCart, 'Selected items:', selectedCartItems?.length, 'Non-selected:', nonSelectedItems.length);

      const result = await checkoutService.processCheckout(checkoutRequest);
      
      console.log('📦 Checkout result:', JSON.stringify(result, null, 2));

      if (result.success) {
        console.log('✅ Order placed successfully!');
        // Mark checkout as successful to prevent cleanup effect from restoring
        checkoutSuccessful.current = true;
        
        // Restore non-selected items to cart (since backend clears entire cart)
        if (nonSelectedItems && nonSelectedItems.length > 0) {
          console.log('🔄 Restoring non-selected items to cart:', nonSelectedItems);
          try {
            for (const item of nonSelectedItems) {
              await cartService.addToCart({ bookId: item.bookId, quantity: item.quantity });
            }
            console.log('✅ Non-selected items restored');
            // Clear the state to prevent any issues
            setNonSelectedItems([]);
          } catch (err) {
            console.error('❌ Failed to restore non-selected items:', err);
          }
        }
        
        // Prefer in-app snackbar + notification instead of native alert
        showSnackbar(`Đặt hàng thành công — ${result.orderCode}`, 'success');
        addNotification({ type: 'order', title: 'Đặt hàng thành công', message: `Mã: ${result.orderCode}`, orderId: result.orderId });
        // Navigate back after short delay so user sees snackbar
        setTimeout(() => router.back(), 1200);
      } else {
        console.log('❌ Order failed:', result.message);
        showSnackbar(result.message || 'Không thể đặt hàng. Vui lòng thử lại.', 'error');
      }
    } catch (error: any) {
      console.error('❌ Error placing order:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đặt hàng';
      showSnackbar(errorMessage, 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Handle E-Wallet Payment
  const handlePayNow = async () => {
    if (!selectedAddress) {
      showSnackbar('Vui lòng chọn địa chỉ giao hàng', 'error');
      return;
    }

    // Validate: must have either bookId (buy-now) or selectedCartItems/serverCart (cart checkout)
    if (!fromCart && !bookId) {
      showSnackbar('Không tìm thấy thông tin sản phẩm', 'error');
      return;
    }

    // If from cart, check if we have selected items OR server cart
    if (fromCart) {
      if (selectedCartItems) {
        if (selectedCartItems.length === 0) {
          showSnackbar('Không có sản phẩm nào được chọn', 'error');
          return;
        }
      } else if (!serverCart || serverCart.items.length === 0) {
        showSnackbar('Giỏ hàng trống', 'error');
        return;
      }
    }

    try {
      setProcessing(true);

      // CRITICAL: Backend lấy items từ cart database
      // Nếu "Mua ngay" (không từ cart), phải add vào cart trước
      if (!fromCart && bookId) {
        console.log('💳 Adding to cart before checkout:', bookId, 'x', qty);
        try {
          // Clear cart cũ để chỉ checkout sản phẩm được chọn
          await cartService.clearCart();
          console.log('✅ Cart cleared');
          
          // Add item mới vào cart
          await cartService.addToCart({ bookId, quantity: qty });
          console.log('✅ Added to cart successfully');
          
          // Wait a bit for backend to process
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (cartError: any) {
          console.error('❌ Failed to add to cart:', cartError);
          showSnackbar('Không thể thêm vào giỏ hàng', 'error');
          setProcessing(false);
          return;
        }
      }

      // Build address object matching CreateOrderAddressDto
      const checkoutRequest = {
        address: {
          recipientName: selectedAddress.recipientName,
          phoneNumber: selectedAddress.phoneNumber,
          province: selectedAddress.province,
          district: selectedAddress.district,
          ward: selectedAddress.ward,
          street: selectedAddress.streetAddress, // Map field name
          note: undefined,
        },
        couponCode: appliedVoucher || undefined,
        paymentMethod: "Online", // String literal "Online" for e-wallet
        provider: "VietQR",
        note: undefined,
      };

      console.log('💳 Processing online payment:');
      console.log('Selected Address:', JSON.stringify(selectedAddress, null, 2));
      console.log('Request:', JSON.stringify(checkoutRequest, null, 2));

      const result = await checkoutService.processCheckout(checkoutRequest);

      console.log('💳 Checkout result:', JSON.stringify(result, null, 2));

      if (result.success && result.paymentInfo) {
        console.log('✅ Payment info received, showing QR modal');
        // Mark checkout as successful to prevent cleanup effect from restoring
        checkoutSuccessful.current = true;
        
        // Restore non-selected items to cart (since backend clears entire cart)
        if (nonSelectedItems && nonSelectedItems.length > 0) {
          console.log('🔄 Restoring non-selected items to cart:', nonSelectedItems);
          try {
            for (const item of nonSelectedItems) {
              await cartService.addToCart({ bookId: item.bookId, quantity: item.quantity });
            }
            console.log('✅ Non-selected items restored');
            // Clear the state to prevent any issues
            setNonSelectedItems([]);
          } catch (err) {
            console.error('❌ Failed to restore non-selected items:', err);
          }
        }
        
        // Show QR modal
        setPaymentInfo(result.paymentInfo);
        setCurrentOrderId(result.orderId || null);
        setCurrentTransactionCode(result.paymentInfo.transferContent || null); // Save transaction code
        
        setQrModalVisible(true);
        
        // Animate modal
        qrModalAnim.setValue(0);
        Animated.spring(qrModalAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      } else {
        console.log('❌ No payment info or not success:', result);
        showSnackbar(result.message || 'Không thể tạo thanh toán', 'error');
      }
    } catch (error: any) {
      console.error('❌ Error processing payment:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi thanh toán';
      showSnackbar(errorMessage, 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Simulate payment callback
  const handlePaymentSuccess = async () => {
    if (!currentOrderId || !currentTransactionCode) {
      showSnackbar('Thiếu thông tin thanh toán', 'error');
      return;
    }

    try {
      setProcessing(true);

      const callback = {
        transactionCode: currentTransactionCode, // Use real transaction code from backend
        orderId: currentOrderId,
        amount: totalPayment,
        status: 'SUCCESS' as const,
        message: 'Thanh toán thành công',
      };

      console.log('✅ Simulating payment callback:', callback);

      await checkoutService.handlePaymentCallback(callback);

      // Add notification
      addNotification({
        type: 'payment',
        title: 'Thanh toán thành công',
        message: `Đơn hàng của bạn đã được thanh toán. Tổng tiền: ${totalPayment.toLocaleString('vi-VN')}₫`,
        orderId: currentOrderId,
      });

      // Close modal
      setQrModalVisible(false);

      // Show in-app success and navigate back
      showSnackbar('Thanh toán thành công! Đơn hàng đã được xác nhận.', 'success');
      setTimeout(() => router.back(), 1200);
    } catch (error: any) {
      console.error('❌ Error handling payment callback:', error);
      showSnackbar('Có lỗi xảy ra. Vui lòng liên hệ hỗ trợ.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const closeQrModal = () => {
    Animated.timing(qrModalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setQrModalVisible(false);
      setPaymentInfo(null);
      // Note: Do NOT restore items here because order is already created
      // User can check their order in order history even if they close QR modal
      // The non-selected items were already restored after processCheckout
      setCurrentOrderId(null);
    });
  };

  // Totals calculation
  const discountOnProduct = useMemo(() => (appliedVoucher === 'SALE10' ? Math.round(subtotal * 0.1) : 0), [appliedVoucher, subtotal]);
  const discountOnShipping = useMemo(() => (appliedVoucher === 'SHIPFREE' ? shippingFee : 0), [appliedVoucher, shippingFee]);
  const shipping = shippingFee;
  const totalPayment = subtotal - discountOnProduct + shipping - discountOnShipping;

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF4757" />
        <Text style={{ marginTop: 12, color: '#666' }}>Đang tải...</Text>
      </View>
    );
  }

  // Show error if no book in buy-now mode or no cart in cart mode
  if (!fromCart && !book) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF4757" style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 }}>
          Không tìm thấy sản phẩm
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: '#FF4757', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Check if cart is empty (only if we're checking entire cart, not selected items)
  if (fromCart && !selectedCartItems && (!serverCart || serverCart.items.length === 0)) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="cart-outline" size={64} color="#FF4757" style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 }}>
          Giỏ hàng trống
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: '#FF4757', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        <TouchableOpacity style={styles.addressCard} onPress={handleChangeAddress}>
          {selectedAddress ? (
            <>
              <View style={styles.addressHeader}>
                <Text style={styles.addressName}>
                  {name} <Text style={styles.addressPhone}>| {phone}</Text>
                </Text>
              </View>
              <Text style={styles.addressDetail}>
                {address}
              </Text>
              {selectedAddress.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Mặc định</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyAddress}>
              <Ionicons name="add-circle-outline" size={24} color="#FF4757" />
              <Text style={styles.emptyAddressText}>Thêm địa chỉ giao hàng</Text>
            </View>
          )}
          <View style={styles.chevronIcon}>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>
        </TouchableOpacity>

        {/* 2. Product info */}
        <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>
        <View style={styles.cartCardSmall}>
          {fromCart && selectedCartItems ? (
            <>
              {selectedCartItems.map((item: any, idx: number) => {
                // Get image URL with priority: from item > placeholder
                let imageUrl: string;
                if (item.imageUrl) {
                  imageUrl = item.imageUrl.startsWith('http') 
                    ? item.imageUrl 
                    : `${MINIO_BASE_URL}${item.imageUrl}`;
                } else {
                  imageUrl = PLACEHOLDER_IMAGES.DEFAULT_BOOK;
                }
                
                return (
                  <View key={idx} style={[styles.cartContentRow, idx > 0 && { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' }]}>
                    <Image 
                      source={{ uri: imageUrl }} 
                      style={styles.cartImage} 
                    />
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
                      <Text style={styles.unitPrice}>{item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.qtyLabel}>x{item.quantity}</Text>
                    </View>
                  </View>
                );
              })}
            </>
          ) : fromCart && serverCart ? (
            <>
              {serverCart.items.map((item, idx) => {
                // Get image URL with priority: backend > fetched > placeholder
                let imageUrl: string;
                if (item.imageUrl) {
                  imageUrl = item.imageUrl.startsWith('http') 
                    ? item.imageUrl 
                    : `${MINIO_BASE_URL}${item.imageUrl}`;
                } else if (bookImages[item.bookId]) {
                  imageUrl = bookImages[item.bookId].startsWith('http')
                    ? bookImages[item.bookId]
                    : `${MINIO_BASE_URL}${bookImages[item.bookId]}`;
                } else {
                  imageUrl = PLACEHOLDER_IMAGES.DEFAULT_BOOK;
                }
                
                return (
                  <View key={idx} style={[styles.cartContentRow, idx > 0 && { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' }]}>
                    <Image 
                      source={{ uri: imageUrl }} 
                      style={styles.cartImage} 
                    />
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={2} style={styles.title}>{item.bookTitle}</Text>
                      <Text style={styles.unitPrice}>{item.bookPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.qtyLabel}>x{item.quantity}</Text>
                    </View>
                  </View>
                );
              })}
            </>
          ) : book ? (
            <>
              <View style={styles.cartContentRow}>
                <Image source={{ uri: book.cover }} style={styles.cartImage} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={2} style={styles.title}>{book.title}</Text>
                  <Text style={styles.unitPrice}>{book.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
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

        {/* 4. Shipping method */}
        <Text style={styles.sectionTitle}>Phương thức vận chuyển</Text>
        <View style={styles.shippingMethodContainer}>
          <TouchableOpacity 
            style={[styles.shippingMethodCard, shippingMethod === 'STANDARD' && styles.shippingMethodActive]} 
            onPress={() => setShippingMethod('STANDARD')}
          >
            <View style={styles.shippingMethodHeader}>
              <View style={styles.radioOuter}>
                {shippingMethod === 'STANDARD' && <View style={styles.radioInner} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.shippingMethodTitle, shippingMethod === 'STANDARD' && styles.shippingMethodTitleActive]}>
                  Giao hàng nhanh
                </Text>
                <Text style={styles.shippingMethodDesc}>Nhận hàng trong 3-5 ngày</Text>
              </View>
              <Text style={[styles.shippingMethodPrice, shippingMethod === 'STANDARD' && styles.shippingMethodPriceActive]}>
                30.000₫
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.shippingMethodCard, shippingMethod === 'EXPRESS' && styles.shippingMethodActive]} 
            onPress={() => setShippingMethod('EXPRESS')}
          >
            <View style={styles.shippingMethodHeader}>
              <View style={styles.radioOuter}>
                {shippingMethod === 'EXPRESS' && <View style={styles.radioInner} />}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.shippingMethodTitle, shippingMethod === 'EXPRESS' && styles.shippingMethodTitleActive]}>
                    Giao hàng hỏa tốc
                  </Text>
                  <View style={styles.expressBadge}>
                    <Ionicons name="flash" size={12} color="#FF4757" />
                    <Text style={styles.expressBadgeText}>Nhanh</Text>
                  </View>
                </View>
                <Text style={styles.shippingMethodDesc}>Nhận hàng trong 24 giờ</Text>
              </View>
              <Text style={[styles.shippingMethodPrice, shippingMethod === 'EXPRESS' && styles.shippingMethodPriceActive]}>
                50.000₫
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 5. Payment method */}
        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
        <View style={styles.cardRowSmall}>
          <TouchableOpacity style={[styles.methodBtn, paymentMethod === 'COD' ? styles.methodActive : null]} onPress={() => setPaymentMethod('COD')}>
            <Text style={paymentMethod === 'COD' ? styles.methodTextActive : styles.methodText}>Thanh toán khi nhận hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.methodBtn, paymentMethod === 'EWALLET' ? styles.methodActive : null]} onPress={() => setPaymentMethod('EWALLET')}>
            <Text style={paymentMethod === 'EWALLET' ? styles.methodTextActive : styles.methodText}>Thanh toán qua ví</Text>
          </TouchableOpacity>
        </View>

        {/* 6. Payment details */}
        <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}><Text>Tổng tiền hàng</Text><Text>{subtotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text></View>
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
          <TouchableOpacity 
            style={[styles.placeOrderBtn, processing && styles.btnDisabled]} 
            onPress={handlePlaceOrder}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.placeOrderText}>Đặt hàng</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.payNowBtn, processing && styles.btnDisabled]} 
            onPress={handlePayNow}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payNowText}>Tiến hành thanh toán</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* QR Payment Modal */}
      <Modal visible={qrModalVisible} transparent animationType="none" onRequestClose={closeQrModal}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.qrModalCard, { transform: [{ scale: qrModalAnim }], opacity: qrModalAnim }]}>
            <TouchableOpacity style={styles.closeModalBtn} onPress={closeQrModal}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>

            <Text style={styles.qrModalTitle}>Quét mã QR để thanh toán</Text>
            
            {paymentInfo?.qrCodeUrl ? (
              <View style={styles.qrCodeContainer}>
                <Image source={{ uri: paymentInfo.qrCodeUrl }} style={styles.qrCodeImage} />
              </View>
            ) : (
              <View style={styles.qrCodePlaceholder}>
                <Ionicons name="qr-code-outline" size={150} color="#DDD" />
              </View>
            )}

            <View style={styles.paymentDetails}>
              <Text style={styles.paymentLabel}>Ngân hàng</Text>
              <Text style={styles.paymentValue}>{paymentInfo?.bankName || 'VietQR Bank'}</Text>
              
              <Text style={styles.paymentLabel}>Số tài khoản</Text>
              <Text style={styles.paymentValue}>{paymentInfo?.accountNumber || '0123456789'}</Text>
              
              <Text style={styles.paymentLabel}>Chủ tài khoản</Text>
              <Text style={styles.paymentValue}>{paymentInfo?.accountName || 'BOOKSTORE'}</Text>
              
              <Text style={styles.paymentLabel}>Nội dung chuyển khoản</Text>
              <Text style={styles.paymentValue}>{paymentInfo?.transferContent || `DH${Date.now()}`}</Text>
              
              <View style={styles.amountRow}>
                <Text style={styles.paymentLabel}>Số tiền</Text>
                <Text style={styles.amountValue}>{(paymentInfo?.amount || totalPayment).toLocaleString('vi-VN')}₫</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.confirmPaymentBtn, processing && styles.btnDisabled]}
              onPress={handlePaymentSuccess}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.confirmPaymentText}>Đã thanh toán</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.qrModalNote}>
              * Nút "Đã thanh toán" để giả lập callback từ cổng thanh toán
            </Text>
          </Animated.View>
        </View>
      </Modal>

      {/* Snackbar (in-app) */}
      {snackbar && (
        <View style={[styles.snackbar, snackbar.type === 'error' ? styles.snackbarError : snackbar.type === 'success' ? styles.snackbarSuccess : styles.snackbarInfo]}>
          <Text style={styles.snackbarText}>{snackbar.message}</Text>
        </View>
      )}
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
  addressCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 3, marginBottom: 12, position: 'relative' },
  addressHeader: { marginBottom: 8 },
  addressName: { fontSize: 16, fontWeight: '700', color: '#333' },
  addressPhone: { fontSize: 14, fontWeight: '500', color: '#666' },
  addressDetail: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 8 },
  defaultBadge: { alignSelf: 'flex-start', backgroundColor: '#FFF0F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginTop: 4 },
  defaultBadgeText: { color: '#ff5a3c', fontSize: 12, fontWeight: '600' },
  chevronIcon: { position: 'absolute', right: 14, top: '50%', marginTop: -10 },
  emptyAddress: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  emptyAddressText: { fontSize: 15, color: '#FF4757', marginLeft: 8, fontWeight: '500' },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
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
  shippingMethodContainer: { gap: 10, marginBottom: 12 },
  shippingMethodCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10, borderWidth: 2, borderColor: '#EEE' },
  shippingMethodActive: { borderColor: '#FF4757', backgroundColor: '#FFF5F5' },
  shippingMethodHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#DDD', alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF4757' },
  shippingMethodTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 2 },
  shippingMethodTitleActive: { color: '#FF4757' },
  shippingMethodDesc: { fontSize: 13, color: '#999' },
  shippingMethodPrice: { fontSize: 15, fontWeight: '700', color: '#333' },
  shippingMethodPriceActive: { color: '#FF4757' },
  expressBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFE8EB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 6 },
  expressBadgeText: { fontSize: 11, color: '#FF4757', fontWeight: '600', marginLeft: 2 },
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
  placeOrderBtn: { backgroundColor: '#2CB47B', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, minWidth: 120, alignItems: 'center' },
  placeOrderText: { color: '#fff', fontWeight: '700' },
  payNowBtn: { backgroundColor: '#FF4757', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, minWidth: 120, alignItems: 'center' },
  payNowText: { color: '#fff', fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  qrModalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', maxWidth: 400, maxHeight: '90%' },
  closeModalBtn: { position: 'absolute', right: 12, top: 12, zIndex: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  qrModalTitle: { fontSize: 20, fontWeight: '700', color: '#333', textAlign: 'center', marginBottom: 20 },
  qrCodeContainer: { alignItems: 'center', marginBottom: 20, padding: 10, backgroundColor: '#F8F8F8', borderRadius: 12 },
  qrCodeImage: { width: 250, height: 250, borderRadius: 8 },
  qrCodePlaceholder: { alignItems: 'center', justifyContent: 'center', height: 250, backgroundColor: '#F8F8F8', borderRadius: 12, marginBottom: 20 },
  paymentDetails: { backgroundColor: '#F8F8F8', borderRadius: 12, padding: 16, marginBottom: 16 },
  paymentLabel: { fontSize: 13, color: '#666', marginTop: 8, marginBottom: 4 },
  paymentValue: { fontSize: 15, fontWeight: '600', color: '#333' },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  amountValue: { fontSize: 20, fontWeight: '700', color: '#FF4757' },
  confirmPaymentBtn: { backgroundColor: '#2CB47B', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 10, gap: 8, marginBottom: 12 },
  confirmPaymentText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  qrModalNote: { fontSize: 12, color: '#999', textAlign: 'center', fontStyle: 'italic' },
  snackbar: { 
    position: 'absolute', 
    left: 0, 
    right: 0, 
    bottom: 50, 
    marginHorizontal: 16, 
    borderRadius: 8, 
    padding: 12, 
    shadowColor: '#000', 
    shadowOpacity: 0.2, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowRadius: 4, 
    elevation: 3 
  },
  snackbarText: { color: '#fff', fontWeight: '500' },
  snackbarError: { backgroundColor: '#FF4757' },
  snackbarSuccess: { backgroundColor: '#2CB47B' },
  snackbarInfo: { backgroundColor: '#1976d2' },
});
