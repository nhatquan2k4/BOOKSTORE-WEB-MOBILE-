import { BookCard } from '@/components/BookCard';
import { CategoryItem } from '@/components/CategoryItem';
import { SectionHeader } from '@/components/SectionHeader';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useEffect, useState } from 'react';
import bookService from '@/src/services/bookService';
import type { Book } from '@/src/types/book';
import { toDisplayBook } from '@/src/types/book';
import { PLACEHOLDER_IMAGES } from '@/src/constants/placeholders';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Dữ liệu mẫu cho categories
const categories = [
  { 
    id: 1, 
    name: 'All',
    icon: 'library',
    imageSource: require('@/assets/images/all-book.png'),
    color: '#FF6B6B',
    bgColor: '#FFE5E5',
    useImage: true,
  },
  { 
    id: 2, 
    name: 'eBooks',
    icon: 'tablet-portrait',
    imageSource: require('@/assets/images/eBook.png'),
    color: '#4ECDC4',
    bgColor: '#E0F7F5',
    useImage: true,
  },
  { 
    id: 3, 
    name: 'New',
    icon: 'sparkles',
    color: '#FF6B9D',
    bgColor: '#FFE5EF'
  },
  { 
    id: 4, 
    name: 'Fiction',
    icon: 'book',
    color: '#A29BFE',
    bgColor: '#E8E6FD'
  },
  { 
    id: 5, 
    name: 'Manga',
    icon: 'compass',
    color: '#FFA07A',
    bgColor: '#FFE8DD'
  },
  { 
    id: 6, 
    name: 'Fantasy',
    icon: 'planet',
    color: '#74B9FF',
    bgColor: '#E3F2FD'
  },
];

