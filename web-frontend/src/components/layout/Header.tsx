'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Badge, NotificationDropdown, useNotifications } from '@/components/ui';
import { useCartStore } from '@/store/cartStore';

interface HeaderProps {
  isLoggedIn?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function Header({ isLoggedIn = false, user }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Get cart count from store
  const cartItems = useCartStore((state) => state.cartItems);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Get notifications
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/books?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-blue-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Hotline: 1900-1234
              </span>
              <span className="hidden md:flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@bookstore.vn
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/help" className="hover:text-blue-200 transition-colors">
                Trợ giúp
              </Link>
              <span className="hidden md:inline">|</span>
              <Link href="/track-order" className="hidden md:inline hover:text-blue-200 transition-colors">
                Tra cứu đơn hàng
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">BookStore</h1>
              <p className="text-xs text-gray-500">Đọc sách, mở tương lai</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-6">
            <div className="relative w-full">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sách, tác giả, ISBN..."
                className="w-full pl-12 pr-24 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-700 placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-blue-600 rounded-full flex items-center gap-2 hover:bg-blue-700 transition-colors text-white font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.3-4.3"/>
                </svg>
                <span className="hidden lg:inline">Tìm</span>
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <Badge variant="danger" className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-xs px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
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
                  />
                </>
              )}
            </div>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <Badge variant="danger" className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-xs px-1">
                  {cartCount > 99 ? '99+' : cartCount}
                </Badge>
              )}
            </Link>

            {/* User Menu or Login */}
            {isLoggedIn && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="hidden lg:block text-sm font-medium text-gray-700">{user.name}</span>
                  <svg className="hidden lg:block w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/account/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Tài khoản của tôi
                      </Link>
                      <Link
                        href="/account/orders"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Đơn hàng của tôi
                      </Link>
                      <Link
                        href="/account/wishlist"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Sách yêu thích
                      </Link>
                      <div className="border-t border-gray-100 my-2" />
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push('/login')}
                  className="hidden sm:flex"
                >
                  Đăng nhập
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/register')}
                  className="hidden sm:flex"
                >
                  Đăng ký
                </Button>
                <button
                  onClick={() => router.push('/login')}
                  className="sm:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-8 py-3 border-t border-gray-100">
          <Link href="/books" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            Tất cả sách
          </Link>
          <Link href="/books?category=bestseller" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            Sách bán chạy
          </Link>
          <Link href="/books?category=new" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            Sách mới
          </Link>
          <Link href="/books?category=sale" className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-1">
            Khuyến mãi
            <Badge variant="danger" className="text-xs">Hot</Badge>
          </Link>
          <Link href="/books?category=fiction" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            Văn học
          </Link>
          <Link href="/books?category=self-help" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            Kỹ năng sống
          </Link>
          <Link href="/books?category=business" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
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
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
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
              href="/books?category=bestseller"
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
              Khuyến mãi 🔥
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
          </nav>

          {/* Mobile Auth Buttons (for non-logged in users) */}
          {!isLoggedIn && (
            <div className="px-4 py-3 border-t border-gray-100 space-y-2 sm:hidden">
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setShowMobileMenu(false);
                  router.push('/login');
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
                  router.push('/register');
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
