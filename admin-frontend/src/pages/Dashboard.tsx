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
    const [topBooks, setTopBooks] = useState<any[]>([]);
    const [revenueByDay, setRevenueByDay] = useState<{ date: string; revenue: number }[]>([]);

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

            // Convert to array, sort by quantity sold, and take top 4
            const topBooksArray = Array.from(bookSalesMap.values())
                .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
                .slice(0, 4)
                .map(b => ({
                    ...b,
                    totalRevenue: undefined // remove reliance on revenue in UI
                }));

            console.log('🏆 Top selling books by quantity:', topBooksArray);
            console.log('📊 Setting topBooks state with', topBooksArray.length, 'books');
            setTopBooks(topBooksArray);

        } catch (error) {
            console.error('❌ Error calculating top books from orders:', error);
            setTopBooks([]);
        }
    };

    // Aggregate revenue per day by paginating orders (client-side)
    const fetchRevenueByDays = async (days = 30) => {
        try {
            const pageSize = 500;
            let page = 1;
            let allOrders: any[] = [];

            while (true) {
                const resp = await orderService.getAll({ page, pageSize });
                const items = resp.data || resp.items || [];
                allOrders.push(...items);
                if (items.length < pageSize) break;
                page++;
            }

            // Keep only paid/completed/delivered orders
            const paidOrders = allOrders.filter((o: any) => {
                const status = (o.status || '').toLowerCase();
                const payment = (o.paymentStatus || '').toLowerCase();
                return status === 'paid' || status === 'completed' || status === 'delivered' || payment === 'paid';
            });

            // Aggregate totals by date (YYYY-MM-DD)
            const map = new Map<string, number>();
            for (const o of paidOrders) {
                const created = o.createdAt || o.created || o.orderDate || o.createdAtUtc;
                const dt = created ? new Date(created) : new Date();
                const key = dt.toISOString().slice(0, 10);
                const total = Number(o.totalAmount || o.total || o.grandTotal || 0) || 0;
                map.set(key, (map.get(key) || 0) + total);
            }

            // Build last N days array
            const arr: { date: string; revenue: number }[] = [];
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const key = d.toISOString().slice(0, 10);
                arr.push({ date: key, revenue: map.get(key) || 0 });
            }

            setRevenueByDay(arr);
        } catch (err) {
            console.error('Error fetching revenue by days:', err);
            setRevenueByDay([]);
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Fetch all dashboard data with individual error handling
            const [orderStatsData, revenueData, booksCountData, usersCountData] = await Promise.allSettled([
                dashboardService.getOrderStats().catch(err => {
                    console.error('Error fetching order stats:', err);
                    return null;
                }),
                dashboardService.getRevenue().catch(err => {
                    console.error('Error fetching revenue:', err);
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

            // Fetch revenue by day (30 days)
            await fetchRevenueByDays(30);

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

    // ...status helpers removed (not used in dashboard chart)

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
                {/* Revenue by Day Chart */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">Doanh thu theo ngày</h2>
                        <p className="text-sm text-gray-500 mt-1">Tổng doanh thu trong 30 ngày gần nhất</p>
                    </div>
                    <div className="p-6">
                        {(!revenueByDay || revenueByDay.length === 0) ? (
                            <p className="text-gray-500 text-center py-4">Chưa có dữ liệu doanh thu</p>
                        ) : (
                            <div className="w-full h-48">
                                {/* Simple SVG line chart */}
                                <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="w-full h-full">
                                    {/* Compute points */}
                                    {(() => {
                                        // Use only non-zero revenue days for line connections
                                        const nonZero = revenueByDay
                                            .map((r, i) => ({ ...r, index: i }))
                                            .filter(r => r.revenue > 0);
                                        if (nonZero.length === 0) return null;

                                        const values = nonZero.map(r => r.revenue);
                                        const max = Math.max(...values, 1);
                                        const stepX = 600 / Math.max(1, values.length - 1);
                                        const points = values.map((v, i) => `${i * stepX},${200 - (v / max) * 180}`).join(' ');

                                        return (
                                            <>
                                                <polyline fill="none" stroke="#ec4899" strokeWidth="3" points={points} strokeLinejoin="round" strokeLinecap="round" />
                                                {values.map((v, i) => (
                                                    <circle key={i} cx={i * stepX} cy={200 - (v / max) * 180} r={3} fill="#ec4899" />
                                                ))}
                                            </>
                                        );
                                    })()}
                                </svg>
                                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                                    <span>{revenueByDay[0].date}</span>
                                    <span>{revenueByDay[Math.floor(revenueByDay.length/2)].date}</span>
                                    <span>{revenueByDay[revenueByDay.length - 1].date}</span>
                                </div>
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
                            <div className="w-full overflow-x-auto">
                                <div className="flex items-end space-x-6 py-4 px-2" style={{ minWidth: Math.max(300, topBooks.length * 160) }}>
                                    {topBooks.map((book, index) => {
                                        const maxQty = Math.max(...topBooks.map(b => b.totalQuantitySold || 0));
                                        const heightPct = maxQty > 0 ? ((book.totalQuantitySold || 0) / maxQty) * 100 : 0;
                                        const colors = [
                                            'bg-blue-500',
                                            'bg-purple-500',
                                            'bg-pink-500',
                                            'bg-orange-500',
                                        ];

                                        return (
                                            <div key={index} className="flex flex-col items-center w-40">
                                                <div className="w-full h-48 flex items-end justify-center">
                                                    <div
                                                        className={`${colors[index % colors.length]} w-3/4 rounded-t-md transition-all duration-700`}
                                                        style={{ height: `${heightPct}%` }}
                                                        title={`${book.totalQuantitySold} bản`}
                                                    />
                                                </div>
                                                <div className="mt-3 text-center w-full px-1">
                                                    <p className="text-sm font-medium text-gray-800 truncate">{book.bookTitle}</p>
                                                    <p className="text-xs text-gray-500">{book.totalQuantitySold} bản</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
