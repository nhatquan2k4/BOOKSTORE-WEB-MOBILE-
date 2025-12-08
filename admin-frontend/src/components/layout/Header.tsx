import React from 'react';
import { Menu, X, Bell, User, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
    const { user } = useAuth();

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

                    <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <User size={16} className="text-white" />
                        </div>
                        <span className="hidden md:block font-medium">{user?.fullName || 'Admin'}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
