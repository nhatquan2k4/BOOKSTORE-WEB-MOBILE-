import { BookCard } from '@/components/BookCard';
import { CategoryItem } from '@/components/CategoryItem';
import { SectionHeader } from '@/components/SectionHeader';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import bookService from '@/src/services/bookService';
import categoryService from '@/src/services/categoryService';
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
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';

// Icon mapping for categories
const categoryIcons: Record<string, string> = {
  'Fiction': 'book',
  'Non-Fiction': 'newspaper',
  'Science': 'flask',
  'Technology': 'hardware-chip',
  'History': 'time',
  'Biography': 'person',
  'Fantasy': 'planet',
  'Mystery': 'search',
  'Romance': 'heart',
  'Thriller': 'thunderstorm',
  'Horror': 'skull',
  'Adventure': 'compass',
  'Poetry': 'create',
  'Comics': 'book-outline',
  'Manga': 'book-outline',
  'Self-Help': 'fitness',
  'Business': 'briefcase',
  'Cooking': 'restaurant',
  'Travel': 'airplane',
  'Children': 'happy',
};

// Color mapping for categories
const categoryColors = [
  { color: '#FF6B6B', bgColor: '#FFE5E5' },
  { color: '#4ECDC4', bgColor: '#E0F7F5' },
  { color: '#FF6B9D', bgColor: '#FFE5EF' },
  { color: '#A29BFE', bgColor: '#E8E6FD' },
  { color: '#FFA07A', bgColor: '#FFE8DD' },
  { color: '#74B9FF', bgColor: '#E3F2FD' },
  { color: '#55EFC4', bgColor: '#E0FFF4' },
  { color: '#FDCB6E', bgColor: '#FFF5D9' },
  { color: '#FD79A8', bgColor: '#FFE8F0' },
  { color: '#A29BFE', bgColor: '#E8E6FD' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const scrollRef = useRef<ScrollView>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // null = "All"
  
  // State for API data
  const [categories, setCategories] = useState<any[]>([]);
  const [allBooks, setAllBooks] = useState<any[]>([]); // Store all books
  const [booksData, setBooksData] = useState<any[]>([]); // For single category view
  const [booksByCategory, setBooksByCategory] = useState<Record<string, any[]>>({}); // For "All" view
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { width: screenWidth } = useWindowDimensions();

  // Fetch categories and books from API
  useEffect(() => {
    fetchCategoriesAndBooks();
  }, []);

  // Fetch books when category changes
  useEffect(() => {
    if (categories.length > 0 && selectedCategory !== null) {
      fetchBooksByCategory();
    }
  }, [selectedCategory]);

  // Scroll to top when Home tab is pressed
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress' as any, (e: any) => {
      if (isFocused && scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
    });

    return unsubscribe;
  }, [navigation, isFocused]);

  const fetchCategoriesAndBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch ALL categories (all pages)
      let allCategories: any[] = [];
      let categoryPage = 1;
      let totalCategoryPages = 1;
      
      do {
        const categoriesResponse = await categoryService.getCategories({ 
          pageNumber: categoryPage, 
          pageSize: 100 
        }).catch((err) => {
          console.error(`[Categories Page ${categoryPage}] API Error:`, err);
          return { items: [], total: 0, page: categoryPage, pageSize: 10, totalPages: 1 };
        });
        
        console.log(`[Debug] Fetching categories page ${categoryPage}/${categoriesResponse.totalPages || 1}`);
        
        allCategories = [...allCategories, ...categoriesResponse.items];
        totalCategoryPages = categoriesResponse.totalPages || 1;
        categoryPage++;
        
        // Safety check to prevent infinite loop
        if (categoryPage > 100) {
          console.warn('[Debug] Breaking category loop - exceeded 100 pages');
          break;
        }
      } while (categoryPage <= totalCategoryPages);
      
      console.log(`[Debug] ✅ Fetched ${allCategories.length} categories from ${totalCategoryPages} page(s)`);
      
      // Fetch ALL books (all pages)
      let allBooksFromAPI: any[] = [];
      let bookPage = 1;
      let totalBookPages = 1;
      
      do {
        const booksResponse = await bookService.getBooks({
          pageNumber: bookPage,
          pageSize: 100,
          sortBy: 'averageRating',
          sortDescending: true,
        }).catch((err) => {
          console.error(`[All Books Page ${bookPage}] API Error:`, err);
          return { items: [], total: 0, page: bookPage, pageSize: 100, totalPages: 1 };
        });
        
        console.log(`[Debug] Fetching books page ${bookPage}/${booksResponse.totalPages || 1} - got ${booksResponse.items.length} items`);
        
        allBooksFromAPI = [...allBooksFromAPI, ...booksResponse.items];
        totalBookPages = booksResponse.totalPages || 1;
        bookPage++;
        
        // Safety check to prevent infinite loop
        if (bookPage > 100) {
          console.warn('[Debug] Breaking books loop - exceeded 100 pages');
          break;
        }
      } while (bookPage <= totalBookPages);
      
      console.log(`[Debug] ✅ Fetched ${allBooksFromAPI.length} books from ${totalBookPages} page(s)`);
      
      // Get all unique category names from books
      const bookCategoryNames = new Set<string>();
      allBooksFromAPI.forEach((book: any) => {
        book.categoryNames?.forEach((name: string) => bookCategoryNames.add(name));
      });
      
      console.log('[Debug] Category names in books:', Array.from(bookCategoryNames));
      
      // Filter categories to only include ones that have books
      const categoriesWithBooks = allCategories.filter((cat: any) => 
        bookCategoryNames.has(cat.name)
      );
      
      console.log('[Debug] Categories with books:', categoriesWithBooks.map((c: any) => c.name));
      
      // Map categories to UI format with icons and colors
      const mappedCategories = categoriesWithBooks.map((cat: any, index: number) => {
        const colorSet = categoryColors[index % categoryColors.length];
        return {
          id: cat.id,
          name: cat.name,
          icon: categoryIcons[cat.name] || 'book-outline',
          color: colorSet.color,
          bgColor: colorSet.bgColor,
        };
      });

      // Add "All" category at the beginning
      const allCategory = {
        id: null,
        name: 'All',
        icon: 'library',
        color: '#FF6B6B',
        bgColor: '#FFE5E5',
      };

      setCategories([allCategory, ...mappedCategories]);
      
      // Use all the books we already fetched
      await fetchAllBooks(mappedCategories, allBooksFromAPI);
      
    } catch (err: any) {
      console.error('[Fetch Categories] Unexpected error:', err);
      setError('Không thể tải danh sách thể loại. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAllBooks = async (categoriesToOrganize: any[], existingBooks?: any[]) => {
    try {
      setLoading(true);
      setError(null);
      
      let booksToProcess;
      
      if (existingBooks) {
        // Use existing books if provided
        booksToProcess = existingBooks;
      } else {
        // Fetch all books at once (increase page size to get more books)
        const booksResponse = await bookService.getBooks({
          pageNumber: 1,
          pageSize: 100, // Get more books
          sortBy: 'averageRating',
          sortDescending: true,
        }).catch((err) => {
          console.error('[All Books] API Error:', err);
          return { items: [], total: 0, page: 1, pageSize: 100, totalPages: 0 };
        });
        booksToProcess = booksResponse.items;
      }
      
      // Convert to display format and add cover images
      const booksWithCovers = await Promise.all(
        booksToProcess.map(async (book: Book) => {
          try {
            const coverDto = await bookService.getBookCover(book.id);
            const resolvedCover = coverDto?.imageUrl || PLACEHOLDER_IMAGES.DEFAULT_BOOK;

            return {
              ...toDisplayBook(book),
              guid: book.id,
              cover: resolvedCover,
              categoryNames: (book as any).categoryNames || [], // Keep category names
            };
          } catch (imgErr) {
            console.error(`Error fetching cover for book ${book.id}:`, imgErr);
            return {
              ...toDisplayBook(book),
              guid: book.id,
              cover: PLACEHOLDER_IMAGES.DEFAULT_BOOK,
              categoryNames: (book as any).categoryNames || [],
            };
          }
        })
      );
      
      setAllBooks(booksWithCovers);
      
      // Debug: Log all unique category names from books
      const allCategoryNames = new Set<string>();
      booksWithCovers.forEach(book => {
        book.categoryNames?.forEach((name: string) => allCategoryNames.add(name));
      });
      console.log('[Debug] All category names from books:', Array.from(allCategoryNames));
      console.log('[Debug] Category names from API:', categoriesToOrganize.map(c => c.name));
      
      // Organize books by category
      const categoryBooksMap: Record<string, any[]> = {};
      
      categoriesToOrganize.forEach((category) => {
        // Filter books that belong to this category
        const booksInCategory = booksWithCovers.filter((book) => 
          book.categoryNames?.includes(category.name)
        ).slice(0, 10); // Limit to 10 books per category
        
        console.log(`[Debug] Category "${category.name}" has ${booksInCategory.length} books`);
        
        if (booksInCategory.length > 0) {
          categoryBooksMap[category.id] = booksInCategory;
        }
      });
      
      setBooksByCategory(categoryBooksMap);
      
      if (booksWithCovers.length === 0) {
        setError('Không có sách nào.');
      }
    } catch (err: any) {
      console.error('[Fetch All Books] Unexpected error:', err);
      setError('Không thể tải danh sách sách. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchBooksByCategory = async (categoryId: string | null = selectedCategory) => {
    try {
      setLoading(true);
      setError(null);
      
      // Find category name
      const category = categories.find(c => c.id === categoryId);
      if (!category) {
        setError('Không tìm thấy thể loại.');
        return;
      }
      
      // Filter books from allBooks by category name
      const booksInCategory = allBooks.filter((book) => 
        book.categoryNames?.includes(category.name)
      );
      
      setBooksData(booksInCategory);
      
      if (booksInCategory.length === 0) {
        setError('Không có sách nào trong thể loại này.');
      }
    } catch (err: any) {
      console.error('[Fetch Books by Category] Unexpected error:', err);
      setError('Không thể tải danh sách sách. Vui lòng thử lại sau.');
      setBooksData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (categories.length === 0) {
      fetchCategoriesAndBooks();
    } else {
      if (selectedCategory === null) {
        // Refresh all categories
        const realCategories = categories.filter(c => c.id !== null);
        fetchAllBooks(realCategories);
      } else {
        // Refresh single category (re-filter from existing data)
        fetchBooksByCategory();
      }
    }
  }, [categories, selectedCategory, allBooks]);

  const handleCategoryPress = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    
    // If switching to a specific category and data not loaded yet
    if (categoryId !== null) {
      fetchBooksByCategory(categoryId);
    }
  };

  const handleBookPress = (bookId: string | number) => {
    const idToUse = (bookId as any)?.guid ? (bookId as any).guid : bookId;
    router.push(`/(stack)/book-detail?id=${idToUse}`);
  };

  // Get selected category name for title
  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name || 'All';

  return (
    <View style={styles.container}>
      {/* Top banner image inserted above StatusBar/header */}
      {/* <Image
        source={{ uri: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80&auto=format&fit=crop' }}
        style={styles.topBanner}
        resizeMode="cover"
      /> */}
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView 
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4ECDC4"
            colors={['#4ECDC4']}
          />
        }
      >
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
            placeholder="Tìm kiếm sách, tác giả..."
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
              contentContainerStyle={[
                styles.categoriesScroll,
                screenWidth > 500 && {
                  width: '100%',
                  justifyContent: 'center',
                  gap: 20,
                }
              ]}
            >
              {categories.map((category) => (
                <CategoryItem
                  key={category.id || 'all'}
                  {...category}
                  isSelected={selectedCategory === category.id}
                  onPress={() => handleCategoryPress(category.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Books Section - Show all categories or single category */}
          {selectedCategory === null ? (
            // "All" view - Show multiple sections by category
            <>
              {loading ? (
                <Text style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                  Đang tải sách...
                </Text>
              ) : error ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#FF4757', marginBottom: 10 }}>{error}</Text>
                  <TouchableOpacity onPress={() => {
                    const realCategories = categories.filter(c => c.id !== null);
                    fetchAllBooks(realCategories);
                  }}>
                    <Text style={{ color: '#4ECDC4', fontWeight: '600' }}>Thử lại</Text>
                  </TouchableOpacity>
                </View>
              ) : Object.keys(booksByCategory).length === 0 ? (
                <Text style={{ padding: 20, textAlign: 'center', color: '#999' }}>
                  Không có sách nào
                </Text>
              ) : (
                <>
                  {categories.filter(c => c.id !== null && booksByCategory[c.id]?.length > 0).map((category) => (
                    <View key={category.id} style={styles.section}>
                      <SectionHeader 
                        title={category.name} 
                        onViewAll={() => handleCategoryPress(category.id)} 
                      />
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.booksScroll}
                      >
                        {booksByCategory[category.id]?.map((book) => (
                          <BookCard 
                            key={book.id} 
                            {...book} 
                            onPress={() => handleBookPress(book.guid || book.id)} 
                          />
                        ))}
                      </ScrollView>
                    </View>
                  ))}
                </>
              )}
            </>
          ) : (
            // Single category view
            <View style={styles.section}>
              <SectionHeader 
                title={selectedCategoryName} 
                onViewAll={() => {}} 
              />
              
              {loading ? (
                <Text style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                  Đang tải sách...
                </Text>
              ) : error ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#FF4757', marginBottom: 10 }}>{error}</Text>
                  <TouchableOpacity onPress={() => fetchBooksByCategory()}>
                    <Text style={{ color: '#4ECDC4', fontWeight: '600' }}>Thử lại</Text>
                  </TouchableOpacity>
                </View>
              ) : booksData.length === 0 ? (
                <Text style={{ padding: 20, textAlign: 'center', color: '#999' }}>
                  Không có sách nào
                </Text>
              ) : (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.booksScroll}
                >
                  {booksData.map((book) => (
                    <BookCard 
                      key={book.id} 
                      {...book} 
                      onPress={() => handleBookPress(book.guid || book.id)} 
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          )}

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
    gap: 15,
  },
  topBanner: {
    width: '100%',
    height: 140,
  },

});