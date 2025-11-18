import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { bookService } from '../services/bookService';

export default function Books() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);

    const pageSize = 10;

    useEffect(() => {
        loadBooks();
    }, [currentPage, searchTerm]);

    const loadBooks = async () => {
        try {
            setLoading(true);
            const response = await bookService.getAll({
                pageNumber: currentPage,
                pageSize,
                searchTerm: searchTerm || undefined,
            });
            setBooks(response.data.items || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error('Failed to load books:', error);
            alert('Không thể tải danh sách sách');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (book) => {
        if (!confirm(`Bạn có chắc muốn xóa sách "${book.title}"?`)) return;

        try {
            await bookService.delete(book.id);
            alert('Xóa thành công!');
            loadBooks();
        } catch (error) {
            console.error('Failed to delete book:', error);
            alert('Không thể xóa sách');
        }
    };

    const handleEdit = (book) => {
        setSelectedBook(book);
        setShowModal(true);
    };

    const handleView = (book) => {
        setSelectedBook(book);
        setShowModal(true);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadBooks();
    };

    const columns = [
        { key: 'title', label: 'Tên sách' },
        { key: 'isbn', label: 'ISBN' },
        {
            key: 'authorNames',
            label: 'Tác giả',
            render: (value) => value?.join(', ') || 'N/A'
        },
        {
            key: 'publisherName',
            label: 'Nhà xuất bản'
        },
        {
            key: 'currentPrice',
            label: 'Giá',
            render: (value) => value ? `${value.toLocaleString()}đ` : 'N/A'
        },
        {
            key: 'isAvailable',
            label: 'Trạng thái',
            render: (value) => (
                <span className={`badge ${value ? 'badge-success' : 'badge-danger'}`}>
                    {value ? 'Còn hàng' : 'Hết hàng'}
                </span>
            )
        },
    ];

    return (
        <div className="page-content">
            <div className="page-header">
                <h1 className="page-title">Quản lý Sách</h1>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    <Plus size={20} />
                    Thêm sách mới
                </button>
            </div>

            <div className="page-filters">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sách..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="btn btn-secondary">
                        <Search size={20} />
                        Tìm kiếm
                    </button>
                </form>
            </div>

            <DataTable
                columns={columns}
                data={books}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                loading={loading}
            />

            {!loading && totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedBook(null);
                }}
                title={selectedBook ? 'Chi tiết sách' : 'Thêm sách mới'}
                size="large"
            >
                <div className="form-container">
                    {selectedBook ? (
                        <div className="book-details">
                            <h3>{selectedBook.title}</h3>
                            <p><strong>ISBN:</strong> {selectedBook.isbn}</p>
                            <p><strong>Tác giả:</strong> {selectedBook.authorNames?.join(', ')}</p>
                            <p><strong>Nhà xuất bản:</strong> {selectedBook.publisherName}</p>
                            <p><strong>Giá:</strong> {selectedBook.currentPrice?.toLocaleString()}đ</p>
                        </div>
                    ) : (
                        <p>Form thêm sách sẽ được implement...</p>
                    )}
                </div>
            </Modal>
        </div>
    );
}
