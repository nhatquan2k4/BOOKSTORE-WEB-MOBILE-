import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import type { Book } from '../types';
import { bookService } from '../services';

const BooksPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;
    
    // Get filters from URL
    const authorId = searchParams.get('authorId');
    const categoryId = searchParams.get('categoryId');

    // Fetch books from API
    useEffect(() => {
        fetchBooks();
    }, [currentPage, searchTerm, authorId, categoryId]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await bookService.getAll({
                page: currentPage,
                pageSize: pageSize,
                search: searchTerm || undefined,
                authorId: authorId || undefined,
                categoryId: categoryId || undefined,
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

    const clearFilter = (filterType: 'author' | 'category') => {
        const params = new URLSearchParams(searchParams);
        if (filterType === 'author') {
            params.delete('authorId');
        } else {
            params.delete('categoryId');
        }
        setSearchParams(params);
        setCurrentPage(1);
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
            render: (value?: number) => value ? `${value.toLocaleString('vi-VN')}₫` : 'N/A'
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
    ];

    const handleEdit = (book: Book) => {
        console.log('Edit book:', book);
        // Implement edit logic
    };

    const handleDelete = async (book: Book) => {
        if (window.confirm(`Bạn có chắc muốn xóa sách "${book.title}"?`)) {
            try {
                await bookService.delete(book.id);
                alert('Xóa sách thành công!');
                fetchBooks(); // Reload list after delete
            } catch (err: any) {
                console.error('Error deleting book:', err);
                console.error('Error response:', err.response);
                
                let errorMessage = 'Không thể xóa sách';
                
                if (err.response) {
                    // Server responded with error
                    const status = err.response.status;
                    const data = err.response.data;
                    
                    if (status === 500) {
                        errorMessage = 'Lỗi server: Không thể xóa sách này. Có thể sách đang có ảnh, đơn hàng hoặc dữ liệu liên quan khác.';
                    } else if (status === 404) {
                        errorMessage = 'Sách không tồn tại hoặc đã bị xóa';
                    } else if (status === 403) {
                        errorMessage = 'Bạn không có quyền xóa sách này';
                    } else {
                        errorMessage = data?.message || data?.title || err.message || errorMessage;
                    }
                } else if (err.request) {
                    errorMessage = 'Không thể kết nối đến server';
                } else {
                    errorMessage = err.message || errorMessage;
                }
                
                alert(`Lỗi xóa sách:\n${errorMessage}\n\nVui lòng liên hệ quản trị viên hoặc kiểm tra xem sách có dữ liệu liên quan không.`);
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
                <button 
                    onClick={() => navigate('/books/create')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Thêm sách mới
                </button>
            </div>

            {/* Active Filters */}
            {(authorId || categoryId) && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {authorId && (
                        <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                            <span className="text-sm">Lọc theo tác giả</span>
                            <button
                                onClick={() => clearFilter('author')}
                                className="hover:bg-blue-200 rounded-full p-1"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    {categoryId && (
                        <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                            <span className="text-sm">Lọc theo thể loại</span>
                            <button
                                onClick={() => clearFilter('category')}
                                className="hover:bg-purple-200 rounded-full p-1"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </div>
            )}

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

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        itemsCount={filteredBooks.length}
                        onPageChange={setCurrentPage}
                        entityName="sách"
                    />
                </>
            )}
        </div>
    );
};

export default BooksPage;
