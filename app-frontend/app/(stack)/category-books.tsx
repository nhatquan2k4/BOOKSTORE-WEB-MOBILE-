import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import bookService from '@/src/services/bookService';
import { BookCard } from '@/components/BookCard';
import type { Book } from '@/src/types/book';
import { toDisplayBook } from '@/src/types/book';
import { PLACEHOLDER_IMAGES } from '@/src/constants/placeholders';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 160;
const HORIZONTAL_PADDING = 20;

// Calculate spacing to make cards evenly spaced
const availableWidth = SCREEN_WIDTH - (HORIZONTAL_PADDING * 2);
const CARD_SPACING = (availableWidth - (CARD_WIDTH * 2)) / 3; // 3 gaps: left, middle, right

export default function CategoryBooksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const flatListRef = useRef<FlatList>(null);
  
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const categoryName = params.categoryName as string || 'Sách';
  const categoryId = params.categoryId as string;

  useEffect(() => {
    fetchCategoryBooks();
  }, [categoryId]);

  const fetchCategoryBooks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all books with pagination
      let allBooks: any[] = [];
      let page = 1;
      let totalPages = 1;

      do {
        const response = await bookService.getBooks({
          pageNumber: page,
          pageSize: 100,
          sortBy: 'averageRating',
          sortDescending: true,
        });
        
        allBooks = [...allBooks, ...response.items];
        totalPages = response.totalPages;
        page++;
      } while (page <= totalPages && page <= 10); // Limit to 10 pages max

      // Filter by category name
      const booksInCategory = allBooks.filter((book: any) => 
        book.categoryNames?.includes(categoryName)
      );

      // Convert to display format with covers
      const booksWithCovers = await Promise.all(
        booksInCategory.map(async (book: Book) => {
          try {
            const coverDto = await bookService.getBookCover(book.id);
            const resolvedCover = coverDto?.imageUrl || PLACEHOLDER_IMAGES.DEFAULT_BOOK;

            return {
              ...toDisplayBook(book),
              guid: book.id,
              cover: resolvedCover,
              categoryNames: (book as any).categoryNames || [],
            };
          } catch (imgErr) {
            return {
              ...toDisplayBook(book),
              guid: book.id,
              cover: PLACEHOLDER_IMAGES.DEFAULT_BOOK,
              categoryNames: (book as any).categoryNames || [],
            };
          }
        })
      );

      setBooks(booksWithCovers);
      
      if (booksWithCovers.length === 0) {
        setError('Không có sách nào trong thể loại này.');
      }
    } catch (err: any) {
      console.error('[Category Books] Error:', err);
      setError('Không thể tải danh sách sách. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookPress = (bookId: string) => {
    router.push(`/(stack)/book-detail?id=${bookId}`);
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 300); // Show button after scrolling 300px
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const renderBookItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <View style={styles.bookItemWrapper}>
        <BookCard 
          {...item}
          onPress={() => handleBookPress(item.guid || item.id)}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{categoryName}</Text>
          {/* <Text style={styles.headerSubtitle}>
            {books.length} {books.length === 1 ? 'sách' : 'sách'}
          </Text> */}
        </View>
        
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>Đang tải sách...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF4757" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchCategoryBooks}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : books.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="book-outline" size={64} color="#999" />
          <Text style={styles.emptyText}>Không có sách nào</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={books}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <TouchableOpacity 
          style={[styles.scrollTopButton, { bottom: insets.bottom + 20 }]}
          onPress={scrollToTop}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-up" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0ede4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#D5CCB3',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#FF4757',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: '#4ECDC4',
    borderRadius: 25,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  listContent: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bookItemWrapper: {
    width: CARD_WIDTH,
  },
  scrollTopButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
