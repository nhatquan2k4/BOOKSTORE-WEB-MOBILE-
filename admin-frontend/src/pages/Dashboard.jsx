import { useEffect, useState } from 'react';
import { Book, Users, ShoppingCart, DollarSign } from 'lucide-react';
import api from '../config/api';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
    });

    useEffect(() => {
        // Load statistics
        const loadStats = async () => {
            try {
                // You can create dedicated endpoints for dashboard stats
                const [books, users, orders] = await Promise.all([
                    api.get('/Book?pageSize=1'),
                    api.get('/User?pageSize=1'),
                    api.get('/Order?pageSize=1'),
                ]);

                setStats({
                    totalBooks: books.data.totalCount || 0,
                    totalUsers: users.data.totalCount || 0,
                    totalOrders: orders.data.totalCount || 0,
                    totalRevenue: 0, // Calculate from orders if needed
                });
            } catch (error) {
                console.error('Failed to load stats:', error);
            }
        };

        loadStats();
    }, []);

    const statCards = [
        {
            title: 'Tổng số sách',
            value: stats.totalBooks,
            icon: Book,
            color: '#3b82f6'
        },
        {
            title: 'Người dùng',
            value: stats.totalUsers,
            icon: Users,
            color: '#10b981'
        },
        {
            title: 'Đơn hàng',
            value: stats.totalOrders,
            icon: ShoppingCart,
            color: '#f59e0b'
        },
        {
            title: 'Doanh thu',
            value: `${stats.totalRevenue.toLocaleString()}đ`,
            icon: DollarSign,
            color: '#ef4444'
        },
    ];

    return (
        <div className="page-content">
            <h1 className="page-title">Dashboard</h1>

            <div className="stats-grid">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="stat-card">
                            <div className="stat-icon" style={{ backgroundColor: stat.color + '20' }}>
                                <Icon size={24} style={{ color: stat.color }} />
                            </div>
                            <div className="stat-info">
                                <h3>{stat.title}</h3>
                                <p className="stat-value">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h2>Sách mới nhất</h2>
                    <p>Danh sách sách được thêm gần đây</p>
                </div>

                <div className="dashboard-card">
                    <h2>Đơn hàng gần đây</h2>
                    <p>Các đơn hàng mới nhất</p>
                </div>
            </div>
        </div>
    );
}
