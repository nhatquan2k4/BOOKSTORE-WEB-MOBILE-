import { useState } from 'react';
import { Edit, Trash2, Plus, Eye } from 'lucide-react';

export default function Authors() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Mock data
    const mockAuthors = [
        { id: 1, name: 'F. Scott Fitzgerald', biography: 'American novelist and short story writer', nationality: 'American', totalBooks: 5, bornYear: 1896, email: 'fitzgerald@example.com' },
        { id: 2, name: 'Harper Lee', biography: 'American novelist known for To Kill a Mockingbird', nationality: 'American', totalBooks: 2, bornYear: 1926, email: 'harper@example.com' },
        { id: 3, name: 'George Orwell', biography: 'English novelist and essayist', nationality: 'British', totalBooks: 8, bornYear: 1903, email: 'orwell@example.com' },
        { id: 4, name: 'Jane Austen', biography: 'English novelist known for romantic fiction', nationality: 'British', totalBooks: 6, bornYear: 1775, email: 'austen@example.com' },
        { id: 5, name: 'J.D. Salinger', biography: 'American writer known for The Catcher in the Rye', nationality: 'American', totalBooks: 4, bornYear: 1919, email: 'salinger@example.com' },
        { id: 6, name: 'J.K. Rowling', biography: 'British author of the Harry Potter series', nationality: 'British', totalBooks: 15, bornYear: 1965, email: 'rowling@example.com' },
        { id: 7, name: 'J.R.R. Tolkien', biography: 'English writer and philologist', nationality: 'British', totalBooks: 12, bornYear: 1892, email: 'tolkien@example.com' },
        { id: 8, name: 'Ray Bradbury', biography: 'American author of science fiction', nationality: 'American', totalBooks: 27, bornYear: 1920, email: 'bradbury@example.com' },
        { id: 9, name: 'Ernest Hemingway', biography: 'American novelist and short-story writer', nationality: 'American', totalBooks: 10, bornYear: 1899, email: 'hemingway@example.com' },
        { id: 10, name: 'Mark Twain', biography: 'American writer and humorist', nationality: 'American', totalBooks: 28, bornYear: 1835, email: 'twain@example.com' },
    ];

    const filteredAuthors = mockAuthors.filter(author =>
        author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        author.nationality.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredAuthors.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentAuthors = filteredAuthors.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="page-content">
            <div className="items-header">
                <h1 className="page-title">Tác giả</h1>
            </div>

            <div className="table-container">
                <div className="table-header-bar">
                    <input
                        type="text"
                        placeholder="Tìm kiếm tác giả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="table-search"
                    />
                    <button className="btn-primary">
                        <Plus size={18} />
                        Thêm tác giả
                    </button>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>Tên tác giả</th>
                            <th>Quốc tịch</th>
                            <th style={{ width: '100px' }}>Năm sinh</th>
                            <th style={{ width: '100px' }}>Số sách</th>
                            <th>Email</th>
                            <th style={{ width: '120px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentAuthors.length > 0 ? (
                            currentAuthors.map((author, index) => (
                                <tr key={author.id}>
                                    <td>{startIndex + index + 1}</td>
                                    <td><strong>{author.name}</strong></td>
                                    <td>{author.nationality}</td>
                                    <td>{author.bornYear}</td>
                                    <td>
                                        <span className="badge badge-shipped">
                                            {author.totalBooks}
                                        </span>
                                    </td>
                                    <td>{author.email}</td>
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
                                <td colSpan="7" className="empty-state">
                                    <div className="empty-state-title">Không tìm thấy tác giả</div>
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
