import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Bell, User, Search, LogOut, Settings, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-md h-16 fixed top-0 right-0 left-0 lg:left-64 z-10 transition-all duration-300">
            <div className="h-full px-4 flex items-center justify-between">
                {/* Left section */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 w-96">
                        <Search size={20} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="bg-transparent border-none outline-none ml-2 w-full"
                        />
                    </div>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-4">
                    <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-2 transition-colors"
                        >
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <User size={16} className="text-white" />
                            </div>
                            <span className="hidden md:block font-medium">{user?.fullName || 'Admin'}</span>
                        </button>

                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <div className="px-4 py-2 border-b border-gray-200">
                                    <p className="text-sm font-medium text-gray-900">{user?.fullName || 'Admin'}</p>
                                    <p className="text-xs text-gray-500">{user?.email || 'admin@bookstore.vn'}</p>
                                </div>
                                
                                <button
                                    onClick={() => {
                                        setShowDropdown(false);
                                        // Navigate to profile or settings
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <UserCircle size={16} />
                                    <span>Hồ sơ</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setShowDropdown(false);
                                        navigate('/settings');
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <Settings size={16} />
                                    <span>Cài đặt</span>
                                </button>

                                <div className="border-t border-gray-200 mt-2"></div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={16} />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
