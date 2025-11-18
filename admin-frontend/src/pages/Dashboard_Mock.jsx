import { Book, Users, ShoppingCart, DollarSign } from 'lucide-react';

export default function Dashboard() {
    // Mock statistics
    const stats = [
        { label: 'Tổng số sách', value: '1,245', icon: Book, color: '#3498db' },
        { label: 'Người dùng', value: '856', icon: Users, color: '#2ecc71' },
        { label: 'Đơn hàng', value: '342', icon: ShoppingCart, color: '#f39c12' },
        { label: 'Doanh thu', value: '125.5M', icon: DollarSign, color: '#e74c3c' },
    ];

    // Mock recent orders
    const recentOrders = [
        { id: 1, orderNumber: 'ORD-2024-008', customer: 'Bùi Thị H', amount: 450000, status: 'shipped' },
        { id: 2, orderNumber: 'ORD-2024-007', customer: 'Vũ Văn G', amount: 1750000, status: 'processing' },
        { id: 3, orderNumber: 'ORD-2024-006', customer: 'Đặng Thị F', amount: 950000, status: 'cancelled' },
        { id: 4, orderNumber: 'ORD-2024-005', customer: 'Hoàng Văn E', amount: 1500000, status: 'delivered' },
        { id: 5, orderNumber: 'ORD-2024-004', customer: 'Phạm Thị D', amount: 650000, status: 'pending' },
    ];

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
            <h1 className="page-title">Dashboard</h1>

            <div className="stats-grid">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="stat-card">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div className="stat-label">{stat.label}</div>
                                <Icon size={24} color={stat.color} />
                            </div>
                            <div className="stat-value">{stat.value}</div>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: '32px' }}>
                <h2 className="page-title" style={{ fontSize: '20px', marginBottom: '16px' }}>Đơn hàng gần đây</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Mã đơn hàng</th>
                                <th>Khách hàng</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <tr key={order.id}>
                                    <td><strong>{order.orderNumber}</strong></td>
                                    <td>{order.customer}</td>
                                    <td><strong>{order.amount.toLocaleString('vi-VN')}đ</strong></td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
