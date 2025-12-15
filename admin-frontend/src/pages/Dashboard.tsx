import React from 'react';
import { BookOpen, Users, ShoppingCart, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const Dashboard: React.FC = () => {
    const stats = [
        {
            title: 'Tổng sách',
            value: '1,234',
            change: '+12%',
            isPositive: true,
            icon: BookOpen,
            color: 'bg-blue-500',
        },
        {
            title: 'Người dùng',
            value: '567',
            change: '+8%',
            isPositive: true,
            icon: Users,
            color: 'bg-green-500',
        },
        {
            title: 'Đơn hàng',
            value: '89',
            change: '-3%',
            isPositive: false,
            icon: ShoppingCart,
            color: 'bg-purple-500',
        },
        {
            title: 'Doanh thu',
            value: '$12,345',
            change: '+15%',
            isPositive: true,
            icon: DollarSign,
            color: 'bg-yellow-500',
        },
    ];

    const recentOrders = [
        { id: 'ORD001', customer: 'Nguyễn Văn A', amount: 50.97, status: 'Đã giao' },
        { id: 'ORD002', customer: 'Trần Thị B', amount: 44.97, status: 'Đang xử lý' },
        { id: 'ORD003', customer: 'Lê Văn C', amount: 15.99, status: 'Chờ xử lý' },
        { id: 'ORD004', customer: 'Nguyễn Văn A', amount: 37.98, status: 'Đang giao' },
    ];

    const topBooks = [
        { title: 'The Great Gatsby', sales: 234, revenue: '$3,741.66' },
        { title: 'To Kill a Mockingbird', sales: 189, revenue: '$3,589.11' },
        { title: '1984', sales: 156, revenue: '$2,338.44' },
        { title: 'Pride and Prejudice', sales: 145, revenue: '$2,318.55' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {stats.map((stat, index) => (
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
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                    <div>
                                        <p className="font-medium text-gray-800">{order.id}</p>
                                        <p className="text-sm text-gray-500">{order.customer}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-800">${order.amount.toFixed(2)}</p>
                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Selling Books */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">Sách bán chạy</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {topBooks.map((book, index) => (
                                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 font-semibold">{index + 1}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{book.title}</p>
                                            <p className="text-sm text-gray-500">{book.sales} bản</p>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-green-600">{book.revenue}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
