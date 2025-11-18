import { useState } from 'react';
import { Edit, Plus, AlertTriangle } from 'lucide-react';

export default function Stock() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filterLevel, setFilterLevel] = useState('all');
    const itemsPerPage = 10;

    // Mock data - Kho hàng
    const mockStock = [
        { id: 1, bookTitle: 'Đắc Nhân Tâm', bookId: 'BK001', category: 'Kỹ năng sống', warehouse: 'Kho HN', quantity: 450, minStock: 100, maxStock: 1000, lastUpdate: '2024-01-20' },
        { id: 2, bookTitle: 'Nhà Giả Kim', bookId: 'BK002', category: 'Văn học', warehouse: 'Kho HCM', quantity: 85, minStock: 100, maxStock: 800, lastUpdate: '2024-01-19' },
        { id: 3, bookTitle: 'Sapiens - Lược Sử Loài Người', bookId: 'BK003', category: 'Lịch sử', warehouse: 'Kho HN', quantity: 320, minStock: 150, maxStock: 1200, lastUpdate: '2024-01-20' },
        { id: 4, bookTitle: 'Tuổi Trẻ Đáng Giá Bao Nhiêu', bookId: 'BK004', category: 'Kỹ năng sống', warehouse: 'Kho HCM', quantity: 25, minStock: 50, maxStock: 500, lastUpdate: '2024-01-18' },
        { id: 5, bookTitle: 'Cây Cam Ngọt Của Tôi', bookId: 'BK005', category: 'Văn học', warehouse: 'Kho HN', quantity: 580, minStock: 100, maxStock: 600, lastUpdate: '2024-01-21' },
        { id: 6, bookTitle: 'Tâm Lý Học Tội Phạm', bookId: 'BK006', category: 'Tâm lý học', warehouse: 'Kho HCM', quantity: 190, minStock: 80, maxStock: 400, lastUpdate: '2024-01-20' },
        { id: 7, bookTitle: 'Nghĩ Giàu Làm Giàu', bookId: 'BK007', category: 'Kinh tế', warehouse: 'Kho HN', quantity: 42, minStock: 50, maxStock: 600, lastUpdate: '2024-01-17' },
        { id: 8, bookTitle: 'Atomic Habits', bookId: 'BK008', category: 'Kỹ năng sống', warehouse: 'Kho HCM', quantity: 285, minStock: 100, maxStock: 800, lastUpdate: '2024-01-21' },
        { id: 9, bookTitle: 'Quẳng Gánh Lo Đi Và Vui Sống', bookId: 'BK009', category: 'Kỹ năng sống', warehouse: 'Kho HN', quantity: 720, minStock: 150, maxStock: 1000, lastUpdate: '2024-01-20' },
        { id: 10, bookTitle: 'Bố Già', bookId: 'BK010', category: 'Văn học', warehouse: 'Kho HCM', quantity: 155, minStock: 100, maxStock: 700, lastUpdate: '2024-01-19' },
    ];

    const getStockLevel = (quantity, minStock) => {
        if (quantity < minStock) return 'low';
        if (quantity < minStock * 1.5) return 'warning';
        return 'good';
    };

    const getStockBadge = (level) => {
        const badges = {
            low: { class: 'badge-cancelled', text: 'Thấp' },
            warning: { class: 'badge-pending', text: 'Cảnh báo' },
            good: { class: 'badge-shipped', text: 'Tốt' }
        };
        return badges[level];
    };

    const filteredStock = mockStock.filter(item => {
        const matchesSearch = item.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.bookId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterLevel === 'all') return matchesSearch;
        const level = getStockLevel(item.quantity, item.minStock);
        return matchesSearch && level === filterLevel;
    });

    const totalPages = Math.ceil(filteredStock.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentStock = filteredStock.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="page-content">
            <div className="items-header">
                <h1 className="page-title">Quản lý Kho hàng</h1>
            </div>

            <div className="table-container">
                <div className="table-header-bar">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sách trong kho..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="table-search"
                        />
                        <select
                            value={filterLevel}
                            onChange={(e) => setFilterLevel(e.target.value)}
                            className="form-select"
                            style={{ width: '150px' }}
                        >
                            <option value="all">Tất cả</option>
                            <option value="low">Tồn kho thấp</option>
                            <option value="warning">Cảnh báo</option>
                            <option value="good">Tồn kho tốt</option>
                        </select>
                    </div>
                    <button className="btn-primary">
                        <Plus size={18} />
                        Nhập kho
                    </button>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th style={{ width: '100px' }}>Mã sách</th>
                            <th>Tên sách</th>
                            <th>Danh mục</th>
                            <th style={{ width: '120px' }}>Kho</th>
                            <th style={{ width: '100px' }}>Tồn kho</th>
                            <th style={{ width: '100px' }}>Tối thiểu</th>
                            <th style={{ width: '120px' }}>Trạng thái</th>
                            <th style={{ width: '80px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentStock.length > 0 ? (
                            currentStock.map((item, index) => {
                                const level = getStockLevel(item.quantity, item.minStock);
                                const badge = getStockBadge(level);
                                return (
                                    <tr key={item.id}>
                                        <td>{startIndex + index + 1}</td>
                                        <td><strong>{item.bookId}</strong></td>
                                        <td>{item.bookTitle}</td>
                                        <td>{item.category}</td>
                                        <td>{item.warehouse}</td>
                                        <td>
                                            <strong>{item.quantity}</strong>
                                            {level === 'low' && <AlertTriangle size={14} color="#e74c3c" style={{ marginLeft: '4px' }} />}
                                        </td>
                                        <td>{item.minStock}</td>
                                        <td>
                                            <span className={`badge ${badge.class}`}>
                                                {badge.text}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn-icon" title="Cập nhật">
                                                    <Edit size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="9" className="empty-state">
                                    <div className="empty-state-title">Không tìm thấy sách</div>
                                    <div className="empty-state-text">Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc</div>
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
