'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
} from '@/components/ui';
import { addressService } from '@/services/user.service';
import { UserAddressDto, CreateUserAddressDto } from '@/types/dtos';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<UserAddressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // dùng 1 modal cho cả thêm mới và chỉnh sửa
  const [showForm, setShowForm] = useState(false);

  // nếu khác null nghĩa là đang sửa
  const [editingAddress, setEditingAddress] = useState<UserAddressDto | null>(null);

  // state form
  const [formData, setFormData] = useState({
    recipientName: '',
    phoneNumber: '',
    streetAddress: '',
    province: '',
    district: '',
    ward: '',
    isDefault: false,
  });

  // Load addresses from API
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await addressService.getMyAddresses();
      setAddresses(data);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError('Không thể tải danh sách địa chỉ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingAddress(null);
    setFormData({
      recipientName: '',
      phoneNumber: '',
      streetAddress: '',
      province: '',
      district: '',
      ward: '',
      isDefault: false,
    });
    setShowForm(true);
  };

  const openEditForm = (addr: UserAddressDto) => {
    setEditingAddress(addr);
    setFormData({
      recipientName: addr.recipientName,
      phoneNumber: addr.phoneNumber,
      streetAddress: addr.streetAddress,
      province: addr.province,
      district: addr.district,
      ward: addr.ward,
      isDefault: addr.isDefault,
    });
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // đang sửa
      if (editingAddress) {
        await addressService.updateAddress(editingAddress.id, formData);
      } else {
        // thêm mới
        await addressService.createAddress(formData as CreateUserAddressDto);
      }
      
      // Reload addresses
      await fetchAddresses();
      setShowForm(false);
    } catch (err) {
      console.error('Error saving address:', err);
      alert('Không thể lưu địa chỉ. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;

    try {
      await addressService.deleteAddress(id);
      await fetchAddresses();
    } catch (err) {
      console.error('Error deleting address:', err);
      alert('Không thể xóa địa chỉ. Vui lòng thử lại.');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressService.setDefaultAddress(id);
      await fetchAddresses();
    } catch (err) {
      console.error('Error setting default address:', err);
      alert('Không thể đặt địa chỉ mặc định. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sổ địa chỉ</h1>
            <p className="text-gray-600 mt-1">Quản lý địa chỉ giao hàng</p>
          </div>
          <Button onClick={openAddForm} className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 4v16" />
              <path d="M4 12h16" />
            </svg>
            Thêm địa chỉ
          </Button>
        </div>

        {/* Addresses List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        ) : addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <Card
                key={addr.id}
                className="border border-gray-200 hover:shadow-md transition"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Name & Phone */}
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {addr.recipientName}
                        </h3>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-700">{addr.phoneNumber}</span>
                        {addr.isDefault && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1">
                            <svg
                              className="w-3.5 h-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                            Mặc định
                          </Badge>
                        )}
                      </div>

                      {/* Address */}
                      <p className="text-gray-700 mb-1">{addr.streetAddress}</p>
                      <p className="text-gray-500 text-sm">
                        {addr.ward}, {addr.district}, {addr.province}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-blue-600"
                        onClick={() => openEditForm(addr)}
                      >
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(addr.id)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 7h16" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12" />
                          <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
                        </svg>
                      </Button>
                    </div>
                  </div>

                  {/* Set default */}
                  {!addr.isDefault && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        className="px-0 text-blue-600 hover:text-blue-700"
                        onClick={() => handleSetDefault(addr.id)}
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        Đặt làm địa chỉ mặc định
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border border-gray-200">
            <CardContent className="p-12 text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 11.5 12 2l9 9.5" />
                  <path d="M5 12v7a2 2 0 0 0 2 2h3v-5h4v5h3a2 2 0 0 0 2-2v-7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Chưa có địa chỉ nào
                </h3>
                <p className="text-gray-500 mt-1">
                  Thêm địa chỉ giao hàng để đặt hàng nhanh hơn
                </p>
              </div>
              <Button onClick={openAddForm}>Thêm địa chỉ mới</Button>
            </CardContent>
          </Card>
        )}

        {/* Add / Edit Address Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader className="sticky top-0 bg-white z-10 border-b border-gray-200 flex flex-row items-center justify-between">
                <CardTitle>
                  {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAddress(null);
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 6 12 12" />
                    <path d="m6 18 12-12" />
                  </svg>
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <form className="space-y-4" onSubmit={handleFormSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ tên *
                      </label>
                      <input
                        type="text"
                        value={formData.recipientName}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, recipientName: e.target.value }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, phoneNumber: e.target.value }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0901234567"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ *
                    </label>
                    <input
                      type="text"
                      value={formData.streetAddress}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, streetAddress: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Số nhà, tên đường"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tỉnh/Thành phố *
                      </label>
                      <select
                        value={formData.province}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, province: e.target.value }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Chọn Tỉnh/TP</option>
                        <option>TP. Hồ Chí Minh</option>
                        <option>Hà Nội</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quận/Huyện *
                      </label>
                      <select
                        value={formData.district}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            district: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Chọn Quận/Huyện</option>
                        <option>Quận 1</option>
                        <option>Quận 2</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phường/Xã *
                      </label>
                      <select
                        value={formData.ward}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, ward: e.target.value }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Chọn Phường/Xã</option>
                        <option>Phường Bến Nghé</option>
                        <option>Phường Bến Thành</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          isDefault: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Đặt làm địa chỉ mặc định
                    </span>
                  </label>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingAddress(null);
                      }}
                    >
                      Hủy
                    </Button>
                    <Button className="flex-1" type="submit">
                      {editingAddress ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
