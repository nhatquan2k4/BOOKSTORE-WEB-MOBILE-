import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import Table from '../components/common/Table';
import { userService } from '../services';
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

    useEffect(() => {
        fetchUsers();
    }, [pagination.pageNumber, searchTerm]);

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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({ ...prev, pageNumber: 1 }));
    };

    const columns = [
        { key: 'name', label: 'Họ tên' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Số điện thoại' },
        {
            key: 'role',
            label: 'Vai trò',
            render: (value: string) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${value === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                        }`}
                >
                    {value === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                </span>
            ),
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
        console.log('Edit user:', user);
    };

    const handleDelete = async (user: User) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng ${user.name}?`)) {
            try {
                await userService.delete(user.id);
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Có lỗi xảy ra khi xóa người dùng');
            }
        }
    };

    const handleView = (user: User) => {
        console.log('View user:', user);
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
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
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
        </div>
    );
};

export default UsersPage;
