"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
} from "@/components/ui";
import { addressService } from "@/services/user.service";
import { UserAddressDto, CreateUserAddressDto } from "@/types/dtos";

// Interface cho API Địa chính
interface Province {
  code: number;
  name: string;
}
interface District {
  code: number;
  name: string;
  province_code: number;
}
interface Ward {
  code: number;
  name: string;
  district_code: number;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<UserAddressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- States cho Form Địa chính ---
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // State lưu mã (code) để lọc danh sách con
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | string>("");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | string>("");
  const [selectedWardCode, setSelectedWardCode] = useState<number | string>("");

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddressDto | null>(null);

  const [formData, setFormData] = useState({
    recipientName: "",
    phoneNumber: "",
    streetAddress: "",
    province: "",
    district: "",
    ward: "",
    isDefault: false,
  });

  // 1. Load addresses & Provinces khi mount
  useEffect(() => {
    fetchAddresses();
    fetchProvinces();
  }, []);

  // 2. Fetch danh sách Tỉnh/Thành
  const fetchProvinces = async () => {
    try {
      const res = await fetch("https://esgoo.net/api-tinhthanh/1/0.htm");
      const data = await res.json();
      if (data.error === 0) setProvinces(data.data);
    } catch (err) {
      console.error("Lỗi tải tỉnh thành:", err);
    }
  };

