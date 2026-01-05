"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Button,
  Badge,
  NotificationDropdown,
  useNotifications,
} from "@/components/ui";
import { useAuth } from "@/contexts";
import { bookService, cartService, authorService, categoryService } from "@/services";
import type { BookDto, AuthorDto, CategoryDto } from "@/types/dtos";
import { matchVietnameseText } from "@/lib/utils/text";
import { resolveBookPrice, formatPrice } from "@/lib/price";
import { normalizeImageUrl, getBookCoverUrl } from '@/lib/imageUtils';

export function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Search results state
  const [searchResults, setSearchResults] = useState<BookDto[]>([]);
  const [searchCovers, setSearchCovers] = useState<Record<string, string | null>>({});
  const [authorResults, setAuthorResults] = useState<AuthorDto[]>([]);
  const [categoryResults, setCategoryResults] = useState<CategoryDto[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Get auth state from context
  const { user: currentUser, isLoggedIn, logout } = useAuth();

  // Get cart count from API
  const [cartCount, setCartCount] = useState(0);

  // Fetch cart count from API
  useEffect(() => {
    const fetchCartCount = async () => {
      if (isLoggedIn) {
        try {
          const count = await cartService.getCartItemCount();
          setCartCount(count);
        } catch (error) {
          console.error("Failed to fetch cart count:", error);
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    fetchCartCount();
    
    // Poll cart count every 30 seconds when logged in
    const interval = setInterval(() => {
      if (isLoggedIn) {
        fetchCartCount();
      }
    }, 30000);

    // Listen for custom cart update events
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [isLoggedIn]);

  // Get notifications
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, deleteNotification } =
    useNotifications();

  // Debug log notifications
  useEffect(() => {
    if (isLoggedIn) {
      console.log('[Header] Notifications count:', notifications.length);
      console.log('[Header] Unread count:', unreadCount);
      console.log('[Header] Notifications:', notifications);
    }
  }, [notifications, unreadCount, isLoggedIn]);

  // Debounced search effect
  useEffect(() => {
  let cancelled = false;
  const searchAll = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setAuthorResults([]);
        setCategoryResults([]);
        setShowSearchResults(false);
        return;
      }

      setSearchLoading(true);
      try {
        const searchTerm = searchQuery.trim();
        
        // Gọi song song cả 3 API
        const [booksResult, authorsResult, categoriesResult] = await Promise.all([
          bookService.getBooks({
            searchTerm: searchTerm,
            pageSize: 6,
            pageNumber: 1,
          }),
          authorService.getAuthors(1, 10, searchTerm), // Lấy nhiều hơn để filter client-side
          categoryService.getCategories(1, 100), // Lấy hết để filter client-side với Vietnamese matching
        ]);

        // Set books từ API (backend đã xử lý search)
        setSearchResults(booksResult.items || []);
        // Fetch cover URLs for top results to avoid placeholder
        try {
          const tops = (booksResult.items || []).slice(0, 6);
          const coverPromises = tops.map(async (b: any) => ({ id: b.id, cover: await getBookCoverUrl(b.id) }));
          const coverResults = await Promise.all(coverPromises);
          if (!cancelled) {
            const map: Record<string, string | null> = {};
            coverResults.forEach((c) => (map[c.id] = c.cover));
            setSearchCovers(map);
          }
        } catch (e) {
          // ignore
        }
        
        // Filter authors với Vietnamese text matching
        // Backend có thể chưa hỗ trợ tìm không dấu, nên filter thêm ở client
        const filteredAuthors = (authorsResult.items || []).filter((author) =>
          matchVietnameseText(author.name, searchTerm)
        ).slice(0, 4);
        setAuthorResults(filteredAuthors);
        
        // Filter categories với Vietnamese text matching
        const filteredCategories = (categoriesResult.items || []).filter((cat) =>
          matchVietnameseText(cat.name, searchTerm) ||
          (cat.description && matchVietnameseText(cat.description, searchTerm))
        ).slice(0, 4);
        setCategoryResults(filteredCategories);
        
        setShowSearchResults(true);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
        setAuthorResults([]);
        setCategoryResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchAll, 300);
    return () => {
      cancelled = true;
      clearTimeout(debounceTimer);
    };
  }, [searchQuery]);

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/books?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowSearchResults(false);
    }
  };

  const handleBookClick = (bookId: string) => {
    router.push(`/books/${bookId}`);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleAuthorClick = (authorId: string) => {
    router.push(`/books?authorId=${authorId}`);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/books?categoryId=${categoryId}`);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header
      className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 w-full"
      suppressHydrationWarning
    >
      {/* Top Bar */}
      <div className="bg-blue-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Hotline: 1900-1234
              </span>
              <span className="hidden md:flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                support@bookstore.vn
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            {/* --- BẮT ĐẦU PHẦN SỬA --- */}
            {/* Thay thế thẻ div w-10 h-10 cũ chứa svg bằng đoạn này */}
            <div className="relative w-12 h-12">
              {" "}
              <Image
                src="/image/logo.png" // Thay đường dẫn ảnh của bạn vào đây
                alt="BookStore Logo"
                fill // Tự động co giãn theo khung w-12 h-12
                className="object-contain" // Đảm bảo logo không bị méo
                priority // Tải logo ngay lập tức vì nó ở đầu trang
              />
            </div>

            <div className="hidden sm:block">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                BỜ ÚC BÚC
              </h1>
              <p className="text-xs text-gray-500">Đọc sách, mở tương lai</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-2xl mx-6 relative">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0 || authorResults.length > 0 || categoryResults.length > 0) {
                      setShowSearchResults(true);
                    }
                  }}
                  placeholder="Tìm kiếm sách, tác giả, thể loại, ..."
                  className="w-full pl-12 pr-24 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-700 placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-blue-600 rounded-full flex items-center gap-2 hover:bg-blue-700 transition-colors text-white font-medium"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <span className="hidden lg:inline">Tìm</span>
                </button>
              </div>
            </form>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50 max-h-[600px] overflow-y-auto">
                {searchLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2">Đang tìm kiếm...</p>
                  </div>
                ) : (
                  <>
                    {/* Authors Section */}
                    {authorResults.length > 0 && (
                      <div className="border-b border-gray-100">
                        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                          Tác giả
                        </div>
                        {authorResults.map((author) => (
                          <button
                            key={author.id}
                            onClick={() => handleAuthorClick(author.id)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 transition-colors text-left"
                          >
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">{author.name}</p>
                              <p className="text-xs text-gray-500">
                                {author.bookCount} {author.bookCount === 1 ? 'sách' : 'sách'}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Categories Section */}
                    {categoryResults.length > 0 && (
                      <div className="border-b border-gray-100">
                        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                          Thể loại
                        </div>
                        {categoryResults.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-green-50 transition-colors text-left"
                          >
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">{category.name}</p>
                              {category.description && (
                                <p className="text-xs text-gray-500 line-clamp-1">{category.description}</p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Books Section */}
                    {searchResults.length > 0 && (
                      <>
                        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                          Sách
                        </div>
                        {searchResults.map((book) => {
                          const imageUrl = searchCovers[book.id] ?? (normalizeImageUrl(
                            (book as any).coverImage || (book as any).cover || (book as any).imageUrl
                          ) || '/image/anh.png');

                          return (
                            <button
                              key={book.id}
                              onClick={() => handleBookClick(book.id)}
                              className="w-full flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
                            >
                              <div className="relative w-16 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                <Image
                                  src={imageUrl}
                                  alt={book.title}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">
                                  {book.title}
                                </h4>
                                <p className="text-sm text-gray-500 mb-2">
                                  {book.authorNames?.join(", ") || "Chưa cập nhật"}
                                </p>
                                <div className="flex items-center gap-2">
                                  {(() => {
                                    const priceInfo = resolveBookPrice(book);
                                    return (
                                      <>
                                        <span className={`font-bold ${priceInfo.hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>
                                          {formatPrice(priceInfo.finalPrice)}
                                        </span>
                                        {priceInfo.hasDiscount && priceInfo.originalPrice && (
                                          <span className="text-sm text-gray-400 line-through">
                                            {formatPrice(priceInfo.originalPrice)}
                                          </span>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </>
                    )}

                    {/* No results */}
                    {searchResults.length === 0 && authorResults.length === 0 && categoryResults.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-medium">Không tìm thấy kết quả</p>
                        <p className="text-sm mt-1">Hãy thử tìm kiếm với từ khóa khác</p>
                      </div>
                    )}

                    {/* View all results button */}
                    {(searchResults.length > 0 || authorResults.length > 0 || categoryResults.length > 0) && (
                      <button
                        onClick={handleSearch}
                        className="w-full p-4 text-center text-blue-600 hover:bg-blue-50 font-medium transition-colors border-t border-gray-100"
                      >
                        Xem tất cả kết quả
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <Badge
                    variant="danger"
                    className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-xs px-1"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </button>
              {showNotifications && (
                <>
                  {/* Backdrop to close dropdown when clicking outside */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <NotificationDropdown
                    notifications={notifications}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                    onClearAll={clearAll}
                    onDelete={deleteNotification}
                  />
                </>
              )}
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cartCount > 0 && (
                <Badge
                  variant="danger"
                  className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-xs px-1"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </Badge>
              )}
            </Link>

            {/* User Menu or Login */}
            {isLoggedIn && currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {currentUser.userName?.charAt(0).toUpperCase() ||
                        currentUser.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-700">
                    {currentUser.userName || currentUser.email.split("@")[0]}
                  </span>
                  <svg
                    className="hidden lg:block w-4 h-4 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-[80vh] overflow-y-auto">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-lg font-semibold">
                              {currentUser.userName?.charAt(0).toUpperCase() ||
                                currentUser.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {currentUser.userName ||
                                currentUser.email.split("@")[0]}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {currentUser.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Account Menu Items */}
                      <div className="py-1">
                        <Link
                          href="/account/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span>Thông tin cá nhân</span>
                        </Link>

                        <Link
                          href="/account/orders"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                          <span>Đơn hàng</span>
                        </Link>

                        <Link
                          href="/account/wishlist"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          <span>Sách yêu thích</span>
                        </Link>

                        <Link
                          href="/account/library-book"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                          <span>Thư viện sách</span>
                        </Link>

                        <Link
                          href="/account/addresses"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>Địa chỉ giao hàng</span>
                        </Link>

                        <Link
                          href="/account/transaction-histories"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Lịch sử giao dịch</span>
                        </Link>

                        <Link
                          href="/account/customer-support"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                          <span>Hỗ trợ khách hàng</span>
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleLogout();
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push("/login")}
                  className="hidden sm:flex"
                >
                  Đăng nhập
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push("/register")}
                  className="hidden sm:flex"
                >
                  Đăng ký
                </Button>
                <button
                  onClick={() => router.push("/login")}
                  className="sm:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {showMobileMenu ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-6 py-3 border-t border-gray-100">
          <Link
            href="/books"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            Tất cả sách
          </Link>
          <Link
            href="/bestsellers"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            Sách bán chạy
          </Link>
          <Link
            href="/new-arrivals"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            Sách mới
          </Link>
          <Link
            href="/promotions"
            className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
          >
            Khuyến mãi
            <Badge variant="danger" className="text-xs">
              Hot
            </Badge>
          </Link>
          <Link
            href="/authors"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            Tác giả
          </Link>
          <Link
            href="/publishers"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            Nhà xuất bản
          </Link>
          <Link
            href="/literature"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            Văn học
          </Link>
          <Link
            href="/life-skills"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            Kỹ năng sống
          </Link>
          <Link
            href="/economics"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            Kinh tế
          </Link>
        </nav>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          {/* Mobile Search */}
          <div className="px-4 py-3 border-b border-gray-100">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sách..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </form>

            {/* Mobile Search Results */}
            {showSearchResults && searchQuery.trim().length >= 2 && (
              <div className="mt-3 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[400px] overflow-y-auto">
                {searchLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-sm">Đang tìm kiếm...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((book) => (
                      <button
                        key={book.id}
                        onClick={() => {
                          handleBookClick(book.id);
                          setShowMobileMenu(false);
                        }}
                        className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
                      >
                        <div className="relative w-12 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                          {
                                <Image
                                  src={searchCovers[book.id] ?? (normalizeImageUrl((book as any).coverImage || (book as any).cover || (book as any).imageUrl) || '/image/anh.png')}
                                  alt={book.title}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                            {book.title}
                          </h4>
                          <p className="text-xs text-gray-500 mb-1">
                            {book.authorNames?.join(", ") || "Chưa cập nhật"}
                          </p>
                          <div className="flex items-center gap-1.5">
                            {book.discountPrice ? (
                              <>
                                <span className="text-sm font-bold text-red-600">
                                  {(book.discountPrice || 0).toLocaleString("vi-VN")}₫
                                </span>
                                <span className="text-xs text-gray-400 line-through">
                                  {(book.currentPrice || 0).toLocaleString("vi-VN")}₫
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-bold text-gray-900">
                                {(book.currentPrice || 0).toLocaleString("vi-VN")}₫
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        handleSearch({ preventDefault: () => {} } as React.FormEvent);
                        setShowMobileMenu(false);
                      }}
                      className="w-full p-3 text-center text-sm text-blue-600 hover:bg-blue-50 font-medium transition-colors"
                    >
                      Xem tất cả kết quả →
                    </button>
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium">Không tìm thấy kết quả</p>
                    <p className="text-xs mt-1">Thử tìm kiếm với từ khóa khác</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <nav className="py-2">
            <Link
              href="/books"
              className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setShowMobileMenu(false)}
            >
              Tất cả sách
            </Link>
            <Link
              href="/bestsellers"
              className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setShowMobileMenu(false)}
            >
              Sách bán chạy
            </Link>
            <Link
              href="/books?category=new"
              className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setShowMobileMenu(false)}
            >
              Sách mới
            </Link>
            <Link
              href="/books?category=sale"
              className="block px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
              onClick={() => setShowMobileMenu(false)}
            >
              Khuyến mãi
            </Link>

            <Link
              href="/books?category=fiction"
              className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setShowMobileMenu(false)}
            >
              Văn học
            </Link>
            <Link
              href="/books?category=self-help"
              className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setShowMobileMenu(false)}
            >
              Kỹ năng sống
            </Link>
            <Link
              href="/books?category=business"
              className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setShowMobileMenu(false)}
            >
              Kinh tế
            </Link>
            <Link
              href="/authors"
              className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setShowMobileMenu(false)}
            >
              Tác giả
            </Link>
            <Link
              href="/publishers"
              className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setShowMobileMenu(false)}
            >
              Nhà xuất bản
            </Link>
          </nav>

          {/* Mobile Auth Buttons (for non-logged in users) */}
          {!isLoggedIn && (
            <div className="px-4 py-3 border-t border-gray-100 space-y-2 sm:hidden">
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setShowMobileMenu(false);
                  router.push("/login");
                }}
                className="w-full"
              >
                Đăng nhập
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setShowMobileMenu(false);
                  router.push("/register");
                }}
                className="w-full"
              >
                Đăng ký
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
