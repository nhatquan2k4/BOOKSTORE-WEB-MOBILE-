import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Table from '../components/common/Table';
import OrderDetailModal from '../components/common/OrderDetailModal';
import { orderService } from '../services';
import type { Order } from '../types';

const OrdersPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0,
    });

    useEffect(() => {
        fetchOrders();
    }, [pagination.page, statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: pagination.page,
                pageSize: pagination.pageSize,
            };
            
            if (statusFilter) {
                params.status = statusFilter;
            }

            const response = await orderService.getAll(params);
            
            setOrders(response.data || response.items || []);
            setPagination(prev => ({
                ...prev,
                total: response.total || response.totalCount || 0,
            }));
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: Order['status']) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            completed: 'bg-green-100 text-green-800',
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
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy',
        };
        return texts[status];
    };

    const columns = [
        { 
            key: 'orderNumber', 
            label: 'Mã đơn hàng',
            render: (value: string | undefined, row: Order) => value || row.id
        },
        { 
            key: 'customerName', 
            label: 'Khách hàng',
            render: (value: string | undefined) => value || 'N/A'
        },
        {
            key: 'items',
            label: 'Số lượng sản phẩm',
            render: (items: Order['items'] | undefined) => items?.length || 0,
        },
        {
            key: 'totalAmount',
            label: 'Tổng tiền',
            render: (value: number | undefined) => (
                <span className="font-semibold text-green-600">
                    ${value?.toFixed(2) || '0.00'}
                </span>
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
        { 
            key: 'orderDate', 
            label: 'Ngày đặt',
            render: (value: string | undefined, row: Order) => {
                const date = value || row.createdAt;
                return date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A';
            }
        },
    ];

    const handleView = async (order: Order) => {
        try {
            // Fetch full order details
            const response = await orderService.getById(order.id);
            setSelectedOrder(response.data || response);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error fetching order details:', error);
            // Fallback to showing basic order info
            setSelectedOrder(order);
            setIsModalOpen(true);
        }
    };

    const handleEdit = (order: Order) => {
        console.log('Edit order:', order);
        // Implement edit functionality if needed
    };

    const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const filteredOrders = orders.filter(
        (order) => {
            const searchLower = searchTerm.toLowerCase();
            const orderNumber = order.orderNumber || order.id || '';
            const customerName = order.customerName || '';
            
            return (
                orderNumber.toLowerCase().includes(searchLower) ||
                customerName.toLowerCase().includes(searchLower)
            );
        }
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
                        {orders.filter((o) => o.status === 'delivered' || o.status === 'completed').length}
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
                    <select 
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="shipped">Đang giao</option>
                        <option value="delivered">Đã giao</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
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
                        data={filteredOrders}
                        onView={handleView}
                        onEdit={handleEdit}
                    />

                    <div className="mt-4 flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            Hiển thị {filteredOrders.length} trong tổng số {pagination.total} đơn hàng
                        </p>
                        {pagination.total > pagination.pageSize && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                    disabled={pagination.page === 1}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                                >
                                    Trước
                                </button>
                                <span className="px-4 py-2">
                                    Trang {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)}
                                </span>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            <OrderDetailModal
                order={selectedOrder}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedOrder(null);
                }}
            />
        </div>
    );
};

export default OrdersPage;
