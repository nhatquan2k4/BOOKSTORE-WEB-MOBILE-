import { useState } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';

export default function Categories() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Mock data
    const mockCategories = [
        { id: 1, name: 'Fiction', description: 'Fictional literature and novels', totalBooks: 245, createdAt: '2023-01-15' },
        { id: 2, name: 'Science Fiction', description: 'Science fiction and futuristic stories', totalBooks: 156, createdAt: '2023-01-20' },
        { id: 3, name: 'Fantasy', description: 'Fantasy and magical worlds', totalBooks: 189, createdAt: '2023-02-05' },
        { id: 4, name: 'Romance', description: 'Romantic novels and love stories', totalBooks: 178, createdAt: '2023-02-12' },
        { id: 5, name: 'Mystery', description: 'Mystery and detective stories', totalBooks: 134, createdAt: '2023-03-01' },
        { id: 6, name: 'Thriller', description: 'Suspense and thriller novels', totalBooks: 98, createdAt: '2023-03-15' },
        { id: 7, name: 'Biography', description: 'Life stories and autobiographies', totalBooks: 67, createdAt: '2023-04-01' },
        { id: 8, name: 'Self-Help', description: 'Personal development and self-improvement', totalBooks: 112, createdAt: '2023-04-10' },
        { id: 9, name: 'History', description: 'Historical events and documentation', totalBooks: 89, createdAt: '2023-05-01' },
        { id: 10, name: 'Technology', description: 'Technology and computer science books', totalBooks: 145, createdAt: '2023-05-20' },
    ];

    const filteredCategories = mockCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="page-content">
            <div className="items-header">
                <h1 className="page-title">Danh mục</h1>
            </div>

            <div className="table-container">
                <div className="table-header-bar">
                    <input
                        type="text"
                        placeholder="Tìm kiếm danh mục..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="table-search"
                    />
                    <button className="btn-primary">
                        <Plus size={18} />
                        Thêm danh mục
                    </button>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>Tên danh mục</th>
                            <th>Mô tả</th>
                            <th style={{ width: '120px' }}>Số sách</th>
                            <th style={{ width: '120px' }}>Ngày tạo</th>
                            <th style={{ width: '100px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCategories.length > 0 ? (
                            currentCategories.map((category, index) => (
                                <tr key={category.id}>
                                    <td>{startIndex + index + 1}</td>
                                    <td><strong>{category.name}</strong></td>
                                    <td>{category.description}</td>
                                    <td>
                                        <span className="badge badge-processing">
                                            {category.totalBooks}
                                        </span>
                                    </td>
                                    <td>{category.createdAt}</td>
                                    <td>
                                        <div className="table-actions">
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
                                <td colSpan="6" className="empty-state">
                                    <div className="empty-state-title">Không tìm thấy danh mục</div>
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
