import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import UsersPage from './pages/UsersPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="books" element={<BooksPage />} />
            <Route path="books/:id" element={<BookDetailPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="categories" element={<div className="text-2xl font-bold">Quản lý danh mục - Đang phát triển</div>} />
            <Route path="statistics" element={<div className="text-2xl font-bold">Thống kê - Đang phát triển</div>} />
            <Route path="settings" element={<div className="text-2xl font-bold">Cài đặt - Đang phát triển</div>} />
          </Route>

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
