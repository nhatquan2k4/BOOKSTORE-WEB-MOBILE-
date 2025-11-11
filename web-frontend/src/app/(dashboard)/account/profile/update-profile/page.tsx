'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/identity/auth';

interface ProfileFormValues {
  userName: string;
  phoneNumber: string;
  avatarUrl: string; // sẽ điền sau khi upload xong
}

export default function UpdateProfilePage() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<ProfileFormValues>({
    userName: '',
    phoneNumber: '',
    avatarUrl: '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // chặn người chưa login
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoading, isLoggedIn, router]);

  // load profile ban đầu
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // nếu context đã có đủ thì dùng luôn
        if (user) {
          setForm({
            userName: user.userName || '',
            phoneNumber: (user as any).phoneNumber || '',
            avatarUrl: (user as any).avatarUrl || '',
          });
          setAvatarPreview((user as any).avatarUrl || null);
        } else {
          // nếu muốn chắc chắn thì gọi API
          const res = await authApi.getProfile();
          setForm({
            userName: res.userName || '',
            phoneNumber: res.phoneNumber || '',
            avatarUrl: res.avatarUrl || '',
          });
          setAvatarPreview(res.avatarUrl || null);
        }
      } catch (err: any) {
        setLoadError('Không thể tải thông tin tài khoản.');
      }
    };
    loadProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // chọn ảnh từ máy
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);

    // tạo preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);

    try {
      let avatarUrl = form.avatarUrl;

      // nếu user có chọn file mới → upload trước
      if (avatarFile) {
        const fd = new FormData();
        fd.append('file', avatarFile);

        // đổi tên hàm này theo backend của bạn
        const uploadRes = await authApi.uploadAvatar(fd);
        // giả sử backend trả { url: '...' }
        avatarUrl = uploadRes.url;
      }

      const payload = {
        userName: form.userName,
        phoneNumber: form.phoneNumber,
        avatarUrl: avatarUrl,
      };

      const res = await authApi.updateProfile(payload);

      if (res.success) {
        setSaveMessage({
          type: 'success',
          text: 'Cập nhật thông tin thành công!',
        });
        // nếu muốn quay lại luôn:
        // router.push('/account/profile');
      } else {
        setSaveMessage({
          type: 'error',
          text: res.message || 'Cập nhật thất bại, vui lòng thử lại.',
        });
      }
    } catch (err: any) {
      setSaveMessage({
        type: 'error',
        text:
          err?.response?.data?.message ||
          'Có lỗi xảy ra khi cập nhật.',
      });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (!isLoggedIn) return null;

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
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Quay lại
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {loadError ? (
            <div className="p-3 mb-4 bg-red-100 border border-red-200 text-red-700 text-sm rounded">
              {loadError}
            </div>
          ) : null}

          {saveMessage ? (
            <div
              className={`p-3 mb-4 text-sm rounded ${
                saveMessage.type === 'success'
                  ? 'bg-green-100 border border-green-200 text-green-800'
                  : 'bg-red-100 border border-red-200 text-red-800'
              }`}
            >
              {saveMessage.text}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ảnh đại diện
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-10 h-10 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z" />
                      <path d="M12 22c4.2-1.8 7-5.2 7-9a7 7 0 1 0-14 0c0 3.8 2.8 7.2 7 9Z" />
                    </svg>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="avatarFile"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded-lg cursor-pointer"
                  >
                    Chọn ảnh
                  </label>
                  <input
                    id="avatarFile"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, tối đa 2MB
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="userName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tên hiển thị
              </label>
              <input
                id="userName"
                name="userName"
                value={form.userName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ví dụ: Nguyễn Văn A"
              />
            </div>

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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="090xxxxxxx"
              />
            </div>

            {/* nếu bạn vẫn muốn cho sửa bằng URL thì để lại field này, không thì xoá */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avatar URL (tùy chọn)
              </label>
              <input
                name="avatarUrl"
                value={form.avatarUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div> */}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-sm"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
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
