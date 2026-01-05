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

    // Function to calculate top selling books from paid orders
    const calculateTopBooksFromOrders = async () => {
        try {
            console.log('📊 Calculating top books from orders...');
            
            // Fetch all completed/delivered orders (paid orders)
            const response = await orderService.getAll({
                page: 1,
                pageSize: 1000, // Get enough orders
            });

            const allOrders = response.data || response.items || [];
            console.log(`📦 Total orders fetched: ${allOrders.length}`);
            console.log('Sample order:', allOrders[0]);

            // Filter only paid/completed/delivered orders
            const paidOrders = allOrders.filter((order: any) => {
                const status = order.status?.toLowerCase();
                const paymentStatus = order.paymentStatus?.toLowerCase();
                
                // Check status first (more reliable)
                const isPaid = status === 'paid' || 
                              status === 'completed' || 
                              status === 'delivered' ||
                              paymentStatus === 'paid';
                
                console.log(`Order ${order.id}: status=${status}, paymentStatus=${paymentStatus}, isPaid=${isPaid}`);
                return isPaid;
            });
            console.log(`💰 Paid orders: ${paidOrders.length}`);

            if (paidOrders.length === 0) {
                console.warn('⚠️ No paid orders found! Setting empty top books.');
                setTopBooks([]);
                return;
            }

            // Aggregate book sales data
            const bookSalesMap = new Map<string, {
                bookId: string;
                bookTitle: string;
                totalQuantitySold: number;
                totalRevenue: number;
            }>();

            // Process each paid order
            for (const order of paidOrders) {
                try {
                    // Fetch order details to get items
                    const detailResponse = await orderService.getById(order.id);
                    const orderDetail = detailResponse.data || detailResponse;
                    const items = orderDetail.items || [];
                    
                    console.log(`📄 Order ${order.id} has ${items.length} items:`, items);

                    // Aggregate each book item
                    items.forEach((item: any) => {
                        const bookId = item.bookId || '';
                        const bookTitle = item.bookTitle || item.title || 'Unknown Book';
                        const quantity = item.quantity || 0;
                        const price = item.price || item.unitPrice || 0;
                        const revenue = quantity * price;

                        console.log(`  - Book: ${bookTitle}, Qty: ${quantity}, Price: ${price}, Revenue: ${revenue}`);

                        if (bookId && bookTitle !== 'Unknown Book') {
                            if (bookSalesMap.has(bookId)) {
                                const existing = bookSalesMap.get(bookId)!;
                                existing.totalQuantitySold += quantity;
                                existing.totalRevenue += revenue;
                            } else {
                                bookSalesMap.set(bookId, {
                                    bookId,
                                    bookTitle,
                                    totalQuantitySold: quantity,
                                    totalRevenue: revenue,
                                });
                            }
                        }
                    });
                } catch (err) {
                    console.error(`Failed to get details for order ${order.id}:`, err);
                }
            }

            // Convert to array, sort by revenue, and take top 4
            const topBooksArray = Array.from(bookSalesMap.values())
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .slice(0, 4);

            console.log('🏆 Top selling books:', topBooksArray);
            console.log('📊 Setting topBooks state with', topBooksArray.length, 'books');
            setTopBooks(topBooksArray);

        } catch (error) {
            console.error('❌ Error calculating top books from orders:', error);
            setTopBooks([]);
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Fetch all dashboard data with individual error handling
            const [orderStatsData, revenueData, recentOrdersData, booksCountData, usersCountData] = await Promise.allSettled([
                dashboardService.getOrderStats().catch(err => {
                    console.error('Error fetching order stats:', err);
                    return null;
                }),
                dashboardService.getRevenue().catch(err => {
                    console.error('Error fetching revenue:', err);
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

            // Calculate top selling books from paid orders
            await calculateTopBooksFromOrders();
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
                                            <p className="text-sm text-gray-500">{order.customerName || ''}</p>
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

                {/* Top Selling Books - Bar Chart from Real Orders */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">Sách bán chạy nhất</h2>
                        <p className="text-sm text-gray-500 mt-1">Từ đơn hàng đã thanh toán</p>
                    </div>
                    <div className="p-6">
                        {!topBooks || topBooks.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Chưa có dữ liệu bán hàng</p>
                        ) : (
                            <div className="space-y-5">
                                {topBooks.map((book, index) => {
                                    const maxRevenue = Math.max(...topBooks.map(b => b.totalRevenue || 0));
                                    const percentage = maxRevenue > 0 ? ((book.totalRevenue || 0) / maxRevenue) * 100 : 0;
                                    const colors = [
                                        'bg-gradient-to-r from-blue-500 to-blue-600',
                                        'bg-gradient-to-r from-purple-500 to-purple-600',
                                        'bg-gradient-to-r from-pink-500 to-pink-600',
                                        'bg-gradient-to-r from-orange-500 to-orange-600',
                                    ];
                                    
                                    return (
                                        <div key={index} className="relative">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                                                        {index + 1}
                                                    </span>
                                                    <p className="font-medium text-gray-800 truncate flex-1">
                                                        {book.bookTitle}
                                                    </p>
                                                </div>
                                                <p className="font-bold text-gray-900 ml-3 flex-shrink-0">
                                                    {(book.totalRevenue || 0).toLocaleString('vi-VN')}₫
                                                </p>
                                            </div>
                                            <div className="relative w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                                                <div 
                                                    className={`h-full ${colors[index % colors.length]} rounded-lg transition-all duration-1000 ease-out flex items-center justify-between px-3`}
                                                    style={{ 
                                                        width: `${percentage}%`,
                                                        animation: `slideIn 0.8s ease-out ${index * 0.1}s both`
                                                    }}
                                                >
                                                    <span className="text-xs font-semibold text-white">
                                                        {book.totalQuantitySold} bản
                                                    </span>
                                                    {percentage > 20 && (
                                                        <span className="text-xs font-bold text-white opacity-80">
                                                            {percentage.toFixed(0)}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <style>{`
                        @keyframes slideIn {
                            from {
                                width: 0%;
                                opacity: 0;
                            }
                            to {
                                opacity: 1;
                            }
                        }
                    `}</style>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
