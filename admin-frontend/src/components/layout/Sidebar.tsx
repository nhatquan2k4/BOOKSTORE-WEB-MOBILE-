import { Link, useLocation } from 'react-router-dom';
import {
    BookOpen,
    Users,
    ShoppingCart,
    LayoutDashboard,
    Tag,
    UserCircle,
    Building2,
    Settings
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const location = useLocation(); const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: BookOpen, label: 'Quản lý sách', path: '/books' },
        { icon: UserCircle, label: 'Quản lý tác giả', path: '/authors' },
        { icon: Building2, label: 'Quản lý NXB', path: '/publishers' },
        { icon: Tag, label: 'Quản lý thể loại', path: '/categories' },
        { icon: Users, label: 'Quản lý người dùng', path: '/users' },
        { icon: ShoppingCart, label: 'Quản lý đơn hàng', path: '/orders' },
        { icon: Settings, label: 'Cài đặt', path: '/settings' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => { }}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-30 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-center gap-3 border-b border-gray-800 px-4">
                    <img 
                        src="/logo.png" 
                        alt="BỜ ÚC BÚC Logo" 
                        className="w-10 h-10 object-contain"
                    />
                    <h1 className="text-xl font-bold">BỜ ÚC BÚC</h1>
                </div>

                {/* Menu Items */}
                <nav className="mt-6 px-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