  // 3. Tự động load Quận/Huyện khi chọn Tỉnh (dựa vào selectedProvinceCode)
  useEffect(() => {
    if (!selectedProvinceCode) {
      setDistricts([]);
      return;
    }
    fetch(`https://esgoo.net/api-tinhthanh/2/${selectedProvinceCode}.htm`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error === 0) setDistricts(data.data);
      })
      .catch(console.error);
  }, [selectedProvinceCode]);

  // 4. Tự động load Phường/Xã khi chọn Quận (dựa vào selectedDistrictCode)
  useEffect(() => {
    if (!selectedDistrictCode) {
      setWards([]);
      return;
    }
    fetch(`https://esgoo.net/api-tinhthanh/3/${selectedDistrictCode}.htm`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error === 0) setWards(data.data);
      })
      .catch(console.error);
  }, [selectedDistrictCode]);

  // --- Logic Sync ngược lại khi mở form Edit (Tên -> Code) ---
  // Khi mở form Edit, ta chỉ có Tên (String), cần tìm lại Code (Number) để set vào Select box
  useEffect(() => {
    if (editingAddress && provinces.length > 0) {
        const p = provinces.find(p => p.name === editingAddress.province);
        if (p) setSelectedProvinceCode(p.code);
    }
  }, [editingAddress, provinces]);

  useEffect(() => {
    if (editingAddress && districts.length > 0 && selectedProvinceCode) {
        const d = districts.find(d => d.name === editingAddress.district);
        if (d) setSelectedDistrictCode(d.code);
    }
  }, [editingAddress, districts, selectedProvinceCode]);

  useEffect(() => {
    if (editingAddress && wards.length > 0 && selectedDistrictCode) {
        const w = wards.find(w => w.name === editingAddress.ward);
        if (w) setSelectedWardCode(w.code);
    }
  }, [editingAddress, wards, selectedDistrictCode]);


  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await addressService.getMyAddresses();
      setAddresses(data);
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError("Không thể tải danh sách địa chỉ.");
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers (SỬA LẠI CHUẨN: Lấy cả Value và Text từ Option) ---
  
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = Number(e.target.value);
    const name = e.target.options[e.target.selectedIndex].text;
    
    setSelectedProvinceCode(code);
    setSelectedDistrictCode(""); // Reset quận
    setSelectedWardCode("");     // Reset phường
    
    setFormData(prev => ({ 
      ...prev, 
      province: name, 
      district: "", 
      ward: "" 
    }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = Number(e.target.value);
    const name = e.target.options[e.target.selectedIndex].text;

    setSelectedDistrictCode(code);
    setSelectedWardCode(""); // Reset phường

    setFormData(prev => ({ 
      ...prev, 
      district: name, 
      ward: "" 
    }));
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = Number(e.target.value);
    const name = e.target.options[e.target.selectedIndex].text;
    
    setSelectedWardCode(code);
    setFormData(prev => ({ ...prev, ward: name }));
  };

  const openAddForm = () => {
    setEditingAddress(null);
    setFormData({
      recipientName: "",
      phoneNumber: "",
      streetAddress: "",
      province: "",
      district: "",
      ward: "",
      isDefault: false,
    });
    // Reset selection states
    setSelectedProvinceCode("");
    setSelectedDistrictCode("");
    setSelectedWardCode("");
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
    // Các useEffect ở trên sẽ tự động điền selectedCode dựa vào tên trong formData
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await addressService.updateAddress(editingAddress.id, formData);
      } else {
        await addressService.createAddress(formData as CreateUserAddressDto);
      }
      setShowForm(false);
      await fetchAddresses();
    } catch (err) {
      console.error("Error saving address:", err);
      alert("Không thể lưu địa chỉ. Vui lòng kiểm tra lại.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    try {
      await addressService.deleteAddress(id);
      await fetchAddresses();
    } catch (err) {
      alert("Không thể xóa địa chỉ.");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressService.setDefaultAddress(id);
      await fetchAddresses();
    } catch (err) {
      alert("Không thể đặt mặc định.");
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
            Thêm địa chỉ
          </Button>
        </div>

        {/* List Addresses */}
        {loading ? (
          <div className="p-10 text-center">Đang tải...</div>
        ) : addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <Card key={addr.id} className="hover:shadow-md transition">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">{addr.recipientName}</h3>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-700">{addr.phoneNumber}</span>
                        {addr.isDefault && <Badge className="bg-green-100 text-green-700">Mặc định</Badge>}
                      </div>
                      <p className="text-gray-600">{addr.streetAddress}</p>
                      <p className="text-sm text-gray-500">{addr.ward}, {addr.district}, {addr.province}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditForm(addr)}>Sửa</Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(addr.id)}>Xóa</Button>
                    </div>
                  </div>
                  {!addr.isDefault && (
                    <Button variant="link" className="p-0 h-auto mt-2 text-sm" onClick={() => handleSetDefault(addr.id)}>
                      Đặt làm mặc định
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-lg border">Chưa có địa chỉ nào.</div>
        )}

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="border-b flex flex-row justify-between items-center sticky top-0 bg-white z-10">
                <CardTitle>{editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>✕</Button>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Họ tên *</label>
                      <input
                        className="w-full border rounded p-2"
                        required
                        value={formData.recipientName}
                        onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Số điện thoại *</label>
                      <input
                        className="w-full border rounded p-2"
                        required
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Địa chỉ hành chính */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Tỉnh / Thành */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Tỉnh/Thành phố *</label>
                      <select
                        className="w-full border rounded p-2"
                        required
                        onChange={handleProvinceChange}
                        value={selectedProvinceCode}
                      >
                        <option value="">Chọn Tỉnh/TP</option>
                        {provinces.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quận / Huyện */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Quận/Huyện *</label>
                      <select
                        className="w-full border rounded p-2"
                        required
                        onChange={handleDistrictChange}
                        disabled={!selectedProvinceCode}
                        value={selectedDistrictCode}
                      >
                        <option value="">Chọn Quận/Huyện</option>
                        {districts.map((d) => (
                          <option key={d.code} value={d.code}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Phường / Xã */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Phường/Xã *</label>
                      <select
                        className="w-full border rounded p-2"
                        required
                        onChange={handleWardChange}
                        disabled={!selectedDistrictCode}
                        value={selectedWardCode}
                      >
                        <option value="">Chọn Phường/Xã</option>
                        {wards.map((w) => (
                          <option key={w.code} value={w.code}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Địa chỉ cụ thể *</label>
                    <input
                      className="w-full border rounded p-2"
                      required
                      placeholder="Số nhà, tên đường..."
                      value={formData.streetAddress}
                      onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="isDefault" className="text-sm">
                      Đặt làm địa chỉ mặc định
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                      Hủy
                    </Button>
                    <Button type="submit" className="flex-1">
                      Lưu địa chỉ
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