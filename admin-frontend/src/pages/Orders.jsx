import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import { orderService } from '../services/bookService';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadOrders();
    }, [currentPage]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await orderService.getAll({
                pageNumber: currentPage,
                pageSize: 10,
            });
            setOrders(response.data.items || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { key: 'orderNumber', label: 'Mã đơn hàng' },
        { key: 'customerName', label: 'Khách hàng' },
        {
            key: 'totalAmount',
            label: 'Tổng tiền',
            render: (value) => `${value?.toLocaleString()}đ`
        },
        {
            key: 'orderDate',
            label: 'Ngày đặt',
            render: (value) => new Date(value).toLocaleDateString('vi-VN')
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (value) => (
                <span className={`badge badge-${getStatusColor(value)}`}>
                    {getStatusText(value)}
                </span>
            )
        },
    ];

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'warning',
            'Confirmed': 'info',
            'Shipping': 'primary',
            'Delivered': 'success',
            'Cancelled': 'danger',
        };
        return colors[status] || 'secondary';
    };

    const getStatusText = (status) => {
        const texts = {
            'Pending': 'Chờ xác nhận',
            'Confirmed': 'Đã xác nhận',
            'Shipping': 'Đang giao',
            'Delivered': 'Đã giao',
            'Cancelled': 'Đã hủy',
        };
        return texts[status] || status;
    };

    return (
        <div className="page-content">
            <div className="page-header">
                <h1 className="page-title">Quản lý Đơn hàng</h1>
            </div>

            <DataTable
                columns={columns}
                data={orders}
                onView={() => { }}
                loading={loading}
            />

            {!loading && totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
}
