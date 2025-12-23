import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Truck, Package } from 'lucide-react';
import Table from '../components/common/Table';
import OrderDetailModal from '../components/common/OrderDetailModal';
import { orderService } from '../services';
import orderManagementService from '../services/orderManagementService';
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
        const statusStr = status.toLowerCase();
        const colors: Record<string, string> = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'processing': 'bg-blue-100 text-blue-800',
            'shipping': 'bg-purple-100 text-purple-800',
            'shipped': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-green-100 text-green-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
        };
        return colors[statusStr] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status: Order['status']) => {
        const statusStr = status.toLowerCase();
        const texts: Record<string, string> = {
            'pending': 'Chờ xác nhận',
            'confirmed': 'Đã xác nhận',
            'processing': 'Đang xử lý',
            'shipping': 'Đang giao',
            'shipped': 'Đang giao',
            'delivered': 'Đã giao',
            'completed': 'Hoàn thành',
            'cancelled': 'Đã hủy',
        };
        return texts[statusStr] || status;
    };

    // Hàm xử lý xác nhận đơn hàng
    const handleConfirmOrder = async (orderId: string) => {
        if (!confirm('Xác nhận đơn hàng này?')) return;
        
        try {
            await orderManagementService.confirmOrder(orderId);
            alert('Đơn hàng đã được xác nhận!');
            fetchOrders(); // Reload danh sách
        } catch (error) {
            console.error('Error confirming order:', error);
            alert('Có lỗi khi xác nhận đơn hàng');
        }
    };

    // Hàm xử lý chuyển sang trạng thái đang giao
    const handleMarkAsShipping = async (orderId: string) => {
        if (!confirm('Đánh dấu đơn hàng đang giao?')) return;
        
        try {
            await orderManagementService.markAsShipping(orderId);
            alert('Đơn hàng đã được chuyển sang trạng thái đang giao!');
            fetchOrders();
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Có lỗi khi cập nhật đơn hàng');
        }
    };

    // Hàm xử lý đánh dấu đã giao
    const handleMarkAsDelivered = async (orderId: string) => {
        if (!confirm('Xác nhận đơn hàng đã được giao?')) return;
        
        try {
            await orderManagementService.markAsDelivered(orderId);
            alert('Đơn hàng đã được giao thành công!');
            fetchOrders();
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Có lỗi khi cập nhật đơn hàng');
        }
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
            label: 'Số lượng SP',
            render: (items: Order['items'] | undefined) => items?.length || 0,
        },
        {
            key: 'totalAmount',
            label: 'Tổng tiền',
            render: (value: number | undefined) => (
                <span className="font-semibold text-green-600">
                    {value?.toLocaleString('vi-VN')}₫
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
        {
            key: 'actions',
            label: 'Hành động',
            render: (_: any, row: Order) => {
                const status = row.status.toLowerCase();
                
                return (
                    <div className="flex gap-2">
                        {/* Button Xác nhận - chỉ hiện khi Pending */}
                        {status === 'pending' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleConfirmOrder(row.id);
                                }}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                                title="Xác nhận đơn hàng"
                            >
                                <CheckCircle size={14} />
                                <span>Xác nhận</span>
                            </button>
                        )}
                        
                        {/* Button Giao hàng - chỉ hiện khi Confirmed */}
                        {status === 'confirmed' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsShipping(row.id);
                                }}
                                className="flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-xs"
                                title="Chuyển sang đang giao"
                            >
                                <Truck size={14} />
                                <span>Giao hàng</span>
                            </button>
                        )}
                        
                        {/* Button Đã giao - chỉ hiện khi Shipping */}
                        {status === 'shipping' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsDelivered(row.id);
                                }}
                                className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                                title="Xác nhận đã giao"
                            >
                                <Package size={14} />
                                <span>Đã giao</span>
                            </button>
                        )}
                        
                        {/* Button Xem chi tiết - luôn hiện */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleView(row);
                            }}
                            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                        >
                            Xem
                        </button>
                    </div>
                );
            },
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
                    <p className="text-gray-500 text-sm">Chờ xác nhận</p>
                    <p className="text-2xl font-bold text-yellow-600">
                        {orders.filter((o) => o.status.toLowerCase() === 'pending').length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Đã xác nhận</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {orders.filter((o) => o.status.toLowerCase() === 'confirmed').length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Đang giao</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {orders.filter((o) => o.status.toLowerCase() === 'shipping').length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Đã giao</p>
                    <p className="text-2xl font-bold text-green-600">
                        {orders.filter((o) => ['delivered', 'completed'].includes(o.status.toLowerCase())).length}
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
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="shipping">Đang giao</option>
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
