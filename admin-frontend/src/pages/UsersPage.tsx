import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import Table from '../components/common/Table';
import { userService } from '../services';
import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../constants';
import type { User } from '../types';

const UsersPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
    });

    // Modal states
    const [showFormModal, setShowFormModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showOrdersModal, setShowOrdersModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const [userOrders, setUserOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'customer',
        status: 'active'
    });
    const [roles, setRoles] = useState<any[]>([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<string>('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({ ...prev, pageNumber: 1 }));
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [pagination.pageNumber, searchTerm]);

    const fetchRoles = async () => {
        setRolesLoading(true);
        try {
            const response = await apiClient.get(API_ENDPOINTS.ROLES.LIST);
            const payload = response.data;
            let rolesData: any[] = [];

            if (Array.isArray(payload)) rolesData = payload;
            else if (Array.isArray(payload?.data)) rolesData = payload.data;
            else if (Array.isArray(payload?.items)) rolesData = payload.items;
            else if (Array.isArray(payload?.result)) rolesData = payload.result;
            else if (Array.isArray(payload?.data?.items)) rolesData = payload.data.items;
            else rolesData = [];

            setRoles(rolesData);
        } catch (error) {
            console.error('Error fetching roles:', error);
            setRoles([]);
        } finally {
            setRolesLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getPaged({
                pageNumber: pagination.pageNumber,
                pageSize: pagination.pageSize,
                searchTerm: searchTerm || undefined,
            });

            setUsers(response.data || response.items || []);
            setPagination(prev => ({
                ...prev,
                totalCount: response.totalCount || response.total || 0,
            }));
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Helper to safely get a role label (string) and check admin-like role
    const roleToLabel = (role: any) => {
        if (!role && role !== 0) return '';
        if (typeof role === 'string') return role;
        if (typeof role === 'number') return String(role);
        if (typeof role === 'object') return role.name || role.roleName || role.id || JSON.stringify(role);
        return String(role);
    };

    const isAdminRole = (role: any) => {
        const label = roleToLabel(role).toLowerCase();
        return label.includes('admin');
    };

    // Resolve various role identifier shapes (id, name, roleName) to a real role id
    const resolveToRoleId = (ident?: string) => {
        if (!ident && ident !== '0') return '';
        const s = String(ident);
        // direct id match
        const byId = roles.find(r => String(r.id) === s);
        if (byId) return String(byId.id);
        // name / roleName match
        const byName = roles.find(r => String(r.name) === s || String(r.roleName) === s);
        if (byName) return String(byName.id);
        return '';
    };

    // When opening edit modal, if roles are loaded try to set selectedRoleId to a matching role id
    useEffect(() => {
        if (!editingUser) return;
        // If already set, do nothing
        if (selectedRoleId) return;
        // Try to find first role from editingUser and match with loaded roles
        const ur = Array.isArray((editingUser as any)?.roles)
            ? (editingUser as any).roles[0]
            : (editingUser?.role ?? (editingUser as any)?.roles);
        if (!ur) return;
        // Attempt to extract id from user role
        let candidateId = '';
        if (typeof ur === 'object' && ur !== null) candidateId = String(ur.id ?? ur.roleId ?? '');
        else candidateId = String(ur);
        if (!candidateId) return;
        // Try to find matching role in roles list
        const match = roles.find(r => String(r.id) === candidateId || String(r.name) === candidateId || String(r.roleName) === candidateId);
        if (match) setSelectedRoleId(String(match.id));
        else setSelectedRoleId(candidateId);
    }, [editingUser, roles]);
    
    const columns = [
        { key: 'name', label: 'Họ tên' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Số điện thoại' },
        {
            key: 'roles',
            label: 'Vai trò',
            render: (value: any, user: User) => {
                const userRoles = Array.isArray(value)
                    ? value
                    : (Array.isArray((user as any).roles) ? (user as any).roles : (user.role ? [user.role] : []));
                if (!userRoles || userRoles.length === 0) {
                    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Chưa có vai trò</span>;
                }
                return (
                    <div className="flex flex-wrap gap-1">
                        {userRoles.map((role: any, idx: number) => {
                            const label = roleToLabel(role) || 'Chưa có vai trò';
                            return (
                                <span
                                    key={idx}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        isAdminRole(role) ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                    }`}
                                >
                                    {label}
                                </span>
                            );
                        })}
                    </div>
                );
            },
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (value: string) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${value === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}
                >
                    {value === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </span>
            ),
        },
        { 
            key: 'createdAt', 
            label: 'Ngày tạo',
            render: (value: string) => value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A'
        },
    ];

    const handleEdit = (user: User) => {
        setEditingUser(user);
        // Ensure roles are loaded when opening edit modal
        if (!roles || roles.length === 0) fetchRoles();
        
        
        // Get first role ID if user has roles - try multiple ways to extract ID and convert to string
        let userRoleId = '';
        // extract role from either `roles` array or singular `role` field
        const firstRole = Array.isArray((user as any).roles) && (user as any).roles.length > 0
            ? (user as any).roles[0]
            : (user.role ?? undefined);
        if (firstRole !== undefined && firstRole !== null) {
            if (typeof firstRole === 'object') userRoleId = String(firstRole.id ?? firstRole.roleId ?? firstRole.name ?? '');
            else userRoleId = String(firstRole);
        }

        setSelectedRoleId(userRoleId);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            password: '',
            role: user.role || 'customer',
            status: user.status || 'active'
        });
        setShowFormModal(true);
    };

    const handleDelete = async (user: User) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng ${user.name}?`)) {
            try {
                await userService.delete(user.id);
                fetchUsers();
                alert('Xóa người dùng thành công!');
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Có lỗi xảy ra khi xóa người dùng');
            }
        }
    };

    const handleView = (user: User) => {
        setViewingUser(user);
        setShowViewModal(true);
    };

    const handleAddNew = () => {
        setEditingUser(null);
        setSelectedRoleId('');
        if (!roles || roles.length === 0) fetchRoles();
        setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            role: 'customer',
            status: 'active'
        });
        setShowFormModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                // Admin can only change role, not user info
                if (selectedRoleId) {
                    // Ensure roles list is loaded to resolve identifiers
                    if (!roles || roles.length === 0) await fetchRoles();

                    const resolvedSelected = resolveToRoleId(selectedRoleId) || String(selectedRoleId);

                    // Remove existing roles first (resolve to ids)
                    const existingRoles = Array.isArray((editingUser as any).roles)
                        ? (editingUser as any).roles
                        : ((editingUser as any).roles ? [(editingUser as any).roles] : (editingUser.role ? [editingUser.role] : []));
                    for (const r of existingRoles) {
                        let existingIdent = '';
                        if (!r && r !== 0) continue;
                        if (typeof r === 'object' && r !== null) existingIdent = String(r.id ?? r.roleId ?? r.name ?? '');
                        else existingIdent = String(r);
                        if (!existingIdent) continue;

                        const existingResolvedId = resolveToRoleId(existingIdent);
                        if (!existingResolvedId) {
                            console.warn('Cannot resolve existing role to id, skipping delete:', existingIdent);
                            continue;
                        }
                        // if existingResolvedId equals resolvedSelected, skip deletion
                        if (String(existingResolvedId) === String(resolvedSelected)) continue;
                        try {
                            await apiClient.delete(API_ENDPOINTS.USERS.REMOVE_ROLE(editingUser.id, existingResolvedId));
                        } catch (delErr) {
                            console.error('Error removing existing role:', delErr);
                        }
                    }

                    // Assign new role (only if we can resolve to an id)
                    const assignId = resolveToRoleId(resolvedSelected) || resolvedSelected;
                    if (!assignId) {
                        console.warn('Selected role could not be resolved to an id, skipping assignment:', selectedRoleId);
                    } else {
                        await apiClient.post(API_ENDPOINTS.USERS.ASSIGN_ROLE(editingUser.id, assignId));
                    }
                }
                alert('Cập nhật vai trò thành công!');
            } else {
                // Create new user with full info
                const payload = {
                    ...formData,
                    roleId: selectedRoleId ? (isNaN(Number(selectedRoleId)) ? selectedRoleId : Number(selectedRoleId)) : undefined
                };
                await userService.create(payload as any);
                alert('Thêm người dùng thành công!');
            }
            setShowFormModal(false);
            setEditingUser(null);
            fetchUsers();
        } catch (err: any) {
            console.error('Error saving user:', err);
            alert(`Không thể lưu người dùng: ${err.message}`);
        }
    };

    const handleViewOrders = async (user: User) => {
        setViewingUser(user);
        setShowOrdersModal(true);
        setOrdersLoading(true);
        setUserOrders([]);
        try {
            const resp = await apiClient.get(API_ENDPOINTS.ORDERS.GET_BY_USER(user.id));
            setUserOrders(Array.isArray(resp.data) ? resp.data : (resp.data?.items || []));
        } catch (err: any) {
            console.error('Error fetching user orders:', err);
            alert(`Lỗi khi tải đơn hàng: ${err.message}`);
        } finally {
            setOrdersLoading(false);
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesStatus = !statusFilter || user.status === statusFilter;
        return matchesRole && matchesStatus;
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
                <button 
                    onClick={handleAddNew}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Thêm người dùng
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1 flex items-center bg-gray-100 rounded-lg px-4 py-2">
                        <Search size={20} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="bg-transparent border-none outline-none ml-2 w-full"
                        />
                    </div>
                    <select 
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">Tất cả vai trò</option>
                        <option value="admin">Quản trị viên</option>
                        <option value="customer">Khách hàng</option>
                    </select>
                    <select 
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
                    <div className="text-lg text-gray-500">Đang tải dữ liệu...</div>
                </div>
            ) : (
                <>
                    <Table
                        columns={columns}
                        data={filteredUsers}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                    />

                    <div className="mt-4 flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            Hiển thị {filteredUsers.length} trong tổng số {pagination.totalCount} người dùng
                        </p>
                        {pagination.totalCount > pagination.pageSize && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, pageNumber: Math.max(1, prev.pageNumber - 1) }))}
                                    disabled={pagination.pageNumber === 1}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                                >
                                    Trước
                                </button>
                                <span className="px-4 py-2">
                                    Trang {pagination.pageNumber} / {Math.ceil(pagination.totalCount / pagination.pageSize)}
                                </span>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, pageNumber: prev.pageNumber + 1 }))}
                                    disabled={pagination.pageNumber >= Math.ceil(pagination.totalCount / pagination.pageSize)}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Create/Edit User Modal */}
            {showFormModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingUser ? 'Chỉnh sửa vai trò người dùng' : 'Thêm người dùng mới'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Họ tên *
                                </label>
                                <input
                                    type="text"
                                    required={!editingUser}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={!!editingUser}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${editingUser ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                />
                                {editingUser && (
                                    <p className="text-xs text-gray-500 mt-1">Admin không thể thay đổi thông tin cá nhân</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    required={!editingUser}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={!!editingUser}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${editingUser ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    disabled={!!editingUser}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${editingUser ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                />
                            </div>
                            {!editingUser && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mật khẩu *
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Vai trò *
                                </label>
                                <select
                                    value={selectedRoleId}
                                    onChange={(e) => setSelectedRoleId(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Chọn vai trò --</option>
                                    {rolesLoading ? (
                                        <option value="" disabled>Đang tải vai trò...</option>
                                    ) : roles.length === 0 ? (
                                        <option value="" disabled>Không có vai trò</option>
                                    ) : (
                                        roles.map((role) => (
                                            <option key={role.id ?? role} value={String(role.id ?? role)}>
                                                {role.name || role.roleName || String(role.id ?? role)}
                                            </option>
                                        ))
                                    )}
                                </select>
                                {editingUser && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Hiện tại: {selectedRoleId || 'Chưa có vai trò'}
                                    </p>
                                )}
                            </div>
                            {!editingUser && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Trạng thái *
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
                                    </select>
                                </div>
                            )}
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowFormModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingUser ? 'Cập nhật vai trò' : 'Thêm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View User Details Modal */}
            {showViewModal && viewingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Chi tiết người dùng</h2>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="px-3 py-1 border rounded-lg hover:bg-gray-50"
                            >
                                Đóng
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="border-b pb-3">
                                <label className="text-sm font-medium text-gray-500">Họ tên</label>
                                <p className="text-gray-900 mt-1">{viewingUser.name}</p>
                            </div>
                            <div className="border-b pb-3">
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <p className="text-gray-900 mt-1">{viewingUser.email}</p>
                            </div>
                            <div className="border-b pb-3">
                                <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                                <p className="text-gray-900 mt-1">{viewingUser.phone || 'N/A'}</p>
                            </div>
                            <div className="border-b pb-3">
                                <label className="text-sm font-medium text-gray-500">Vai trò</label>
                                <p className="text-gray-900 mt-1">
                                    {((Array.isArray((viewingUser as any).roles) && (viewingUser as any).roles.length > 0) || viewingUser.role) ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {((Array.isArray((viewingUser as any).roles) ? (viewingUser as any).roles : (viewingUser.role ? [viewingUser.role] : [])) as any[]).map((role: any, idx: number) => {
                                                                const label = roleToLabel(role) || 'Chưa có vai trò';
                                                                return (
                                                                    <span
                                                                        key={idx}
                                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${isAdminRole(role) ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}
                                                                    >
                                                                        {label}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                                            Chưa có vai trò
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="border-b pb-3">
                                <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                                <p className="text-gray-900 mt-1">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        viewingUser.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {viewingUser.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                    </span>
                                </p>
                            </div>
                            <div className="pb-3">
                                <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                                <p className="text-gray-900 mt-1">
                                    {viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={() => handleViewOrders(viewingUser)}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Xem đơn hàng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View User Orders Modal */}
            {showOrdersModal && viewingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Đơn hàng của: {viewingUser.name}</h2>
                            <button
                                onClick={() => setShowOrdersModal(false)}
                                className="px-3 py-1 border rounded-lg hover:bg-gray-50"
                            >
                                Đóng
                            </button>
                        </div>

                        {ordersLoading ? (
                            <div className="py-8 text-center text-gray-500">Đang tải đơn hàng...</div>
                        ) : userOrders.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">Không có đơn hàng nào.</div>
                        ) : (
                            <div className="space-y-4">
                                {userOrders.map((order) => (
                                    <div key={order.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-800">Đơn hàng #{order.id?.substring(0, 8)}</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Ngày: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {order.status || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <div><span className="font-medium">Tổng tiền:</span> {order.totalAmount?.toLocaleString('vi-VN')} đ</div>
                                            <div><span className="font-medium">Địa chỉ:</span> {order.shippingAddress || 'N/A'}</div>
                                            <div><span className="font-medium">Số điện thoại:</span> {order.phoneNumber || 'N/A'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
