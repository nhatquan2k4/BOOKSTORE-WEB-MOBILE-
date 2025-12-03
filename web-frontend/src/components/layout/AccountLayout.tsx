"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { ReactNode, useMemo, useState, useEffect } from "react";

interface AccountLayoutProps {
  children: ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  // kiểm tra đang ở trang orders hay trang con
  const isInOrders = useMemo(() => {
    return (
      pathname === "/account/orders" || pathname?.startsWith("/account/orders/")
    );
  }, [pathname]);

  // state để mở/đóng submenu đơn hàng
  const [ordersOpen, setOrdersOpen] = useState(isInOrders);

  // nếu đổi route sang đơn hàng thì tự mở
  useEffect(() => {
    if (isInOrders) {
      setOrdersOpen(true);
    }
  }, [isInOrders]);

  const go = (path: string) => {
    router.push(path);
  };

  const isActive = (path: string) => pathname === path;
  const isActiveOrders = (path?: string) => {
    if (!path) return false;
    return pathname === path || pathname?.startsWith("/account/orders/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-4">
              {/* User Info */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {user?.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name || "User"}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <svg
                        className="w-full h-full text-gray-400 p-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.name || "Người dùng"}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="py-2">
                {/* Thông tin cá nhân */}
                <button
                  onClick={() => go("/account/profile")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    isActive("/account/profile")
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  <span
                    className={
                      isActive("/account/profile")
                        ? "text-blue-600"
                        : "text-gray-500"
                    }
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </span>
                  <span>Thông tin cá nhân</span>
                </button>

                {/* Đơn hàng */}
                <button
                  onClick={() => {
                    if (!isInOrders) {
                      go("/account/orders");
                    } else {
                      setOrdersOpen((p) => !p);
                    }
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors ${
                    isActiveOrders("/account/orders")
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={
                        isActiveOrders("/account/orders")
                          ? "text-blue-600"
                          : "text-gray-500"
                      }
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    </span>
                    <span>Đơn hàng</span>
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      ordersOpen ? "rotate-90" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </button>

                {/* Submenu đơn hàng */}
                {ordersOpen && (
                  <div className="pl-10 pr-2 pb-2 space-y-1">
                    <button
                      onClick={() => go("/account/orders/physical")}
                      className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md ${
                        isActive("/account/orders/physical")
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      <span>Sách giấy</span>
                    </button>
                    <button
                      onClick={() => go("/account/orders/digital")}
                      className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md ${
                        isActive("/account/orders/digital")
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 17 9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"
                        />
                      </svg>
                      <span>e-Book</span>
                    </button>
                  </div>
                )}

                {/* Danh sách yêu thích */}
                <button
                  onClick={() => go("/account/wishlist")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    isActive("/account/wishlist")
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  <span
                    className={
                      isActive("/account/wishlist")
                        ? "text-blue-600"
                        : "text-gray-500"
                    }
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0Z"
                      />
                    </svg>
                  </span>
                  <span>Sách yêu thích</span>
                </button>

                {/* Thư viện sách */}
                <button
                  onClick={() => go("/account/library-book")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    isActive("/account/library-book")
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  <span
                    className={
                      isActive("/account/library-book")
                        ? "text-blue-600"
                        : "text-gray-500"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-book-open"
                    >
                      <path d="M12 7v14" />
                      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                    </svg>
                  </span>
                  <span>Thư viện sách</span>
                </button>

                {/* Địa chỉ nhận hàng */}
                <button
                  onClick={() => go("/account/addresses")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    isActive("/account/addresses")
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  <span
                    className={
                      isActive("/account/addresses")
                        ? "text-blue-600"
                        : "text-gray-500"
                    }
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m17.657 16.657-4.243 4.243a2 2 0 0 1-2.828 0l-4.243-4.243a8 8 0 1 1 11.314 0Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  </span>
                  <span>Địa chỉ nhận hàng</span>
                </button>

                <button
                  onClick={() => go("/account/notifications")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    isActive("/account/notifications")
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  <span
                    className={
                      isActive("/account/notifications")
                        ? "text-blue-600"
                        : "text-gray-500"
                    }
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-5-5.917V5a1 1 0 1 0-2 0v.083A6 6 0 0 0 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 1 1-6 0h6z"
                      />
                    </svg>
                  </span>
                  <span>Thông báo</span>
                </button>

                {/* Lịch sử giao dịch */}
                <button
                  onClick={() => go("/account/transaction-histories")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    isActive("/account/transaction-histories")
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  <span
                    className={
                      isActive("/account/transaction-histories")
                        ? "text-blue-600"
                        : "text-gray-500"
                    }
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </span>
                  <span>Lịch sử giao dịch</span>
                </button>

                {/* Thành tích */}
                <button
                  onClick={() => go("/account/achievements")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    isActive("/account/achievements")
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  <span
                    className={
                      isActive("/account/achievements")
                        ? "text-blue-600"
                        : "text-gray-500"
                    }
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m9 12 2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138Z"
                      />
                    </svg>
                  </span>
                  <span>Thành tích</span>
                </button>

                {/* Hỗ trợ khách hàng */}
                <button
                  onClick={() => go("/account/customer-support")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    isActive("/account/customer-support")
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  <span
                    className={
                      isActive("/account/customer-support")
                        ? "text-blue-600"
                        : "text-gray-500"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-phone-call"
                    >
                      <path d="M13 2a9 9 0 0 1 9 9" />
                      <path d="M13 6a5 5 0 0 1 5 5" />
                      <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
                    </svg>
                  </span>
                  <span>Hỗ trợ khách hàng</span>
                </button>

                {/* Logout */}
                <div className="mt-4 pt-4 border-t border-gray-200 px-4 pb-4">
                  <button
                    onClick={() => {
                      router.push("/");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1"
                      />
                    </svg>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
