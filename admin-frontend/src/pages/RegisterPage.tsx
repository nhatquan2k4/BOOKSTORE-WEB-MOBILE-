import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const RegisterPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="text-white" size={28} />
                        </div>
                        <h1 className="text-3xl font-bold text-white">BookStore Admin</h1>
                    </div>
                    <p className="text-gray-400">Tạo tài khoản quản trị viên</p>
                </div>

                {/* Register Form */}
                <div className="bg-white rounded-lg shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Đăng ký</h2>

                    <div className="text-center py-8">
                        <p className="text-gray-600 text-lg">
                            Vui lòng liên hệ quản trị viên để tạo tài khoản
                        </p>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
