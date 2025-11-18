import { useState } from 'react';
import { Eye, Package } from 'lucide-react';

export default function Orders() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const itemsPerPage = 10;

    // Mock data
    const mockOrders = [
        { id: 1, orderNumber: 'ORD-2024-001', customerName: 'Nguyễn Văn A', email: 'nguyenvana@email.com', totalAmount: 1250000, status: 'delivered', orderDate: '2024-01-15', items: 3 },
        { id: 2, orderNumber: 'ORD-2024-002', customerName: 'Trần Thị B', email: 'tranthib@email.com', totalAmount: 850000, status: 'shipped', orderDate: '2024-01-16', items: 2 },
        { id: 3, orderNumber: 'ORD-2024-003', customerName: 'Lê Văn C', email: 'levanc@email.com', totalAmount: 2100000, status: 'processing', orderDate: '2024-01-17', items: 5 },
        { id: 4, orderNumber: 'ORD-2024-004', customerName: 'Phạm Thị D', email: 'phamthid@email.com', totalAmount: 650000, status: 'pending', orderDate: '2024-01-18', items: 2 },
        { id: 5, orderNumber: 'ORD-2024-005', customerName: 'Hoàng Văn E', email: 'hoangvane@email.com', totalAmount: 1500000, status: 'delivered', orderDate: '2024-01-19', items: 4 },
        { id: 6, orderNumber: 'ORD-2024-006', customerName: 'Đặng Thị F', email: 'dangthif@email.com', totalAmount: 950000, status: 'cancelled', orderDate: '2024-01-20', items: 3 },
        { id: 7, orderNumber: 'ORD-2024-007', customerName: 'Vũ Văn G', email: 'vuvang@email.com', totalAmount: 1750000, status: 'processing', orderDate: '2024-01-21', items: 5 },
        { id: 8, orderNumber: 'ORD-2024-008', customerName: 'Bùi Thị H', email: 'buithih@email.com', totalAmount: 450000, status: 'shipped', orderDate: '2024-01-22', items: 1 },
        { id: 9, orderNumber: 'ORD-2024-009', customerName: 'Đinh Văn I', email: 'dinhvani@email.com', totalAmount: 3200000, status: 'delivered', orderDate: '2024-01-23', items: 8 },
        { id: 10, orderNumber: 'ORD-2024-010', customerName: 'Mai Thị K', email: 'maithik@email.com', totalAmount: 725000, status: 'pending', orderDate: '2024-01-24', items: 2 },
    ];

    const filteredOrders = mockOrders.filter(order => {
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: 'badge-pending',
            processing: 'badge-processing',
            shipped: 'badge-shipped',
            delivered: 'badge-delivered',
            cancelled: 'badge-cancelled'
        };
        return statusMap[status] || 'badge-pending';
    };

    const getStatusText = (status) => {
        const statusMap = {
            pending: 'Chờ xử lý',
            processing: 'Đang xử lý',
            shipped: 'Đang giao',
            delivered: 'Đã giao',
            cancelled: 'Đã hủy'
        };
        return statusMap[status] || status;
    };

    return (
        <div className="page-content">
            <div className="items-header">
                <h1 className="page-title">Đơn hàng</h1>
            </div>

            <div className="table-container">
                <div className="table-header-bar">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm đơn hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="table-search"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="form-select"
                            style={{ width: '180px' }}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="processing">Đang xử lý</option>
                            <option value="shipped">Đang giao</option>
                            <option value="delivered">Đã giao</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>Mã đơn hàng</th>
                            <th>Khách hàng</th>
                            <th>Email</th>
                            <th style={{ width: '100px' }}>Số items</th>
                            <th style={{ width: '140px' }}>Tổng tiền</th>
                            <th style={{ width: '120px' }}>Trạng thái</th>
                            <th style={{ width: '120px' }}>Ngày đặt</th>
                            <th style={{ width: '80px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentOrders.length > 0 ? (
                            currentOrders.map((order, index) => (
                                <tr key={order.id}>
                                    <td>{startIndex + index + 1}</td>
                                    <td><strong>{order.orderNumber}</strong></td>
                                    <td>{order.customerName}</td>
                                    <td>{order.email}</td>
                                    <td>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Package size={14} />
                                            {order.items}
                                        </span>
                                    </td>
                                    <td><strong>{order.totalAmount.toLocaleString('vi-VN')}đ</strong></td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </td>
                                    <td>{order.orderDate}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="btn-icon" title="View Details">
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="empty-state">
                                    <div className="empty-state-title">Không tìm thấy đơn hàng</div>
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
