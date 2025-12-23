'use client';

import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { authService } from '@/services';
import { userProfileService } from '@/services/user-profile.service';
import { UserProfile } from '@/types/dtos/userprofile';

// --- CẤU HÌNH ĐƯỜNG DẪN BACKEND ---
// Hãy thay đổi port này đúng với port Backend của bạn (ví dụ 5276, 5000, 7123...)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5276'; 

export default function ProfilePage() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isActiveLocal, setIsActiveLocal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string; } | null>(null);

  // 1. Check Login & Sync IsActive
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
    if (user) {
      setIsActiveLocal(user.isActive);
    }
  }, [isLoading, isLoggedIn, router, user]);

  // 2. Fetch Profile Data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (isLoggedIn) {
        try {
          const res = await userProfileService.getMyProfile();
          if (res.success) {
            setProfile(res.data as UserProfile);
          }
        } catch (error) {
          console.error("Failed to fetch profile", error);
        }
      }
    };
    fetchProfileData();
  }, [isLoggedIn]);

  // 3. Check Email Status
  const checkEmailStatus = useCallback(async () => {
    if (!user?.id || isActiveLocal) return;

    try {
      const res = await authService.checkVerificationStatus(user.id);
      if (res.success && res.data?.isVerified) {
        setIsActiveLocal(true);
        setEmailMessage({
          type: 'success',
          text: 'Xác thực thành công! Tài khoản đã được kích hoạt.',
        });
        setTimeout(() => setEmailMessage(null), 5000);
      }
    } catch (error) {
      // Ignore
    }
  }, [user?.id, isActiveLocal]);

  // 4. Polling
  useEffect(() => {
    if (isLoggedIn && !isActiveLocal) {
      const onFocus = () => checkEmailStatus();
      window.addEventListener('focus', onFocus);
      const intervalId = setInterval(checkEmailStatus, 3000);
      return () => {
        window.removeEventListener('focus', onFocus);
        clearInterval(intervalId);
      };
    }
  }, [isLoggedIn, isActiveLocal, checkEmailStatus]);

  // Handle gửi email
  const handleResendVerificationEmail = async () => {
    if (!user?.email) return;
    try {
      setSendingEmail(true);
      setEmailMessage(null);
      const response = await authService.resendVerificationEmail(user.email);

      if (response.success) {
        setEmailMessage({ type: 'success', text: 'Email xác minh đã được gửi!' });
      } else {
        setEmailMessage({ type: 'error', text: response.message || 'Không thể gửi email.' });
      }
    } catch (error: any) {
      setEmailMessage({ type: 'error', text: error?.response?.data?.message || 'Lỗi khi gửi email.' });
    } finally {
      setSendingEmail(false);
      setTimeout(() => setEmailMessage(null), 8000);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  if (!user) return null;

  // --- LOGIC XỬ LÝ ẢNH (QUAN TRỌNG) ---
  const getFullAvatarUrl = (url?: string) => {
    if (!url) return null;
    // Nếu URL đã là tuyệt đối (http...) thì giữ nguyên (ví dụ ảnh Google)
    if (url.startsWith('http')) return url;
    // Nếu là đường dẫn tương đối (/uploads/...), nối thêm domain backend vào
    return `${API_BASE_URL}${url}`;
  };

  // Lấy URL thô từ API hoặc Context
  const rawAvatarUrl = profile?.avatarUrl || (user as any).avatarUrl;
  // Xử lý thành URL đầy đủ
  const displayAvatar = getFullAvatarUrl(rawAvatarUrl);
  
  const displayName = profile?.fullName || user.userName || user.email.split('@')[0];
  const initialChar = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tài khoản của tôi</h1>
          <p className="mt-2 text-gray-600">Quản lý thông tin cá nhân và cài đặt tài khoản</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              {displayAvatar ? (
                <img 
                  src={displayAvatar} 
                  alt="avatar" 
                  className="w-24 h-24 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    // Fallback nếu ảnh lỗi link
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${displayName}&background=random`;
                  }}
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">{initialChar}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-semibold text-gray-900 truncate">{displayName}</h2>
              <p className="text-gray-600 mt-1">{user.email}</p>
              {user.roles && user.roles.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {user.roles.map((role: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">{role}</span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Link href="/account/profile/update-profile" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Chỉnh sửa
              </Link>
            </div>
          </div>
        </div>

        {/* Email Verification Banner */}
        {!isActiveLocal && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Email chưa được xác minh</h3>
                <p className="text-yellow-700 mb-4">Vui lòng xác minh email của bạn để đảm bảo tài khoản được bảo mật.</p>
                {emailMessage && (
                  <div className={`mb-4 p-3 rounded-lg ${emailMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                    {emailMessage.text}
                  </div>
                )}
                <div className="flex items-center gap-4 flex-wrap">
                  <button onClick={handleResendVerificationEmail} disabled={sendingEmail} className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:bg-yellow-400 disabled:cursor-not-allowed flex items-center gap-2">
                    {sendingEmail ? 'Đang gửi...' : 'Gửi lại email xác minh'}
                  </button>
                  <button onClick={checkEmailStatus} className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline decoration-dotted">
                    Kiểm tra ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài khoản</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Email</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{user.email}</span>
                {isActiveLocal ? (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded transition-colors duration-300">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 1 0-8-8 8.009 8.009 0 0 0 8 8Zm3.707-9.707-4 4a1 1 0 0 1-1.414 0l-2-2A1 1 0 1 1 7.707 9.293L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" clipRule="evenodd" /></svg>
                    Đã xác minh
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded transition-colors duration-300">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92ZM11 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1-5a1 1 0 0 0-1 1v3a1 1 0 1 0 2 0V9a1 1 0 0 0-1-1Z" clipRule="evenodd" /></svg>
                    Chưa xác minh
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Trạng thái</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${isActiveLocal ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isActiveLocal ? 'Đang hoạt động' : 'Tạm khóa'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}