import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Book,
    Users,
    ShoppingCart,
    Package,
    Star,
    FolderTree,
    UserCircle,
    Building,
    Warehouse,
} from 'lucide-react';
import './Sidebar.css';

const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/books', icon: Book, label: 'Quản lý Sách' },
    { path: '/categories', icon: FolderTree, label: 'Danh mục' },
    { path: '/authors', icon: UserCircle, label: 'Tác giả' },
    { path: '/publishers', icon: Building, label: 'Nhà xuất bản' },
    { path: '/orders', icon: ShoppingCart, label: 'Đơn hàng' },
    { path: '/users', icon: Users, label: 'Người dùng' },
    { path: '/stock', icon: Warehouse, label: 'Kho hàng' },
    { path: '/reviews', icon: Star, label: 'Đánh giá' },
];

export default function Sidebar() {
    const location = useLocation();

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Book size={32} />
                <h1>BookStore Admin</h1>
            </div>
            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
