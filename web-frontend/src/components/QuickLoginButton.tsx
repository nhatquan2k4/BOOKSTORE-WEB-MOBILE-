// Quick Login Button - For Development/Testing
'use client';

// Đã xóa import gây lỗi: import { loginWithMockAccount, isMockAccountActive } from '@/lib/mock-auth';
import { useEffect, useState } from 'react';

// --- Thêm đoạn này để thay thế file thiếu ---
const loginWithMockAccount = async () => {
  console.log("Mock login feature is currently disabled during build.");
  alert("Tính năng đăng nhập nhanh đang tắt.");
};

const isMockAccountActive = () => {
  return false; // Mặc định là chưa đăng nhập
};
// -------------------------------------------

export function QuickLoginButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isMockAccountActive());
  }, []);

  if (isLoggedIn) {
    return null; // Don't show button if already logged in
  }

  return (
    <button
      onClick={loginWithMockAccount}
      className="fixed bottom-4 right-4 z-50 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all font-medium flex items-center gap-2"
      title="Click to login with demo account"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>
      Quick Login (Demo)
    </button>
  );
}