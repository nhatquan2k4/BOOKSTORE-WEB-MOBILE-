import { BookCard } from '@/components/BookCard';
import { CategoryItem } from '@/components/CategoryItem';
import { SectionHeader } from '@/components/SectionHeader';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import bookService from '@/src/services/bookService';
import categoryService from '@/src/services/categoryService';
import authorService from '@/src/services/authorService';
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
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';
import { Modal, Pressable, Animated, Easing, Platform } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 160;
const HORIZONTAL_PADDING = 20;

// Calculate spacing to make cards evenly spaced
const availableWidth = SCREEN_WIDTH - (HORIZONTAL_PADDING * 2);
const CARD_SPACING = (availableWidth - (CARD_WIDTH * 2)) / 3; // 3 gaps: left, middle, right

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
  const { theme, isDarkMode } = useTheme();
  
  // State for API data
  const [categories, setCategories] = useState<any[]>([]);
  const [booksData, setBooksData] = useState<any[]>([]); // For single category view
  const [booksByCategory, setBooksByCategory] = useState<Record<string, any[]>>({}); // For "All" view
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  
  // Pagination state
  const [currentCategoryPage, setCurrentCategoryPage] = useState(1); // For "All" view - load categories page by page
  const [currentBookPage, setCurrentBookPage] = useState(1); // For single category - load books page by page
  const [hasMoreCategories, setHasMoreCategories] = useState(true);
  const [hasMoreBooks, setHasMoreBooks] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const BOOKS_PER_PAGE = 20; // Load 20 books at a time for single category
  const CATEGORIES_PER_PAGE = 5; // Load 5 categories at a time for "All" view
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    books: any[];
    authors: any[];
    categories: any[];
  }>({ books: [], authors: [], categories: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // Track if user is typing
  const searchTimeoutRef = useRef<any>(null);

  // Fetch categories and books from API
  useEffect(() => {
    fetchCategoriesAndBooks();
  }, []);

  // Fetch books when category changes - Reset pagination
  useEffect(() => {
    if (categories.length > 0 && selectedCategory !== null) {
      setCurrentBookPage(1);
      setHasMoreBooks(true);
      setBooksData([]); // Clear old data
      fetchBooksByCategory(1, true); // true = reset data
    } else if (selectedCategory === null && categories.length > 0) {
      // Reset to "All" view
      setCurrentCategoryPage(1);
      setHasMoreCategories(true);
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
      if (currentCategoryPage === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      // Get categories for current page
      const startIdx = (currentCategoryPage - 1) * CATEGORIES_PER_PAGE;
      const endIdx = startIdx + CATEGORIES_PER_PAGE;
      const categoriesForThisPage = categoriesToOrganize.slice(startIdx, endIdx);
      
      // Check if there are more categories to load
      setHasMoreCategories(endIdx < categoriesToOrganize.length);
      
      console.log(`[Debug] Loading categories page ${currentCategoryPage}: ${categoriesForThisPage.map(c => c.name).join(', ')}`);
      
      // Fetch books for each category (10 books per category)
      const categoryBooksMap: Record<string, any[]> = currentCategoryPage === 1 ? {} : { ...booksByCategory };
      
      for (const category of categoriesForThisPage) {
        try {
          // Fetch books for this category
          const booksResponse = await bookService.getBooks({
            pageNumber: 1,
            pageSize: 10,
            categoryId: category.id,
            sortBy: 'averageRating',
            sortDescending: true,
          }).catch((err) => {
            console.error(`[Category ${category.name}] API Error:`, err);
            return { items: [], total: 0, pageNumber: 1, pageSize: 10, totalPages: 0 };
          });
          
          if (booksResponse.items.length > 0) {
            // Convert books to display format with cover images
            const booksWithCovers = await Promise.all(
              booksResponse.items.map(async (book: Book) => {
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
            
            categoryBooksMap[category.id] = booksWithCovers;
            console.log(`[Debug] Category "${category.name}" loaded ${booksWithCovers.length} books`);
          }
        } catch (err) {
          console.error(`[Category ${category.name}] Error:`, err);
        }
      }
      
      setBooksByCategory(categoryBooksMap);
      
      if (Object.keys(categoryBooksMap).length === 0 && currentCategoryPage === 1) {
        setError('Không có sách nào.');
      }
    } catch (err: any) {
      console.error('[Fetch All Books] Unexpected error:', err);
      setError('Không thể tải danh sách sách. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const fetchBooksByCategory = async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      const categoryId = selectedCategory;
      
      // Find category name
      const category = categories.find(c => c.id === categoryId);
      if (!category) {
        setError('Không tìm thấy thể loại.');
        return;
      }
      
      // Fetch books from API by category ID
      const booksResponse = await bookService.getBooks({
        pageNumber: page,
        pageSize: BOOKS_PER_PAGE,
        categoryId: categoryId || undefined,
        sortBy: 'averageRating',
        sortDescending: true,
      }).catch((err) => {
        console.error('[Books by Category] API Error:', err);
        return { items: [], total: 0, pageNumber: page, pageSize: BOOKS_PER_PAGE, totalPages: 0 };
      });
      
      // Check if there are more pages
      const pageNum = (booksResponse as any).pageNumber || (booksResponse as any).page || page;
      const totalPages = booksResponse.totalPages || 1;
      setHasMoreBooks(pageNum < totalPages);
      
      console.log(`[Debug] Fetched ${booksResponse.items.length} books for category "${category.name}" (page ${page}/${totalPages})`);
      
      // Convert books to display format with cover images
      const booksWithCovers = await Promise.all(
        booksResponse.items.map(async (book: Book) => {
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
      
      if (reset) {
        setBooksData(booksWithCovers);
      } else {
        setBooksData(prev => [...prev, ...booksWithCovers]);
      }
      
      if (booksWithCovers.length === 0 && page === 1) {
        setError('Không có sách nào trong thể loại này.');
      }
    } catch (err: any) {
      console.error('[Fetch Books by Category] Unexpected error:', err);
      setError('Không thể tải danh sách sách. Vui lòng thử lại sau.');
      if (reset) {
        setBooksData([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    
    if (selectedCategory === null) {
      setCurrentCategoryPage(1);
      setHasMoreCategories(true);
    } else {
      setCurrentBookPage(1);
      setHasMoreBooks(true);
    }
    
    if (categories.length === 0) {
      fetchCategoriesAndBooks();
    } else {
      if (selectedCategory === null) {
        // Refresh all categories
        const realCategories = categories.filter(c => c.id !== null);
        fetchAllBooks(realCategories);
      } else {
        // Refresh single category
        fetchBooksByCategory(1, true);
      }
    }
  }, [categories, selectedCategory]);

  const handleCategoryPress = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    
    if (categoryId === null) {
      // Switch to "All" view
      setCurrentCategoryPage(1);
      setHasMoreCategories(true);
    } else {
      // Switch to single category
      setCurrentBookPage(1);
      setHasMoreBooks(true);
      setBooksData([]); // Clear old data
      fetchBooksByCategory(1, true);
    }
  };

  // Load more books/categories when scrolling
  const loadMoreBooks = () => {
    if (loadingMore) return;
    
    if (selectedCategory === null) {
      // Load more categories for "All" view
      if (!hasMoreCategories) return;
      const nextPage = currentCategoryPage + 1;
      setCurrentCategoryPage(nextPage);
      const realCategories = categories.filter(c => c.id !== null);
      fetchAllBooks(realCategories);
    } else {
      // Load more books for single category
      if (!hasMoreBooks) return;
      const nextPage = currentBookPage + 1;
      setCurrentBookPage(nextPage);
      fetchBooksByCategory(nextPage, false);
    }
  };

  // Handle scroll event to detect when user reaches bottom
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20; // Trigger load more when 20px from bottom
    
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      loadMoreBooks();
    }
  };

  const handleViewAllCategory = (categoryId: string, categoryName: string) => {
    console.log('[Navigation] View all category:', { categoryId, categoryName });
    router.push(`/(stack)/category-books?categoryId=${categoryId}&categoryName=${encodeURIComponent(categoryName)}`);
  };

  // Modal state for category filter
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Animated value for modal (0 = closed, 1 = open)
  const modalAnim = useRef(new Animated.Value(0)).current;

  const openFilterModal = () => setFilterModalVisible(true);
  const closeFilterModal = () => setFilterModalVisible(false);

  // For anchored dropdown: ref to filter button and measurement state
  const filterBtnRef = useRef<any>(null);
  const [filterAnchor, setFilterAnchor] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const DROPDOWN_WIDTH = 220; // fixed width for anchored dropdown
  const EXTRA_LEFT_SHIFT = 28; // shift left by this many pixels for better alignment
  const screenW = SCREEN_WIDTH;

  const openAnchoredDropdown = async () => {
    try {
      if (filterBtnRef.current && filterBtnRef.current.measureInWindow) {
        filterBtnRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
          setFilterAnchor({ x, y, width, height });
          setFilterModalVisible(true);
        });
      } else {
        // fallback to full sheet
        setFilterModalVisible(true);
      }
    } catch (err) {
      setFilterModalVisible(true);
    }
  };

  // Animate on visibility change
  useEffect(() => {
    Animated.timing(modalAnim, {
      toValue: filterModalVisible ? 1 : 0,
      duration: filterModalVisible ? 320 : 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [filterModalVisible]);

  const handleFilterSelect = (category: any) => {
    // Clear any active search
    clearSearch();
    // close animation: set visible false after a short timeout to allow animation
    // we set filterModalVisible to false which will trigger animation via effect
    closeFilterModal();
    if (category.id === null) {
      // 'All' selected - reset to All view
      setSelectedCategory(null);
      // Scroll to top for UX
      if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: true });
      return;
    }
    handleViewAllCategory(category.id, category.name);
  };

  const handleBookPress = (bookId: string | number) => {
    const idToUse = (bookId as any)?.guid ? (bookId as any).guid : bookId;
    console.log('[Navigation] Book pressed:', { bookId, idToUse });
    router.push(`/(stack)/book-detail?id=${idToUse}`);
  };

  // Search handler with debounce (2 seconds)
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // If search query is empty, clear results
    if (text.trim() === '') {
      setSearchResults({ books: [], authors: [], categories: [] });
      setIsSearching(false);
      setIsTyping(false);
      return;
    }
    
    // User is typing, show "Đang nhập..." message
    setIsTyping(true);
    
    // Set timeout for 2 seconds
    searchTimeoutRef.current = setTimeout(() => {
      setIsTyping(false); // User stopped typing
      performSearch(text);
    }, 2000); // 2 seconds delay
  };

  // Perform actual search for books, authors, and categories
  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      setIsSearching(true);
      console.log('[Search] Searching for:', query);
      
      const queryLower = query.toLowerCase().trim();
      
      // Search books and authors from API in parallel
      const [books, authors] = await Promise.all([
        bookService.searchBooks(query, 50).catch(err => {
          console.error('[Search Books] Error:', err);
          return [];
        }),
        authorService.searchAuthors(query).catch(err => {
          console.error('[Search Authors] Error:', err);
          return [];
        }),
      ]);
      
      // Filter categories from existing categories list (faster than API call)
      const matchingCategories = categories.filter(cat => 
        cat.id !== null && // Exclude "All" category
        cat.name.toLowerCase().includes(queryLower)
      );
      
      // Use books from direct search
      const allFoundBooks = books;
      
      // Convert books to display format with cover images
      const booksWithCovers = await Promise.all(
        allFoundBooks.map(async (book: any) => {
          // If book already has display format from allBooks
          if (book.cover && book.guid) {
            return book;
          }
          
          // Convert from API format
          const displayBook = toDisplayBook(book as Book);
          try {
            const images = await bookService.getBookImages(book.id);
            if (images && images.length > 0) {
              displayBook.cover = images[0].imageUrl;
            }
          } catch (err) {
            // Use default placeholder
            displayBook.cover = PLACEHOLDER_IMAGES.DEFAULT_BOOK;
          }
          // Add guid for navigation
          return {
            ...displayBook,
            guid: book.id, // Important: Add guid for handleBookPress
          };
        })
      );
      
      setSearchResults({
        books: booksWithCovers,
        authors: authors,
        categories: matchingCategories,
      });
      
      console.log('[Search] Found:', {
        books: booksWithCovers.length,
        authors: authors.length,
        categories: matchingCategories.length,
      });
    } catch (err: any) {
      console.error('[Search] Unexpected error:', err);
      setSearchResults({ books: [], authors: [], categories: [] });
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ books: [], authors: [], categories: [] });
    setIsSearching(false);
    setIsTyping(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Get selected category name for title
  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name || 'All';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top banner image inserted above StatusBar/header */}
      {/* <Image
        source={{ uri: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80&auto=format&fit=crop' }}
        style={styles.topBanner}
        resizeMode="cover"
      /> */}
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />
      <ScrollView 
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={400}
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
              <Text style={styles.greeting}>Chào Mừng Bạn Đến Với Bờ Úc Búc</Text>
              <Text style={styles.subtitle}>Bạn muốn đọc gì hôm nay?</Text>
            </View>
          </View>
        </View>

        {/* Search Bar - Below header, above white content */}
        <View style={[styles.searchContainer, { backgroundColor: theme.cardBackground }]}>
          <Ionicons name="search-outline" size={20} color={theme.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Tìm kiếm sách, tác giả..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={theme.textTertiary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.filterButton} ref={filterBtnRef} onPress={openAnchoredDropdown}>
            <Ionicons name="options-outline" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* White Content Area with curved top - All content from Categories down */}
        <View style={[styles.whiteContentArea, { backgroundColor: theme.background }]}>

          {/* Category Filter Modal */}
          <Modal
            visible={filterModalVisible}
            transparent
            statusBarTranslucent={true}
            onRequestClose={closeFilterModal}
          >
            {/* Animated overlay (covers whole screen) */}
            <Animated.View
              pointerEvents={filterModalVisible ? 'auto' : 'none'}
              style={[
                styles.modalOverlay,
                {
                  opacity: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }),
                },
              ]}
            >
              <Pressable style={{ flex: 1 }} onPress={closeFilterModal} />
            </Animated.View>

            {/* If filterAnchor is available, render anchored dropdown near the button */}
            {filterAnchor ? (
              <Animated.View
                style={[
                  styles.anchoredDropdown,
                  (() => {
                    const rawLeft = filterAnchor.x - EXTRA_LEFT_SHIFT;
                    const clampedLeft = Math.max(8, Math.min(rawLeft, screenW - DROPDOWN_WIDTH - 8));
                    return {
                      left: clampedLeft,
                      top: filterAnchor.y + filterAnchor.height + 6,
                      width: DROPDOWN_WIDTH,
                      opacity: modalAnim,
                      transform: [{ scale: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
                      backgroundColor: theme.cardBackground,
                    };
                  })(),
                ]}
              >
                <ScrollView contentContainerStyle={{ padding: 8 }}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id || 'anch-' + cat.name}
                      onPress={() => handleFilterSelect(cat)}
                      style={[{ paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 }]}
                    >
                      <Text style={{ color: theme.text }}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>
            ) : (
              // fallback to slide-up sheet
              <Animated.View
                style={[
                  styles.modalContent,
                  { backgroundColor: theme.cardBackground },
                  {
                    transform: [
                      {
                        translateY: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.modalHandle} />
                <Text style={[styles.modalTitle, { color: theme.text }]}>Chọn thể loại</Text>
                <ScrollView style={{ maxHeight: 360 }} contentContainerStyle={{ paddingBottom: 12 }}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id || 'all-modal'}
                      onPress={() => handleFilterSelect(cat)}
                      style={[styles.modalItem, { backgroundColor: theme.background }]}
                      activeOpacity={0.7}
                    >
                      <Text style={{ color: theme.text, fontSize: 16 }}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity onPress={closeFilterModal} style={styles.modalCloseButton}>
                  <Text style={{ color: '#4ECDC4', fontWeight: '600' }}>Đóng</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Modal>
          {/* Show search results if searching or has results */}
          {(isTyping || isSearching || 
            searchResults.books.length > 0 || 
            searchResults.authors.length > 0 || 
            searchResults.categories.length > 0 || 
            (searchQuery.trim() && !isSearching && !isTyping)) && (
            <View style={styles.section}>
              <SectionHeader 
                title={isTyping || isSearching ? 'Đang tìm kiếm...' : `Kết quả tìm kiếm`}
                onViewAll={() => {}}
              />
              {isTyping ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#999' }}>Đang nhập...</Text>
                </View>
              ) : isSearching ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#4ECDC4" />
                  <Text style={{ color: theme.textTertiary, marginTop: 10 }}>Đang tìm kiếm...</Text>
                </View>
              ) : (searchResults.books.length > 0 || searchResults.authors.length > 0 || searchResults.categories.length > 0) ? (
                <View style={{ paddingBottom: 20 }}>
                  {/* Books Results */}
                  {searchResults.books.length > 0 && (
                    <View style={{ marginBottom: 20 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', paddingHorizontal: 20, marginBottom: 10 }}>
                        Sách liên quan
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.booksScroll}
                      >
                        {searchResults.books.map((book) => (
                          <BookCard 
                            key={book.id} 
                            {...book}
                            onPress={() => handleBookPress(book.guid || book.id)} 
                          />
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* Authors Results */}
                  {searchResults.authors.length > 0 && (
                    <View style={{ marginBottom: 20, paddingHorizontal: 20 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 }}>
                        Tác giả
                      </Text>
                      {searchResults.authors.map((author) => (
                        <TouchableOpacity
                          key={author.id}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 12,
                            backgroundColor: '#fff',
                            borderRadius: 12,
                            marginBottom: 8,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.1,
                            shadowRadius: 2,
                            elevation: 2,
                          }}
                          onPress={() => {
                            // Navigate to author books or author detail
                            console.log('[Navigation] Author pressed:', author.id);
                            // TODO: Add author detail screen
                          }}
                        >
                          <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#4ECDC4',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                          }}>
                            <Ionicons name="person" size={20} color="#fff" />
                          </View>
                          <Text style={{ fontSize: 15, fontWeight: '500', color: '#333', flex: 1 }}>
                            {author.name}
                          </Text>
                          <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Categories Results */}
                  {searchResults.categories.length > 0 && (
                    <View style={{ marginBottom: 20, paddingHorizontal: 20 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 }}>
                        Thể loại ({searchResults.categories.length})
                      </Text>
                      {searchResults.categories.map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 12,
                            backgroundColor: '#fff',
                            borderRadius: 12,
                            marginBottom: 8,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.1,
                            shadowRadius: 2,
                            elevation: 2,
                          }}
                          onPress={() => {
                            // Navigate to category books
                            handleViewAllCategory(category.id, category.name);
                            clearSearch(); // Clear search after navigation
                          }}
                        >
                          <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#FF6B9D',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                          }}>
                            <Ionicons name="bookmarks" size={20} color="#fff" />
                          </View>
                          <Text style={{ fontSize: 15, fontWeight: '500', color: '#333', flex: 1 }}>
                            {category.name}
                          </Text>
                          <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ) : searchQuery.trim() && !isSearching && !isTyping ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Ionicons name="search-outline" size={64} color={theme.textTertiary} />
                  <Text style={{ color: theme.textTertiary, marginTop: 10 }}>Không tìm thấy kết quả nào</Text>
                </View>
              ) : null}
            </View>
          )}
          
          {/* Only show categories and books when not searching */}
          {!searchQuery.trim() && (
            <>
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
              {categories.slice(0,5).map((category) => (
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
              {loading && currentCategoryPage === 1 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#4ECDC4" />
                  <Text style={{ color: theme.textSecondary, marginTop: 10 }}>Đang tải sách...</Text>
                </View>
              ) : error ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: theme.error, marginBottom: 10 }}>{error}</Text>
                  <TouchableOpacity onPress={() => {
                    setCurrentCategoryPage(1);
                    const realCategories = categories.filter(c => c.id !== null);
                    fetchAllBooks(realCategories);
                  }}>
                    <Text style={{ color: '#4ECDC4', fontWeight: '600' }}>Thử lại</Text>
                  </TouchableOpacity>
                </View>
              ) : Object.keys(booksByCategory).length === 0 ? (
                <Text style={{ padding: 20, textAlign: 'center', color: theme.textTertiary }}>
                  Không có sách nào
                </Text>
              ) : (
                <>
                  {categories.filter(c => c.id !== null && booksByCategory[c.id]?.length > 0).map((category) => (
                    <View key={category.id} style={styles.section}>
                      <SectionHeader 
                        title={category.name} 
                        onViewAll={() => handleViewAllCategory(category.id, category.name)} 
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
                  
                  {/* Loading More Indicator for All view */}
                  {loadingMore && (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#4ECDC4" />
                      <Text style={{ color: theme.textTertiary, marginTop: 8 }}>Đang tải thêm thể loại...</Text>
                    </View>
                  )}
                  
                  {/* No More Categories */}
                  {/* {!hasMoreCategories && Object.keys(booksByCategory).length > 0 && (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <Text style={{ color: '#999' }}>Đã tải hết các thể loại</Text>
                    </View>
                  )} */}
                </>
              )}
            </>
          ) : (
            // Single category view - Grid layout (vertical)
            <View style={styles.section}>
              <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text }}>
                  {selectedCategoryName}
                </Text>
              </View>
              
              {loading ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#4ECDC4" />
                  <Text style={{ color: theme.textSecondary, marginTop: 10 }}>Đang tải sách...</Text>
                </View>
              ) : error ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: theme.error, marginBottom: 10 }}>{error}</Text>
                  <TouchableOpacity onPress={() => fetchBooksByCategory(1, true)}>
                    <Text style={{ color: '#4ECDC4', fontWeight: '600' }}>Thử lại</Text>
                  </TouchableOpacity>
                </View>
              ) : booksData.length === 0 ? (
                <Text style={{ padding: 20, textAlign: 'center', color: theme.textTertiary }}>
                  Không có sách nào
                </Text>
              ) : (
                <>
                  {/* Grid layout for books */}
                  <View style={styles.booksGrid}>
                    {booksData.map((book) => (
                      <View key={book.id} style={styles.bookGridItem}>
                        <BookCard 
                          {...book} 
                          onPress={() => handleBookPress(book.guid || book.id)} 
                        />
                      </View>
                    ))}
                  </View>
                  
                  {/* Loading More Indicator */}
                  {loadingMore && (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#4ECDC4" />
                      <Text style={{ color: theme.textTertiary, marginTop: 8 }}>Đang tải thêm...</Text>
                    </View>
                  )}
                  
                  {/* No More Books */}
                  {!hasMoreBooks && booksData.length > 0 && (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <Text style={{ color: theme.textTertiary }}> </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          )}

          {/* Padding bottom để tránh bị che bởi tab bar */}
          <View style={{ height: 100 }} />
            </>
          )}
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
  clearButton: {
    padding: 8,
    marginRight: 5,
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
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZONTAL_PADDING,
    justifyContent: 'space-between',
  },
  bookGridItem: {
    width: CARD_WIDTH,
    marginBottom: 20,
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
  modalOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  modalContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 12,
  },
  modalHandle: {
    width: 40,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  modalCloseButton: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 8,
  },
  anchoredDropdown: {
    position: 'absolute',
  minWidth: 160,
  maxWidth: 320,
  paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 14,
    zIndex: 9999,
  },

});