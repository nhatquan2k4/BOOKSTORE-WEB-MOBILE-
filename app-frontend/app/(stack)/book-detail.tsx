import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import bookService from '@/src/services/bookService';
import stockService from '@/src/services/stockService';
import cartService from '@/src/services/cartService';
import type { BookDetail } from '@/src/types/book';
import { toDisplayBookDetail } from '@/src/types/book';
import { PLACEHOLDER_IMAGES, getRandomBookCovers } from '@/src/constants/placeholders';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '@/app/providers/CartProvider';

const { width } = Dimensions.get('window');
const COVER_WIDTH = 220;

export default function BookDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // API State
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // buy-sheet & UI state (must be declared unconditionally)
  const [buySheetVisible, setBuySheetVisible] = useState(false);
  const [buyQty, setBuyQty] = useState(1);
  const buySheetAnim = useRef(new Animated.Value(0)).current; // 0 hidden -> 1 visible

  // Stock state
  const [availableStock, setAvailableStock] = useState<number>(-1); // -1 = no data, 0 = out of stock, >0 = available
  const [loadingStock, setLoadingStock] = useState(false);

  const { addToCart } = useCart();

  const [rentModalVisible, setRentModalVisible] = useState(false);
  const [selectedRentOption, setSelectedRentOption] = useState<string | null>(null);

  const toastAnim = useRef(new Animated.Value(0)).current;
  const [toastVisible, setToastVisible] = useState(false);

  const openBuySheet = async () => {
    setBuyQty(1);
    setBuySheetVisible(true);
    buySheetAnim.setValue(0);
    Animated.timing(buySheetAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    
    // Fetch available stock when opening buy sheet
    if (book?.id) {
      setLoadingStock(true);
      try {
        const quantity = await stockService.getAvailableQuantity(book.id);
        setAvailableStock(quantity);
        
        if (quantity === -1) {
          console.log(`📦 No stock data for book ${book.id} - allowing purchase`);
        } else {
          console.log(`📦 Available stock for book ${book.id}:`, quantity);
        }
      } catch (error) {
        console.warn('Could not fetch stock:', error);
        setAvailableStock(-1); // No data = allow purchase
      } finally {
        setLoadingStock(false);
      }
    }
  };

  const closeBuySheet = (cb?: () => void) => {
    Animated.timing(buySheetAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setBuySheetVisible(false);
      cb && cb();
    });
  };

  const confirmBuy = async () => {
    try {
      // Add to cart API first so backend can process checkout
      console.log('🛒 Adding to cart before checkout:', book.id, buyQty);
      await cartService.addToCart({
        bookId: book.id,
        quantity: buyQty,
      });
      console.log('✅ Added to cart successfully');
      
      // Then navigate to checkout
      closeBuySheet(() => router.push(`/(stack)/checkout?bookId=${book.id}&qty=${buyQty}`));
    } catch (error: any) {
      console.error('❌ Error adding to cart:', error);
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
      closeBuySheet();
    }
  };

  const handleBuyNow = () => openBuySheet();

  const showToast = (text: string) => {
    setToastVisible(true);
    toastAnim.setValue(0);
    Animated.timing(toastAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(toastAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setToastVisible(false));
    }, 1100);
  };

  // Fetch book details from API
  useEffect(() => {
    fetchBookDetail();
  }, [params.id]);

  const fetchBookDetail = async () => {
    if (!params.id) {
      setError('No book ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const bookIdStr = params.id.toString();
      
      // Try to fetch from API
      const bookDetail: any = await bookService.getBookById(bookIdStr);
      
      console.log('📚 Raw book detail from API:', bookDetail);
      console.log('💰 Price fields:', {
        price: bookDetail.price,
        currentPrice: bookDetail.currentPrice,
        amount: bookDetail.amount,
      });

      // Map to display shape using helper
      const displayBook = toDisplayBookDetail(bookDetail as any);
      
      console.log('📖 Display book after mapping:', displayBook);
      console.log('💵 Final price:', displayBook.price);

      // Try to fetch images (use cover endpoint + fallback to images list)
      try {
        const coverDto = await bookService.getBookCover(bookIdStr);
        if (coverDto) {
          displayBook.cover = coverDto.imageUrl;
          // Try to fetch full images list for carousel
          const images = await bookService.getBookImages(bookIdStr);
          displayBook.coverImages = (images && images.length > 0) ? images.map((i: any) => i.imageUrl) : [displayBook.cover];
        } else {
          // No cover found, try full list
          const images = await bookService.getBookImages(bookIdStr);
          if (images && images.length > 0) {
            displayBook.cover = images.find((img: any) => img.isCover)?.imageUrl || images[0].imageUrl;
            displayBook.coverImages = images.map((i: any) => i.imageUrl);
          } else {
            displayBook.cover = PLACEHOLDER_IMAGES.DEFAULT_BOOK;
            displayBook.coverImages = getRandomBookCovers(2);
          }
        }
      } catch (imgErr) {
        console.error('Error fetching book images:', imgErr);
        displayBook.cover = PLACEHOLDER_IMAGES.DEFAULT_BOOK;
        displayBook.coverImages = getRandomBookCovers(2);
      }

      setBook(displayBook);
    } catch (err: any) {
      console.error('Error fetching book detail:', err);
      setError(err.message || 'Failed to fetch book details');
      
      // Don't fallback to mock data - show error instead
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <Text style={{ fontSize: 16, color: '#666' }}>Đang tải thông tin sách...</Text>
      </View>
    );
  }

  // Show error or no book
  if (!book || error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <Ionicons name="alert-circle-outline" size={64} color="#FF4757" style={{ marginBottom: 20 }} />
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 10 }}>
          Không tìm thấy sách
        </Text>
        {error && (
          <Text style={{ fontSize: 14, color: '#999', textAlign: 'center', marginBottom: 20 }}>
            {error}
          </Text>
        )}
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ 
            backgroundColor: '#FF4757', 
            paddingHorizontal: 24, 
            paddingVertical: 12, 
            borderRadius: 20,
            marginBottom: 10
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Quay lại</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={fetchBookDetail}>
          <Text style={{ color: '#4ECDC4', fontWeight: '600' }}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Front and back cover (2 images only)
  const coverImages = book.coverImages || [book.cover, book.cover];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveImageIndex(index);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Curved Background */}
        <View style={styles.headerBackground}>
          {/* Header Buttons */}
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? "#FF4757" : "#333"} 
              />
            </TouchableOpacity>
          </View>

          {/* Book Cover Carousel */}
          <View style={styles.coverContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              decelerationRate="fast"
              snapToInterval={width}
              snapToAlignment="center"
              contentContainerStyle={styles.coverScrollContent}
            >
              {coverImages.map((imageUri, index) => (
                <View key={index} style={styles.coverSlide}>
                  <Image 
                    source={{ uri: imageUri }} 
                    style={styles.coverImage} 
                    resizeMode="cover" 
                  />
                </View>
              ))}
            </ScrollView>
            
            {/* Page indicator dots */}
            <View style={styles.pageIndicator}>
              {coverImages.map((_, index) => (
                <View 
                  key={index}
                  style={[
                    styles.dot, 
                    activeImageIndex === index && styles.dotActive
                  ]} 
                />
              ))}
            </View>
          </View>
        </View>

        {/* Book Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.titlePriceRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{book.title}</Text>
              <Text style={styles.author}>bởi {book.author}</Text>
            </View>
            {book.price && book.price > 0 ? (
              <Text style={styles.price}>{book.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
            ) : (
              <Text style={[styles.price, { fontSize: 14, color: '#999' }]}>Liên hệ</Text>
            )}
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{book.pages}</Text>
              <Text style={styles.statLabel}>Trang</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#FFB800" />
                <Text style={styles.statNumber}>{book.rating}</Text>
              </View>
              <Text style={styles.statLabel}>Sao</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{book.language}</Text>
              <Text style={styles.statLabel}>Ngôn ngữ</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Mô tả</Text>
            <Text style={styles.description} numberOfLines={showFullDescription ? undefined : 3}>
              {book.description}
            </Text>
            {!showFullDescription && (
              <TouchableOpacity onPress={() => setShowFullDescription(true)}>
                <Text style={styles.readMore}>Xem thêm...</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

  <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={[styles.bottomButton, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={async () => {
            try {
              // Add to server cart instead of local cart
              await cartService.addToCart({
                bookId: book.id,
                quantity: 1,
              });
              console.log('✅ Added to server cart:', book.id);
              
              // Also add to local cart for UI consistency
              addToCart({ id: book.id, title: book.title, price: book.price || 0 });
              
              showToast('Đã thêm vào giỏ');
            } catch (error: any) {
              console.error('❌ Error adding to cart:', error);
              Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
            }
          }}
        >
          <Ionicons name="bag-outline" size={24} color="#FF4757" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.rentButton} onPress={() => setRentModalVisible(true)}>
          <Text style={styles.rentButtonText}>Thuê</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyButton} onPress={handleBuyNow}>
          <Text style={styles.buyButtonText}>Mua Ngay</Text>
        </TouchableOpacity>
      </View>

      {toastVisible && (
        <Animated.View
          style={[
            styles.toastContainer,
            { opacity: toastAnim, transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] },
          ]}
          pointerEvents="none"
        >
          <View style={styles.toastBubble}>
            <Text style={styles.toastText}>Đã thêm vào giỏ</Text>
          </View>
        </Animated.View>
      )}

      {/* Rent options modal */}
      <Modal visible={rentModalVisible} transparent animationType="fade" onRequestClose={() => setRentModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Chọn thời gian thuê</Text>
            {['1 tuần', '1 tháng', '3 tháng'].map((opt) => (
              <Pressable
                key={opt}
                onPress={() => setSelectedRentOption(opt)}
                style={[styles.rentOption, selectedRentOption === opt ? styles.rentOptionSelected : null]}
              >
                <Text style={[styles.rentOptionText, selectedRentOption === opt ? styles.rentOptionTextSelected : null]}>{opt}</Text>
              </Pressable>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setSelectedRentOption(null); setRentModalVisible(false); }}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, !selectedRentOption ? { opacity: 0.5 } : null]}
                onPress={() => {
                  if (!selectedRentOption) return;
                  setRentModalVisible(false);
                  showToast(`Đã thuê (${selectedRentOption})`);
                  setSelectedRentOption(null);
                }}
              >
                <Text style={styles.modalConfirmText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Buy now full-screen overlay + sliding bottom sheet */}
      <Modal visible={buySheetVisible} transparent animationType="none" onRequestClose={() => closeBuySheet()}>
        <View style={{ flex: 1 }}>
          {/* dimmed overlay that closes when pressed */}
          <Animated.View style={[styles.fullOverlay, { opacity: buySheetAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] }) }]}>
            <Pressable style={{ flex: 1 }} onPress={() => closeBuySheet()} />
          </Animated.View>

          {/* sliding sheet */}
          <Animated.View
            style={[
              styles.sheetCard,
              {
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                transform: [
                  { translateY: buySheetAnim.interpolate({ inputRange: [0, 1], outputRange: [360, 0] }) },
                ],
              },
            ]}
          >
            {/* Product info */}
            <View style={styles.popProductRow}>
              <Image source={{ uri: book.cover }} style={styles.popCover} />
              <View style={styles.popProductInfo}>
                <Text numberOfLines={1} style={styles.popTitle}>{book.title}</Text>
                <Text style={styles.popPrice}>{(book.price || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
                {/* Stock availability - only show if we have real stock data (>= 0) */}
                {!loadingStock && availableStock >= 0 && (
                  <View style={styles.stockRow}>
                    <Ionicons 
                      name={availableStock > 0 ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={availableStock > 0 ? "#4CAF50" : "#FF4757"} 
                    />
                    <Text style={[styles.stockText, availableStock === 0 && styles.stockTextOut]}>
                      {availableStock > 0 
                        ? `Còn ${availableStock} sản phẩm` 
                        : 'Hết hàng'}
                    </Text>
                  </View>
                )}
                {loadingStock && (
                  <View style={styles.stockRow}>
                    <Text style={styles.stockTextLoading}>Đang kiểm tra kho...</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.sheetBodyRow}>
              <Text style={styles.sheetLabelLeft}>Số lượng</Text>
              <View style={styles.qtyRowRight}>
                <TouchableOpacity 
                  style={styles.stepBtn} 
                  onPress={() => setBuyQty(Math.max(1, buyQty - 1))}
                  disabled={buyQty <= 1}
                >
                  <Text style={styles.stepText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{buyQty}</Text>
                <TouchableOpacity 
                  style={styles.stepBtn} 
                  onPress={() => setBuyQty(buyQty + 1)}
                  disabled={availableStock >= 0 && availableStock > 0 && buyQty >= availableStock}
                >
                  <Text style={styles.stepText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sheetFooter}>
              <TouchableOpacity 
                style={[
                  styles.sheetConfirm, 
                  (availableStock === 0) && styles.sheetConfirmDisabled
                ]} 
                onPress={confirmBuy}
                disabled={availableStock === 0}
              >
                <Text style={styles.sheetConfirmText}>
                  {availableStock === 0 
                    ? 'Hết hàng' 
                    : availableStock > 0 && buyQty > availableStock 
                    ? 'Vượt quá số lượng' 
                    : 'Mua Ngay'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBackground: {
    backgroundColor: '#D4F4DD',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 40,
    marginBottom: -20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#fff',
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
  },
  coverContainer: {
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  coverScrollContent: {
    alignItems: 'center',
  },
  coverSlide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: (width - COVER_WIDTH) / 2,
  },
  coverImage: {
    width: COVER_WIDTH,
    height: 320,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  pageIndicator: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C0C0C0',
  },
  dotActive: {
    backgroundColor: '#666',
    width: 24,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: '#888',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4757',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  descriptionSection: {
    marginTop: 8,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  readMore: {
    fontSize: 14,
    color: '#FF4757',
    marginTop: 4,
    fontWeight: '500',
  },
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  addToCartButton: {
    width: 56,
    height: 56,
    borderRadius: 30,
    backgroundColor: '#FFE8EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rentButton: {
    width: 64,
    height: 56,
    borderRadius: 30,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rentButtonText: {
    fontSize: 14,
    color: '#FF8A00',
    fontWeight: '600',
  },
  buyButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#FF4757',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 100,
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  toastText: { color: '#fff', fontWeight: '600' },
  toastContainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },
  toastBubble: { backgroundColor: 'rgba(0,0,0,0.85)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: '86%', backgroundColor: '#fff', borderRadius: 12, padding: 18, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  rentOption: { width: '100%', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginBottom: 8, alignItems: 'center' },
  rentOptionSelected: { borderColor: '#FF8A00', backgroundColor: '#FFF4E6' },
  rentOptionText: { fontSize: 16, color: '#333' },
  rentOptionTextSelected: { color: '#FF8A00', fontWeight: '700' },
  modalActions: { flexDirection: 'row', marginTop: 12, width: '100%', justifyContent: 'space-between' },
  modalCancel: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginRight: 8, borderWidth: 1, borderColor: '#DDD' },
  modalCancelText: { color: '#333', fontWeight: '600' },
  modalConfirm: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginLeft: 8, backgroundColor: '#FF8A00' },
  modalConfirmText: { color: '#fff', fontWeight: '700' },
  sheetOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  sheetCard: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  sheetHeader: { alignItems: 'center', marginBottom: 8 },
  sheetTitle: { fontSize: 16, fontWeight: '700' },
  sheetBody: { alignItems: 'center', paddingVertical: 8 },
  sheetLabel: { color: '#666', marginBottom: 12 },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  stepText: { fontSize: 20, fontWeight: '700', color: '#333' },
  qtyText: { fontSize: 18, marginHorizontal: 12, minWidth: 36, textAlign: 'center' },
  sheetBodyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  sheetLabelLeft: { fontSize: 16, color: '#333' },
  qtyRowRight: { flexDirection: 'row', alignItems: 'center' },
  sheetFooter: { paddingTop: 12 },
  sheetConfirm: { backgroundColor: '#FF4757', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  sheetConfirmText: { color: '#fff', fontWeight: '700' },
  popOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  popCard: { width: '86%', backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 10 },
  popProductRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  popCover: { width: 64, height: 92, borderRadius: 8, marginRight: 12 },
  popProductInfo: { flex: 1 },
  popTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  popPrice: { fontSize: 14, color: '#FF4757', marginTop: 4 },
  stockRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 6,
    gap: 4,
  },
  stockText: { 
    fontSize: 13, 
    color: '#4CAF50',
    fontWeight: '500',
  },
  stockTextOut: { 
    color: '#FF4757',
  },
  stockTextLoading: { 
    fontSize: 13, 
    color: '#999',
    fontStyle: 'italic',
  },
  sheetConfirmDisabled: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  fullOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
});
