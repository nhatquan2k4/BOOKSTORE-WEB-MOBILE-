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

// --- INTERFACES CHO API ĐỊA CHÍNH (ESGOO) ---
interface LocationItem {
  id: string;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  latitude: string;
  longitude: string;
}

export default function AddressesPage() {
  // --- STATE DỮ LIỆU ---
  const [addresses, setAddresses] = useState<UserAddressDto[]>([]);
  const [loading, setLoading] = useState(true);

  // --- STATE FORM ĐỊA CHÍNH ---
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [wards, setWards] = useState<LocationItem[]>([]);

  // Loading state cho dropdown
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // State hiển thị Form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Dữ liệu Form
  const [formData, setFormData] = useState({
    recipientName: "",
    phoneNumber: "",
    streetAddress: "",
    province: "",
    provinceId: "", // ID dùng để bind vào select box
    district: "",
    districtId: "",
    ward: "",
    wardId: "",
    isDefault: false,
  });

  // 1. INIT DATA
  useEffect(() => {
    fetchAddresses();
    fetchProvinces();
  }, []);

  // --- FIX LỖI "MAP IS NOT A FUNCTION" TẠI ĐÂY ---
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response: any = await addressService.getMyAddresses();
      
      console.log("API Addresses Response:", response); // Log để debug

      if (Array.isArray(response)) {
        // Trường hợp API trả về mảng trực tiếp
        setAddresses(response);
      } else if (response && Array.isArray(response.data)) {
        // Trường hợp API trả về { success: true, data: [] }
        setAddresses(response.data);
      } else if (response && Array.isArray(response.items)) {
        // Trường hợp API trả về { items: [], total: ... }
        setAddresses(response.items);
      } else {
        // Trường hợp không có dữ liệu hoặc lỗi
        setAddresses([]);
      }
    } catch (err) {
      console.error("Lỗi tải địa chỉ:", err);
      setAddresses([]); // Luôn set mảng rỗng nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  // --- API HELPER FUNCTIONS (ĐỊA CHÍNH) ---
  const fetchProvinces = async () => {
    try {
      const res = await fetch("https://esgoo.net/api-tinhthanh/1/0.htm");
      const data = await res.json();
      if (data.error === 0) setProvinces(data.data);
    } catch (e) { console.error(e); }
  };

  const fetchDistricts = async (provinceId: string) => {
    if (!provinceId) return [];
    try {
      const res = await fetch(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`);
      const data = await res.json();
      return data.error === 0 ? data.data : [];
    } catch (e) { return []; }
  };

  const fetchWards = async (districtId: string) => {
    if (!districtId) return [];
    try {
      const res = await fetch(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`);
      const data = await res.json();
      return data.error === 0 ? data.data : [];
    } catch (e) { return []; }
  };

  // --- HANDLERS CHO SELECT BOX ---

  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value;
    const index = e.target.selectedIndex;
    const provinceName = e.target.options[index].text;

    // Reset quận/huyện, phường/xã
    setFormData(prev => ({
      ...prev,
      province: provinceName,
      provinceId: provinceId,
      district: "", districtId: "",
      ward: "", wardId: ""
    }));
    setDistricts([]);
    setWards([]);

    if (provinceId) {
      setLoadingDistricts(true);
      const data = await fetchDistricts(provinceId);
      setDistricts(data);
      setLoadingDistricts(false);
    }
  };

  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    const index = e.target.selectedIndex;
    const districtName = e.target.options[index].text;

    setFormData(prev => ({
      ...prev,
      district: districtName,
      districtId: districtId,
      ward: "", wardId: ""
    }));
    setWards([]);

    if (districtId) {
      setLoadingWards(true);
      const data = await fetchWards(districtId);
      setWards(data);
      setLoadingWards(false);
    }
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardId = e.target.value;
    const index = e.target.selectedIndex;
    const wardName = e.target.options[index].text;

    setFormData(prev => ({
      ...prev,
      ward: wardName,
      wardId: wardId
    }));
  };

  // --- LOGIC MỞ FORM ---

  const openAddForm = () => {
    setEditingId(null);
    setFormData({
      recipientName: "",
      phoneNumber: "",
      streetAddress: "",
      province: "", provinceId: "",
      district: "", districtId: "",
      ward: "", wardId: "",
      isDefault: false,
    });
    setDistricts([]);
    setWards([]);
    setShowForm(true);
  };

  const openEditForm = async (addr: UserAddressDto) => {
    setEditingId(addr.id);
    
    // 1. Set thông tin cơ bản trước
    const newFormData = {
      recipientName: addr.recipientName,
      phoneNumber: addr.phoneNumber,
      streetAddress: addr.streetAddress,
      province: addr.province,
      provinceId: "", // Cần tìm ID tương ứng với tên
      district: addr.district,
      districtId: "",
      ward: addr.ward,
      wardId: "",
      isDefault: addr.isDefault,
    };

    setShowForm(true); // Mở form lên cho user đỡ đợi

    // 2. Logic tìm lại ID từ Tên (Reverse Lookup)
    // Tìm Province
    const foundProv = provinces.find(p => p.name === addr.province || p.full_name === addr.province);
    
    if (foundProv) {
      newFormData.provinceId = foundProv.id;
      
      // Load Districts
      setLoadingDistricts(true);
      const districtsData = await fetchDistricts(foundProv.id);
      setDistricts(districtsData);
      setLoadingDistricts(false);

      // Tìm District
      const foundDist = districtsData.find((d: any) => d.name === addr.district || d.full_name === addr.district);
      
      if (foundDist) {
        newFormData.districtId = foundDist.id;

        // Load Wards
        setLoadingWards(true);
        const wardsData = await fetchWards(foundDist.id);
        setWards(wardsData);
        setLoadingWards(false);

        // Tìm Ward
        const foundWard = wardsData.find((w: any) => w.name === addr.ward || w.full_name === addr.ward);
        if (foundWard) {
          newFormData.wardId = foundWard.id;
        }
      }
    }

    // Cập nhật lại form data đã có đủ ID
    setFormData(newFormData);
  };

  // --- SUBMIT ---
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.provinceId || !formData.districtId || !formData.wardId) {
        alert("Vui lòng chọn đầy đủ địa chỉ hành chính.");
        return;
      }

      // Payload gửi lên server (chỉ cần tên, không cần ID địa chính)
      const payload: any = {
        recipientName: formData.recipientName,
        phoneNumber: formData.phoneNumber,
        streetAddress: formData.streetAddress,
        province: formData.province,
        district: formData.district,
        ward: formData.ward,
        isDefault: formData.isDefault,
      };

      if (editingId) {
        await addressService.updateAddress(editingId, payload);
      } else {
        await addressService.createAddress(payload as CreateUserAddressDto);
      }
      
      setShowForm(false);
      await fetchAddresses(); // Load lại danh sách
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu địa chỉ.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      try {
        await addressService.deleteAddress(id);
        fetchAddresses();
      } catch (e) { alert("Lỗi khi xóa"); }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressService.setDefaultAddress(id);
      fetchAddresses();
    } catch (e) { alert("Lỗi khi đặt mặc định"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sổ địa chỉ</h1>
            <p className="text-gray-600 mt-1">Quản lý địa chỉ giao hàng</p>
          </div>
          <Button onClick={openAddForm} className="bg-blue-600 hover:bg-blue-700 text-white">
            + Thêm địa chỉ mới
          </Button>
        </div>

        {/* List Addresses */}
        {loading ? (
          <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : !Array.isArray(addresses) || addresses.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-4">Bạn chưa lưu địa chỉ nào.</p>
            <Button variant="outline" onClick={openAddForm}>Thêm ngay</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {addresses.map((addr) => (
              <Card key={addr.id} className={`relative group transition-all hover:shadow-md ${addr.isDefault ? 'border-blue-200 bg-blue-50/30' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900 text-lg">{addr.recipientName}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-700">{addr.phoneNumber}</span>
                        {addr.isDefault && (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200 shadow-none">
                            Mặc định
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-700">{addr.streetAddress}</p>
                      <p className="text-sm text-gray-500">
                        {addr.ward}, {addr.district}, {addr.province}
                      </p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" onClick={() => openEditForm(addr)} className="hover:bg-blue-50 hover:text-blue-600">
                        Sửa
                      </Button>
                      {!addr.isDefault && (
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(addr.id)}>
                          Xóa
                        </Button>
                      )}
                    </div>
                  </div>
                  {!addr.isDefault && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button 
                        className="text-sm text-blue-600 hover:underline font-medium"
                        onClick={() => handleSetDefault(addr.id)}
                      >
                        Đặt làm địa chỉ mặc định
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl rounded-xl">
              <CardHeader className="border-b sticky top-0 bg-white z-10 flex flex-row items-center justify-between px-6 py-4">
                <CardTitle className="text-xl">{editingId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => setShowForm(false)}>
                  ✕
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Họ và tên</label>
                      <input
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        required
                        value={formData.recipientName}
                        onChange={e => setFormData({...formData, recipientName: e.target.value})}
                        placeholder="VD: Nguyễn Văn A"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Số điện thoại</label>
                      <input
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        required
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                        placeholder="VD: 0901234567"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Tỉnh/Thành */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Tỉnh/Thành phố</label>
                      <select
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        required
                        value={formData.provinceId}
                        onChange={handleProvinceChange}
                      >
                        <option value="">Chọn Tỉnh/Thành</option>
                        {provinces.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Quận/Huyện */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Quận/Huyện</label>
                      <select
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                        required
                        value={formData.districtId}
                        onChange={handleDistrictChange}
                        disabled={!formData.provinceId || loadingDistricts}
                      >
                        <option value="">{loadingDistricts ? "Đang tải..." : "Chọn Quận/Huyện"}</option>
                        {districts.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Phường/Xã */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Phường/Xã</label>
                      <select
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                        required
                        value={formData.wardId}
                        onChange={handleWardChange}
                        disabled={!formData.districtId || loadingWards}
                      >
                        <option value="">{loadingWards ? "Đang tải..." : "Chọn Phường/Xã"}</option>
                        {wards.map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Địa chỉ cụ thể</label>
                    <input
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      required
                      value={formData.streetAddress}
                      onChange={e => setFormData({...formData, streetAddress: e.target.value})}
                      placeholder="VD: Số 123 Đường ABC, Tòa nhà XYZ"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      checked={formData.isDefault}
                      onChange={e => setFormData({...formData, isDefault: e.target.checked})}
                    />
                    <label htmlFor="isDefault" className="text-sm text-gray-700 cursor-pointer select-none">
                      Đặt làm địa chỉ mặc định
                    </label>
                  </div>

                  <div className="pt-6 flex gap-3 border-t mt-4">
                    <Button type="button" variant="outline" className="flex-1 py-2.5" onClick={() => setShowForm(false)}>
                      Hủy bỏ
                    </Button>
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 shadow-md transition-all">
                      {editingId ? "Cập nhật" : "Lưu địa chỉ"}
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