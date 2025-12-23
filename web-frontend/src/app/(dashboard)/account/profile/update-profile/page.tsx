'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { userProfileService } from '@/services/user-profile.service';
import { UserProfile, UpdateUserProfileDto } from '@/types/dtos/userprofile';

// 1. THÊM CẤU HÌNH DOMAIN BACKEND (Giống bên ProfilePage)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5276'; 

interface ProfileFormValues {
  fullName: string;
  phoneNumber: string;
  avatarUrl: string;
}

export default function UpdateProfilePage() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<ProfileFormValues>({
    fullName: '',
    phoneNumber: '',
    avatarUrl: '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // 2. THÊM HÀM XỬ LÝ URL ẢNH (Logic đồng nhất)
  const getFullAvatarUrl = (url?: string) => {
    if (!url) return null;
    // Nếu là 'blob:...' (ảnh vừa chọn từ máy) hoặc 'http...' (ảnh tuyệt đối) thì giữ nguyên
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    // Nếu là đường dẫn tương đối, nối domain backend vào
    return `${API_BASE_URL}${url}`;
  };

  // Chặn người chưa login
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoading, isLoggedIn, router]);

  // Load profile từ API
  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await userProfileService.getMyProfile();
        if (res.success && res.data) {
          const data = res.data as UserProfile;
          setForm({
            fullName: data.fullName || '',
            phoneNumber: data.phoneNumber || '',
            avatarUrl: data.avatarUrl || '',
          });
          
          // 3. SỬ DỤNG HÀM XỬ LÝ URL KHI SET PREVIEW
          // Để hiển thị đúng ảnh cũ đang có trong DB
          setAvatarPreview(getFullAvatarUrl(data.avatarUrl) || null);
        }
      } catch (err) {
        setLoadError('Không thể tải thông tin tài khoản.');
      } finally {
        setLoadingData(false);
      }
    };
    loadProfile();
  }, [isLoggedIn]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Chọn ảnh từ máy
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);

    // Tạo preview (Dạng blob:http://localhost:3000/...)
    // Hàm getFullAvatarUrl ở trên đã có logic bỏ qua nếu gặp 'blob:' nên không lo bị lỗi
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);

    try {
      let currentAvatarUrl = form.avatarUrl;

      // Bước 1: Upload ảnh mới (nếu có)
      if (avatarFile) {
        const uploadRes = await userProfileService.uploadAvatar(avatarFile);
        if (uploadRes.success && uploadRes.avatarUrl) {
          currentAvatarUrl = uploadRes.avatarUrl;
        } else {
          throw new Error(uploadRes.message || 'Lỗi khi upload ảnh');
        }
      }

      // Bước 2: Cập nhật thông tin
      const payload: UpdateUserProfileDto = {
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        avatarUrl: currentAvatarUrl,
      };

      const res = await userProfileService.updateMyProfile(payload);

      if (res.success) {
        setSaveMessage({
          type: 'success',
          text: 'Cập nhật thông tin thành công!',
        });
        setTimeout(() => {
           window.location.reload(); 
        }, 1000);
      } else {
        throw new Error(res.message || 'Cập nhật thất bại');
      }

    } catch (err: any) {
      setSaveMessage({
        type: 'error',
        text: err.message || 'Có lỗi xảy ra khi cập nhật.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  // Lấy chữ cái đầu cho avatar mặc định
  const initialChar = form.fullName ? form.fullName.charAt(0).toUpperCase() : '?';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Cập nhật thông tin
            </h1>
            <p className="text-gray-600 mt-1">
              Thay đổi thông tin hiển thị của tài khoản
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-sm flex items-center gap-2"
          >
            Quay lại
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {loadError && (
            <div className="p-3 mb-4 bg-red-100 border border-red-200 text-red-700 text-sm rounded">
              {loadError}
            </div>
          )}

          {saveMessage && (
            <div
              className={`p-3 mb-4 text-sm rounded ${
                saveMessage.type === 'success'
                  ? 'bg-green-100 border border-green-200 text-green-800'
                  : 'bg-red-100 border border-red-200 text-red-800'
              }`}
            >
              {saveMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ảnh đại diện
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="avatar preview"
                      className="w-full h-full object-cover"
                      // Thêm fallback nếu ảnh lỗi
                      onError={(e) => {
                         (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${form.fullName}&background=random`;
                      }}
                    />
                  ) : (
                    <span className="text-gray-400 text-2xl font-bold">
                       {initialChar}
                    </span>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="avatarFile"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-sm font-medium rounded-lg cursor-pointer shadow-sm"
                  >
                    Chọn ảnh mới
                  </label>
                  <input
                    id="avatarFile"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG hoặc GIF. Tối đa 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Họ và tên
              </label>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Ví dụ: Nguyễn Văn A"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Số điện thoại
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="090xxxxxxx"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium shadow-sm"
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}