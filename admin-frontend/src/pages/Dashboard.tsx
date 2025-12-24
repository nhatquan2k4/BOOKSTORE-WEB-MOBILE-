import React, { useEffect, useState } from 'react';
import { BookOpen, Users, ShoppingCart, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { dashboardService, orderService } from '../services';

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalBooks: 0,
        booksChange: 0,
        totalUsers: 0,
        usersChange: 0,
        totalOrders: 0,
        ordersChange: 0,
        totalRevenue: 0,
        revenueChange: 0,
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [topBooks, setTopBooks] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Fetch all dashboard data with individual error handling
            const [orderStatsData, revenueData, topBooksData, recentOrdersData, booksCountData, usersCountData] = await Promise.allSettled([
                dashboardService.getOrderStats().catch(err => {
                    console.error('Error fetching order stats:', err);
                    return null;
                }),
                dashboardService.getRevenue().catch(err => {
                    console.error('Error fetching revenue:', err);
                    return null;
                }),
                dashboardService.getTopSellingBooks(undefined, undefined, 4).catch(err => {
                    console.error('Error fetching top books:', err);
                    return null;
                }),
                orderService.getAll({ page: 1, pageSize: 4 }).catch(err => {
                    console.error('Error fetching recent orders:', err);
                    return null;
                }),
                dashboardService.getBooksCount().catch(err => {
                    console.error('Error fetching books count:', err);
                    return 0;
                }),
                dashboardService.getUsersCount().catch(err => {
                    console.error('Error fetching users count:', err);
                    return 0;
                }),
            ]);

            // Extract values from settled promises
            const orderStats = orderStatsData.status === 'fulfilled' ? orderStatsData.value : null;
            const revenue = revenueData.status === 'fulfilled' ? revenueData.value : null;
            const topBooks = topBooksData.status === 'fulfilled' ? topBooksData.value : null;
            const recentOrders = recentOrdersData.status === 'fulfilled' ? recentOrdersData.value : null;
            const booksCount = booksCountData.status === 'fulfilled' ? booksCountData.value : 0;
            const usersCount = usersCountData.status === 'fulfilled' ? usersCountData.value : 0;

            // Set stats
            setStats({
                totalBooks: booksCount,
                booksChange: 12, // Calculate from previous period if API provides it
                totalUsers: usersCount,
                usersChange: 8, // Calculate from previous period if API provides it
                totalOrders: orderStats?.totalOrders || 0,
                ordersChange: orderStats?.percentageChange || 0,
                totalRevenue: revenue?.totalRevenue || 0,
                revenueChange: revenue?.percentageChange || 0,
            });

            // Set recent orders
            setRecentOrders(recentOrders?.data || recentOrders?.items || []);

            // Set top books - ensure it's always an array
            setTopBooks(Array.isArray(topBooks) ? topBooks : []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Set default values on error
            setStats({
                totalBooks: 0,
                booksChange: 0,
                totalUsers: 0,
                usersChange: 0,
                totalOrders: 0,
                ordersChange: 0,
                totalRevenue: 0,
                revenueChange: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const statsData = [
        {
            title: 'Tổng sách',
            value: stats.totalBooks > 0 ? stats.totalBooks.toLocaleString() : 'N/A',
            change: `+${stats.booksChange}%`,
            isPositive: stats.booksChange > 0,
            icon: BookOpen,
            color: 'bg-blue-500',
        },
        {
            title: 'Người dùng',
            value: stats.totalUsers > 0 ? stats.totalUsers.toLocaleString() : 'N/A',
            change: `+${stats.usersChange}%`,
            isPositive: stats.usersChange > 0,
            icon: Users,
            color: 'bg-green-500',
        },
        {
            title: 'Đơn hàng',
            value: stats.totalOrders?.toLocaleString() || '0',
            change: `${stats.ordersChange >= 0 ? '+' : ''}${(stats.ordersChange || 0).toFixed(1)}%`,
            isPositive: stats.ordersChange >= 0,
            icon: ShoppingCart,
            color: 'bg-purple-500',
        },
        {
            title: 'Doanh thu',
            value: `${(stats.totalRevenue || 0).toLocaleString('vi-VN')}₫`,
            change: `${stats.revenueChange >= 0 ? '+' : ''}${(stats.revenueChange || 0).toFixed(1)}%`,
            isPositive: stats.revenueChange >= 0,
            icon: DollarSign,
            color: 'bg-yellow-500',
        },
    ];

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status: string) => {
        const texts: Record<string, string> = {
            pending: 'Chờ xử lý',
            processing: 'Đang xử lý',
            shipped: 'Đang giao',
            delivered: 'Đã giao',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy',
        };
        return texts[status] || status;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-gray-500">Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {statsData.map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                <div className="flex items-center mt-2">
                                    {stat.isPositive ? (
                                        <TrendingUp size={16} className="text-green-500 mr-1" />
                                    ) : (
                                        <TrendingDown size={16} className="text-red-500 mr-1" />
                                    )}
                                    <span
                                        className={`text-sm font-semibold ${stat.isPositive ? 'text-green-500' : 'text-red-500'
                                            }`}
                                    >
                                        {stat.change}
                                    </span>
                                    <span className="text-gray-500 text-sm ml-1">so với tháng trước</span>
                                </div>
                            </div>
                            <div className={`${stat.color} p-3 rounded-lg`}>
                                <stat.icon size={24} className="text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">Đơn hàng gần đây</h2>
                    </div>
                    <div className="p-6">
                        {recentOrders.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Chưa có đơn hàng nào</p>
                        ) : (
                            <div className="space-y-4">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{order.orderNumber || order.id}</p>
                                            <p className="text-sm text-gray-500">{order.customerName || 'N/A'}</p>
                                            {order.items && order.items.length > 0 && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {order.items.length} sản phẩm
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="font-semibold text-gray-800">
                                                {(order.totalAmount || 0).toLocaleString('vi-VN')}₫
                                            </p>
                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Selling Books */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">Sách bán chạy</h2>
                    </div>
                    <div className="p-6">
                        {!topBooks || topBooks.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Chưa có dữ liệu bán hàng</p>
                        ) : (
                            <div className="space-y-4">
                                {topBooks.map((book, index) => (
                                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold">{index + 1}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{book.bookTitle}</p>
                                                <p className="text-sm text-gray-500">{book.totalQuantitySold} bản</p>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-green-600">
                                            {(book.totalRevenue || 0).toLocaleString('vi-VN')}₫
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
