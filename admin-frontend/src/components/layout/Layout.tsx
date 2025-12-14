import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} />
            <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

            <main className="lg:ml-64 mt-16 p-6">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
