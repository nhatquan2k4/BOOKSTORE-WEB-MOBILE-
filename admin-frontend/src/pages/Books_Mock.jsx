import { useState } from 'react';
import { Edit, Trash2, Eye, Plus } from 'lucide-react';

export default function Books() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Mock data
    const mockBooks = [
        { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', publisher: 'Scribner', price: 299000, stock: 45, isbn: '978-0743273565', publishedYear: 2004 },
        { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', publisher: 'J.B. Lippincott', price: 350000, stock: 32, isbn: '978-0061120084', publishedYear: 2006 },
        { id: 3, title: '1984', author: 'George Orwell', category: 'Science Fiction', publisher: 'Secker & Warburg', price: 275000, stock: 58, isbn: '978-0451524935', publishedYear: 1949 },
        { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Romance', publisher: 'T. Egerton', price: 320000, stock: 28, isbn: '978-0141439518', publishedYear: 1813 },
        { id: 5, title: 'The Catcher in the Rye', author: 'J.D. Salinger', category: 'Fiction', publisher: 'Little, Brown', price: 285000, stock: 41, isbn: '978-0316769488', publishedYear: 1951 },
        { id: 6, title: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K. Rowling', category: 'Fantasy', publisher: 'Scholastic', price: 450000, stock: 125, isbn: '978-0439708180', publishedYear: 1998 },
        { id: 7, title: 'The Hobbit', author: 'J.R.R. Tolkien', category: 'Fantasy', publisher: 'George Allen & Unwin', price: 380000, stock: 67, isbn: '978-0547928227', publishedYear: 1937 },
        { id: 8, title: 'Fahrenheit 451', author: 'Ray Bradbury', category: 'Science Fiction', publisher: 'Ballantine Books', price: 265000, stock: 35, isbn: '978-1451673319', publishedYear: 1953 },
        { id: 9, title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', category: 'Fantasy', publisher: 'Allen & Unwin', price: 550000, stock: 89, isbn: '978-0544003415', publishedYear: 1954 },
        { id: 10, title: 'Animal Farm', author: 'George Orwell', category: 'Political Fiction', publisher: 'Secker & Warburg', price: 180000, stock: 72, isbn: '978-0451526342', publishedYear: 1945 },
    ];

    const filteredBooks = mockBooks.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentBooks = filteredBooks.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="page-content">
            <div className="items-header">
                <h1 className="page-title">Quản lý Sách</h1>
            </div>

            <div className="table-container">
                <div className="table-header-bar">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sách..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="table-search"
                    />
                    <button className="btn-primary">
                        <Plus size={18} />
                        Thêm sách mới
                    </button>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>Tiêu đề</th>
                            <th>Tác giả</th>
                            <th>Danh mục</th>
                            <th>Nhà xuất bản</th>
                            <th style={{ width: '120px' }}>Giá</th>
                            <th style={{ width: '80px' }}>Tồn kho</th>
                            <th style={{ width: '120px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentBooks.length > 0 ? (
                            currentBooks.map((book, index) => (
                                <tr key={book.id}>
                                    <td>{startIndex + index + 1}</td>
                                    <td><strong>{book.title}</strong></td>
                                    <td>{book.author}</td>
                                    <td>{book.category}</td>
                                    <td>{book.publisher}</td>
                                    <td>{book.price.toLocaleString('vi-VN')}đ</td>
                                    <td>
                                        <span className={book.stock < 30 ? 'badge badge-cancelled' : 'badge badge-shipped'}>
                                            {book.stock}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="btn-icon" title="View">
                                                <Eye size={16} />
                                            </button>
                                            <button className="btn-icon" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button className="btn-icon" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="empty-state">
                                    <div className="empty-state-title">Không tìm thấy sách</div>
                                    <div className="empty-state-text">Thử điều chỉnh từ khóa tìm kiếm</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="btn-icon"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="pagination-info">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="btn-icon"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
