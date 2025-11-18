import { LogOut, User } from 'lucide-react';
import './Header.css';

export default function Header() {
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <header className="header">
            <div className="header-left">
                <h2>Admin Panel</h2>
            </div>
            <div className="header-right">
                <div className="user-info">
                    <User size={20} />
                    <span>Administrator</span>
                </div>
                <button onClick={handleLogout} className="btn-icon" title="Đăng xuất">
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
}
