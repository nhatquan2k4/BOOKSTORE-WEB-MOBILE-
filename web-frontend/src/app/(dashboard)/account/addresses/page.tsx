'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
} from '@/components/ui';

interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

const mockAddresses: Address[] = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '123 Đường Nguyễn Huệ',
    ward: 'Phường Bến Nghé',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    isDefault: true,
  },
  {
    id: 2,
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '456 Đường Lê Lợi',
    ward: 'Phường Bến Thành',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    isDefault: false,
  },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);

  // dùng 1 modal cho cả thêm mới và chỉnh sửa
  const [showForm, setShowForm] = useState(false);

  // nếu khác null nghĩa là đang sửa
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // state form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    isDefault: false,
  });

  const openAddForm = () => {
    setEditingAddress(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
      city: '',
      district: '',
      ward: '',
      isDefault: false,
    });
    setShowForm(true);
  };

  const openEditForm = (addr: Address) => {
    setEditingAddress(addr);
    setFormData({
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      district: addr.district,
      ward: addr.ward,
      isDefault: addr.isDefault,
    });
    setShowForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // đang sửa
    if (editingAddress) {
      setAddresses((prev) => {
        let next = prev.map((addr) =>
          addr.id === editingAddress.id
            ? {
                ...addr,
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                district: formData.district,
                ward: formData.ward,
                isDefault: formData.isDefault,
              }
            : addr
        );

        // nếu đang tick mặc định thì bỏ mặc định ở cái khác
        if (formData.isDefault) {
          next = next.map((addr) => ({
            ...addr,
            isDefault: addr.id === editingAddress.id,
          }));
        }

        return next;
      });
    } else {
      // thêm mới
      const newId =
        addresses.length > 0
          ? Math.max(...addresses.map((a) => a.id)) + 1
          : 1;

      let next = [
        ...addresses,
        {
          id: newId,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          ward: formData.ward,
          isDefault: formData.isDefault,
        },
      ];

      // nếu cái mới là mặc định thì bỏ mặc định ở cái khác
      if (formData.isDefault) {
        next = next.map((addr) => ({
          ...addr,
          isDefault: addr.id === newId,
        }));
      }

      setAddresses(next);
    }

    setShowForm(false);
    setEditingAddress(null);
  };

  const setAsDefault = (id: number) => {
    setAddresses((prev) =>
      prev.map((addr) => ({ ...addr, isDefault: addr.id === id }))
    );
  };

  const deleteAddress = (id: number) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
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
        {addresses.length > 0 ? (
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
                          {addr.name}
                        </h3>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-700">{addr.phone}</span>
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
                      <p className="text-gray-700 mb-1">{addr.address}</p>
                      <p className="text-gray-500 text-sm">
                        {addr.ward}, {addr.district}, {addr.city}
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
                        onClick={() => deleteAddress(addr.id)}
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
                        onClick={() => setAsDefault(addr.id)}
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
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, name: e.target.value }))
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
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, phone: e.target.value }))
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
                      value={formData.address}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, address: e.target.value }))
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
                        value={formData.city}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, city: e.target.value }))
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
