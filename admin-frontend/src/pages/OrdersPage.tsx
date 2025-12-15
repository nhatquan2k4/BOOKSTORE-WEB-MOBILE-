import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Table from '../components/common/Table';
import type { Order } from '../types';

const OrdersPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const [orders] = useState<Order[]>([
        {
            id: 'ORD001',
            userId: '1',
            customerName: 'Nguyễn Văn A',
            items: [
                { bookId: '1', bookTitle: 'The Great Gatsby', quantity: 2, price: 15.99 },
                { bookId: '2', bookTitle: 'To Kill a Mockingbird', quantity: 1, price: 18.99 },
            ],
            totalAmount: 50.97,
            status: 'delivered',
            orderDate: '2024-11-01',
            deliveryAddress: '123 Đường ABC, Quận 1, TP.HCM',
        },
        {
            id: 'ORD002',
            userId: '2',
            customerName: 'Trần Thị B',
            items: [
                { bookId: '3', bookTitle: '1984', quantity: 3, price: 14.99 },
            ],
            totalAmount: 44.97,
            status: 'processing',
            orderDate: '2024-11-15',
            deliveryAddress: '456 Đường XYZ, Quận 3, TP.HCM',
        },
        {
            id: 'ORD003',
            userId: '4',
            customerName: 'Lê Văn C',
            items: [
                { bookId: '1', bookTitle: 'The Great Gatsby', quantity: 1, price: 15.99 },
            ],
            totalAmount: 15.99,
            status: 'pending',
            orderDate: '2024-11-20',
            deliveryAddress: '789 Đường DEF, Quận 5, TP.HCM',
        },
        {
            id: 'ORD004',
            userId: '1',
            customerName: 'Nguyễn Văn A',
            items: [
                { bookId: '2', bookTitle: 'To Kill a Mockingbird', quantity: 2, price: 18.99 },
            ],
            totalAmount: 37.98,
            status: 'shipped',
            orderDate: '2024-11-18',
            deliveryAddress: '123 Đường ABC, Quận 1, TP.HCM',
        },
    ]);

    const getStatusColor = (status: Order['status']) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status];
    };

    const getStatusText = (status: Order['status']) => {
        const texts = {
            pending: 'Chờ xử lý',
            processing: 'Đang xử lý',
            shipped: 'Đang giao',
            delivered: 'Đã giao',
            cancelled: 'Đã hủy',
        };
        return texts[status];
    };

    const columns = [
        { key: 'id', label: 'Mã đơn hàng' },
        { key: 'customerName', label: 'Khách hàng' },
        {
            key: 'items',
            label: 'Số lượng sản phẩm',
            render: (items: Order['items']) => items.length,
        },
        {
            key: 'totalAmount',
            label: 'Tổng tiền',
            render: (value: number) => (
                <span className="font-semibold text-green-600">${value.toFixed(2)}</span>
            ),
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (value: Order['status']) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(value)}`}>
                    {getStatusText(value)}
                </span>
            ),
        },
        { key: 'orderDate', label: 'Ngày đặt' },
    ];

    const handleView = (order: Order) => {
        console.log('View order:', order);
        alert(`Chi tiết đơn hàng ${order.id}\n\nKhách hàng: ${order.customerName}\nĐịa chỉ: ${order.deliveryAddress}\n\nSản phẩm:\n${order.items.map(item => `- ${item.bookTitle} x${item.quantity}: $${(item.price * item.quantity).toFixed(2)}`).join('\n')}\n\nTổng: $${order.totalAmount.toFixed(2)}`);
    };

    const handleEdit = (order: Order) => {
        console.log('Edit order:', order);
    };

    const filteredOrders = orders.filter(
        (order) =>
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Chờ xử lý</p>
                    <p className="text-2xl font-bold text-yellow-600">
                        {orders.filter((o) => o.status === 'pending').length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Đang xử lý</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {orders.filter((o) => o.status === 'processing').length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Đang giao</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {orders.filter((o) => o.status === 'shipped').length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Đã giao</p>
                    <p className="text-2xl font-bold text-green-600">
                        {orders.filter((o) => o.status === 'delivered').length}
                    </p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1 flex items-center bg-gray-100 rounded-lg px-4 py-2">
                        <Search size={20} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none ml-2 w-full"
                        />
                    </div>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="shipped">Đang giao</option>
                        <option value="delivered">Đã giao</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>
            </div>

            <Table
                columns={columns}
                data={filteredOrders}
                onView={handleView}
                onEdit={handleEdit}
            />

            <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                    Hiển thị {filteredOrders.length} trong tổng số {orders.length} đơn hàng
                </p>
            </div>
        </div>
    );
};

export default OrdersPage;
