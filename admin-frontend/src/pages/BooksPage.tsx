import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import Table from '../components/common/Table';
import type { Book } from '../types';
import { bookService } from '../services';

const BooksPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    // Fetch books from API
    useEffect(() => {
        fetchBooks();
    }, [currentPage, searchTerm]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await bookService.getAll({
                page: currentPage,
                pageSize: pageSize,
                search: searchTerm || undefined,
            });
            setBooks(response.items);
            setTotalCount(response.totalCount);
        } catch (err: any) {
            console.error('Error fetching books:', err);
            setError(err.message || 'Không thể tải danh sách sách');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { key: 'title', label: 'Tên sách' },
        {
            key: 'authorNames',
            label: 'Tác giả',
            render: (value: string[]) => value.join(', ')
        },
        {
            key: 'categoryNames',
            label: 'Danh mục',
            render: (value: string[]) => value.join(', ')
        },
        {
            key: 'currentPrice',
            label: 'Giá',
            render: (value?: number) => value ? `$${value.toFixed(2)}` : 'N/A'
        },
        {
            key: 'stockQuantity',
            label: 'Tồn kho',
            render: (value?: number) => (
                <span className={!value || value < 20 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                    {value ?? 0}
                </span>
            )
        },
        { key: 'isbn', label: 'ISBN' },
    ];

    const handleEdit = (book: Book) => {
        console.log('Edit book:', book);
        // Implement edit logic
    };

    const handleDelete = async (book: Book) => {
        if (window.confirm(`Bạn có chắc muốn xóa sách "${book.title}"?`)) {
            try {
                await bookService.delete(book.id);
                fetchBooks(); // Reload list after delete
            } catch (err) {
                console.error('Error deleting book:', err);
                alert('Không thể xóa sách');
            }
        }
    };

    const handleView = (book: Book) => {
        navigate(`/books/${book.id}`);
    };

    const filteredBooks = books;

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý sách</h1>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus size={20} />
                    Thêm sách mới
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1 flex items-center bg-gray-100 rounded-lg px-4 py-2">
                        <Search size={20} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, tác giả, ISBN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none ml-2 w-full"
                        />
                    </div>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Tất cả danh mục</option>
                        <option value="classic">Classic</option>
                        <option value="fiction">Fiction</option>
                        <option value="science">Science Fiction</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                </div>
            ) : (
                <>
                    <Table
                        columns={columns}
                        data={filteredBooks}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                    />

                    <div className="mt-4 flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            Hiển thị {filteredBooks.length} trong tổng số {totalCount} sách
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-4 py-2 rounded-lg ${page === currentPage
                                        ? 'bg-blue-600 text-white'
                                        : 'border border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default BooksPage;
