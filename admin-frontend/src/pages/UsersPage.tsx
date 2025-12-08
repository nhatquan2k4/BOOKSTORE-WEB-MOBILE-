import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Table from '../components/common/Table';
import type { User } from '../types';

const UsersPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const [users] = useState<User[]>([
        {
            id: '1',
            name: 'Nguyễn Văn A',
            email: 'nguyenvana@example.com',
            phone: '0123456789',
            role: 'customer',
            createdAt: '2024-01-15',
            status: 'active',
        },
        {
            id: '2',
            name: 'Trần Thị B',
            email: 'tranthib@example.com',
            phone: '0987654321',
            role: 'customer',
            createdAt: '2024-02-20',
            status: 'active',
        },
        {
            id: '3',
            name: 'Admin User',
            email: 'admin@bookstore.com',
            phone: '0999999999',
            role: 'admin',
            createdAt: '2023-12-01',
            status: 'active',
        },
        {
            id: '4',
            name: 'Lê Văn C',
            email: 'levanc@example.com',
            phone: '0912345678',
            role: 'customer',
            createdAt: '2024-03-10',
            status: 'inactive',
        },
    ]);

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
        { key: 'createdAt', label: 'Ngày tạo' },
    ];

    const handleEdit = (user: User) => {
        console.log('Edit user:', user);
    };

    const handleDelete = (user: User) => {
        console.log('Delete user:', user);
    };

    const handleView = (user: User) => {
        console.log('View user:', user);
    };

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone.includes(searchTerm)
    );

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
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none ml-2 w-full"
                        />
                    </div>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Tất cả vai trò</option>
                        <option value="admin">Quản trị viên</option>
                        <option value="customer">Khách hàng</option>
                    </select>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                    </select>
                </div>
            </div>

            <Table
                columns={columns}
                data={filteredUsers}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
            />

            <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                    Hiển thị {filteredUsers.length} trong tổng số {users.length} người dùng
                </p>
            </div>
        </div>
    );
};

export default UsersPage;
