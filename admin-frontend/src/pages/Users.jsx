import { useState } from 'react';
import { Edit, Trash2, Plus, Lock, Unlock } from 'lucide-react';

export default function Users() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [roleFilter, setRoleFilter] = useState('all');
    const itemsPerPage = 10;

    // Mock data - Người dùng
    const mockUsers = [
        { id: 1, fullName: 'Nguyễn Văn Admin', email: 'admin@bookstore.vn', phone: '0901234567', role: 'Admin', status: 'active', totalOrders: 0, joinDate: '2023-01-15' },
        { id: 2, fullName: 'Trần Thị Bích', email: 'bich.tran@email.com', phone: '0912345678', role: 'Customer', status: 'active', totalOrders: 15, joinDate: '2023-03-20' },
        { id: 3, fullName: 'Lê Minh Tuấn', email: 'tuan.le@email.com', phone: '0923456789', role: 'Customer', status: 'active', totalOrders: 28, joinDate: '2023-02-10' },
        { id: 4, fullName: 'Phạm Thu Hương', email: 'huong.pham@email.com', phone: '0934567890', role: 'Customer', status: 'active', totalOrders: 42, joinDate: '2023-01-05' },
        { id: 5, fullName: 'Hoàng Văn Nam', email: 'nam.hoang@email.com', phone: '0945678901', role: 'Staff', status: 'active', totalOrders: 0, joinDate: '2023-04-12' },
        { id: 6, fullName: 'Đặng Thị Mai', email: 'mai.dang@email.com', phone: '0956789012', role: 'Customer', status: 'inactive', totalOrders: 8, joinDate: '2023-05-18' },
        { id: 7, fullName: 'Vũ Quang Huy', email: 'huy.vu@email.com', phone: '0967890123', role: 'Customer', status: 'active', totalOrders: 33, joinDate: '2023-03-25' },
        { id: 8, fullName: 'Bùi Thị Lan', email: 'lan.bui@email.com', phone: '0978901234', role: 'Staff', status: 'active', totalOrders: 0, joinDate: '2023-06-01' },
        { id: 9, fullName: 'Đinh Văn Tùng', email: 'tung.dinh@email.com', phone: '0989012345', role: 'Customer', status: 'active', totalOrders: 19, joinDate: '2023-04-08' },
        { id: 10, fullName: 'Mai Thị Kim', email: 'kim.mai@email.com', phone: '0990123456', role: 'Customer', status: 'inactive', totalOrders: 5, joinDate: '2023-07-22' },
    ];

    const getRoleBadge = (role) => {
        const badges = {
            'Admin': 'badge-cancelled',
            'Staff': 'badge-processing',
            'Customer': 'badge-shipped'
        };
        return badges[role] || 'badge-shipped';
    };

    const filteredUsers = mockUsers.filter(user => {
        const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone.includes(searchTerm);
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="page-content">
            <div className="items-header">
                <h1 className="page-title">Quản lý Người dùng</h1>
            </div>

            <div className="table-container">
                <div className="table-header-bar">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm người dùng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="table-search"
                        />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="form-select"
                            style={{ width: '150px' }}
                        >
                            <option value="all">Tất cả vai trò</option>
                            <option value="Admin">Admin</option>
                            <option value="Staff">Nhân viên</option>
                            <option value="Customer">Khách hàng</option>
                        </select>
                    </div>
                    <button className="btn-primary">
                        <Plus size={18} />
                        Thêm người dùng
                    </button>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>Họ và tên</th>
                            <th>Email</th>
                            <th style={{ width: '120px' }}>Điện thoại</th>
                            <th style={{ width: '110px' }}>Vai trò</th>
                            <th style={{ width: '100px' }}>Đơn hàng</th>
                            <th style={{ width: '100px' }}>Trạng thái</th>
                            <th style={{ width: '120px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.length > 0 ? (
                            currentUsers.map((user, index) => (
                                <tr key={user.id}>
                                    <td>{startIndex + index + 1}</td>
                                    <td><strong>{user.fullName}</strong></td>
                                    <td>{user.email}</td>
                                    <td>{user.phone}</td>
                                    <td>
                                        <span className={`badge ${getRoleBadge(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>{user.totalOrders}</td>
                                    <td>
                                        {user.status === 'active' ? (
                                            <span className="badge badge-shipped">Hoạt động</span>
                                        ) : (
                                            <span className="badge badge-cancelled">Khóa</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            {user.status === 'active' ? (
                                                <button className="btn-icon" title="Khóa tài khoản">
                                                    <Lock size={16} />
                                                </button>
                                            ) : (
                                                <button className="btn-icon" title="Mở khóa">
                                                    <Unlock size={16} />
                                                </button>
                                            )}
                                            <button className="btn-icon" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button className="btn-icon" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="empty-state">
                                    <div className="empty-state-title">Không tìm thấy người dùng</div>
                                    <div className="empty-state-text">Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="btn-icon"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="pagination-info">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="btn-icon"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