// Data imported from @/data/mockBooks

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(1);
  
  // State for API data
  const [popularBooksData, setPopularBooksData] = useState<any[]>([]);
  const [ebooksData, setEbooksData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch books from API
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch popular books (first page)
      const popularResponse = await bookService.getBooks({
        pageNumber: 1,
        pageSize: 10,
        sortBy: 'averageRating',
        sortDescending: true,
      });
      
      // Convert to display format and add cover images
      const popularWithCovers = await Promise.all(
        popularResponse.items.map(async (book: Book) => {
          try {
            const coverDto = await bookService.getBookCover(book.id);
            const resolvedCover = coverDto?.imageUrl || PLACEHOLDER_IMAGES.DEFAULT_BOOK;
            console.log(`[Book Cover] id=${book.id} cover=${resolvedCover}`);

                return {
                  ...toDisplayBook(book),
                  guid: book.id, // keep original GUID for navigation
                  cover: resolvedCover,
                };
          } catch (imgErr) {
            console.error(`Error fetching cover for book ${book.id}:`, imgErr);
            return {
              ...toDisplayBook(book),
              cover: PLACEHOLDER_IMAGES.DEFAULT_BOOK,
            };
          }
        })
      );
      
      setPopularBooksData(popularWithCovers);
      
      // Fetch ebooks (filter by format if possible)
      const ebooksResponse = await bookService.getBooks({
        pageNumber: 1,
        pageSize: 10,
        // TODO: Add filter for ebook format if backend supports it
      });
      
      const ebooksWithCovers = await Promise.all(
        ebooksResponse.items.slice(0, 6).map(async (book: Book) => {
          try {
            const coverDto = await bookService.getBookCover(book.id);
            return {
              ...toDisplayBook(book),
              guid: book.id,
              cover: coverDto?.imageUrl || PLACEHOLDER_IMAGES.DEFAULT_BOOK,
            };
          } catch (imgErr) {
            console.error(`Error fetching cover for book ${book.id}:`, imgErr);
            return {
              ...toDisplayBook(book),
              cover: PLACEHOLDER_IMAGES.DEFAULT_BOOK,
            };
          }
        })
      );
      
      setEbooksData(ebooksWithCovers);
    } catch (err: any) {
      console.error('Error fetching books:', err);
      setError(err.message || 'Failed to fetch books');
      // Show empty state on error
      setPopularBooksData([]);
      setEbooksData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookPress = (bookId: string | number) => {
  // If item includes original GUID (guid), use it. Some components use numeric id for UI.
  const idToUse = (bookId as any)?.guid ? (bookId as any).guid : bookId;
  router.push(`/(stack)/book-detail?id=${idToUse}`);
  };

  return (
    <View style={styles.container}>
      {/* Top banner image inserted above StatusBar/header */}
      {/* <Image
        source={{ uri: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80&auto=format&fit=crop' }}
        style={styles.topBanner}
        resizeMode="cover"
      /> */}
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
  {/* ...existing code... */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Background Banner */}
        <View style={[styles.headerBannerContainer, { paddingTop: insets.top }]}>
          {/* Background Image */}
          <Image
            source={{ uri: 'https://i.pinimg.com/736x/b3/24/00/b32400fb30bf0d2a381cc4d5741afb23.jpg' }}
            style={styles.headerBannerImage}
            resizeMode="cover"
          />
          
          {/* Overlay gradient */}
          <View style={styles.headerBannerOverlay} />
          
          {/* Header Content on top - Centered */}
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>Hello, Reader!</Text>
              <Text style={styles.subtitle}>What would you like to read today?</Text>
            </View>
          </View>
        </View>

        {/* Search Bar - Below header, above white content */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books, authors..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color="#706e6eff" />
          </TouchableOpacity>
        </View>

        {/* White Content Area with curved top - All content from Categories down */}
        <View style={styles.whiteContentArea}>
          {/* Categories */}
          <View style={styles.categoriesSection}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {categories.map((category) => (
                <CategoryItem
                  key={category.id}
                  {...category}
                  isSelected={selectedCategory === category.id}
                  onPress={() => setSelectedCategory(category.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Popular Section */}
          <View style={styles.section}>
            <SectionHeader title="Popular Books" onViewAll={() => {}} />
            
            {loading ? (
              <Text style={{ padding: 20, textAlign: 'center', color: '#666' }}>Đang tải sách phổ biến...</Text>
            ) : error ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#FF4757', marginBottom: 10 }}>{error}</Text>
                <TouchableOpacity onPress={fetchBooks}>
                  <Text style={{ color: '#4ECDC4', fontWeight: '600' }}>Thử lại</Text>
                </TouchableOpacity>
              </View>
            ) : popularBooksData.length === 0 ? (
              <Text style={{ padding: 20, textAlign: 'center', color: '#999' }}>Không có sách nào</Text>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.booksScroll}
              >
                {popularBooksData.map((book) => (
                  <BookCard 
                    key={book.id} 
                    {...book} 
                    onPress={() => handleBookPress(book.guid || book.id)} 
                  />
                ))}
              </ScrollView>
            )}
          </View>

          {/* eBooks Section */}
          <View style={styles.section}>
            <SectionHeader title="eBooks" onViewAll={() => {}} />
            
            {loading ? (
              <Text style={{ padding: 20, textAlign: 'center', color: '#666' }}>Đang tải eBooks...</Text>
            ) : error ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#FF4757', marginBottom: 10 }}>{error}</Text>
                <TouchableOpacity onPress={fetchBooks}>
                  <Text style={{ color: '#4ECDC4', fontWeight: '600' }}>Thử lại</Text>
                </TouchableOpacity>
              </View>
            ) : ebooksData.length === 0 ? (
              <Text style={{ padding: 20, textAlign: 'center', color: '#999' }}>Không có eBook nào</Text>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.booksScroll}
              >
                {ebooksData.map((book) => (
                  <BookCard 
                    key={book.id} 
                    {...book} 
                    onPress={() => handleBookPress(book.guid || book.id)} 
                  />
                ))}
              </ScrollView>
            )}
          </View>

        {/* Padding bottom để tránh bị che bởi tab bar */}
        <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0ede4',
  },
  headerBannerContainer: {
    position: 'relative',
    minHeight: 550, // Giảm xuống vì content area sẽ overlap
    marginBottom: -70, // Negative margin để content overlap
  },
  headerBannerImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  headerBannerOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0)', // Overlay trắng nhẹ hơn
    top: 0,
    left: 0,
  },
  header: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 95,
    paddingBottom: 15,
    zIndex: 10,
  },
  headerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 14,
    color: '#ffffffff',
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -100,
    marginBottom: 40,
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#f0ede4',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    marginTop: 0,
  },
  whiteContentArea: {
    backgroundColor: '#f0ede4',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    marginTop: 0,
    minHeight: '100%',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
  },
  section: {
    marginBottom: 25,
    backgroundColor: 'transparent',
  },
  booksScroll: {
    paddingHorizontal: 20,
    gap: 20,
  },
  categoriesSection: {
    marginBottom: 25,
    marginTop: 10,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    backgroundColor: '#f0ede4',
    gap: 15,
  },
  topBanner: {
    width: '100%',
    height: 140,
  },

});