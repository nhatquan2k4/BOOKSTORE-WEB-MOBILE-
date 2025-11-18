import { useState } from 'react';
import { Edit, Trash2, Plus, Star } from 'lucide-react';

export default function Reviews() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [ratingFilter, setRatingFilter] = useState('all');
    const itemsPerPage = 10;

    // Mock data - Đánh giá
    const mockReviews = [
        { id: 1, bookTitle: 'Đắc Nhân Tâm', customerName: 'Nguyễn Văn A', rating: 5, comment: 'Cuốn sách rất hay, bổ ích cho cuộc sống. Nên đọc!', status: 'approved', date: '2024-01-20' },
        { id: 2, bookTitle: 'Nhà Giả Kim', customerName: 'Trần Thị B', rating: 4, comment: 'Nội dung hay, nhưng dịch thuật hơi khó hiểu ở một số chỗ.', status: 'approved', date: '2024-01-19' },
        { id: 3, bookTitle: 'Sapiens', customerName: 'Lê Văn C', rating: 5, comment: 'Tuyệt vời! Một góc nhìn mới mẻ về lịch sử loài người.', status: 'pending', date: '2024-01-21' },
        { id: 4, bookTitle: 'Tuổi Trẻ Đáng Giá Bao Nhiêu', customerName: 'Phạm Thị D', rating: 3, comment: 'Bình thường, không như kỳ vọng.', status: 'approved', date: '2024-01-18' },
        { id: 5, bookTitle: 'Cây Cam Ngọt Của Tôi', customerName: 'Hoàng Văn E', rating: 5, comment: 'Câu chuyện cảm động, đọc xong rơi nước mắt.', status: 'approved', date: '2024-01-20' },
        { id: 6, bookTitle: 'Tâm Lý Học Tội Phạm', customerName: 'Đặng Thị F', rating: 4, comment: 'Hay, học được nhiều điều về tâm lý con người.', status: 'pending', date: '2024-01-21' },
        { id: 7, bookTitle: 'Nghĩ Giàu Làm Giàu', customerName: 'Vũ Văn G', rating: 2, comment: 'Nội dung lặp lại nhiều, không thực tế.', status: 'rejected', date: '2024-01-17' },
        { id: 8, bookTitle: 'Atomic Habits', customerName: 'Bùi Thị H', rating: 5, comment: 'Cực kỳ hữu ích! Đã áp dụng và thấy hiệu quả.', status: 'approved', date: '2024-01-20' },
        { id: 9, bookTitle: 'Quẳng Gánh Lo Đi', customerName: 'Đinh Văn I', rating: 4, comment: 'Sách hay, dễ đọc, phù hợp mọi lứa tuổi.', status: 'pending', date: '2024-01-21' },
        { id: 10, bookTitle: 'Bố Già', customerName: 'Mai Thị K', rating: 5, comment: 'Một kiệt tác! Must read.', status: 'approved', date: '2024-01-19' },
    ];

    const getStatusBadge = (status) => {
        const badges = {
            approved: { class: 'badge-shipped', text: 'Đã duyệt' },
            pending: { class: 'badge-pending', text: 'Chờ duyệt' },
            rejected: { class: 'badge-cancelled', text: 'Từ chối' }
        };
        return badges[status] || badges.pending;
    };

    const filteredReviews = mockReviews.filter(review => {
        const matchesSearch = review.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.comment.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
        return matchesSearch && matchesRating;
    });

    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentReviews = filteredReviews.slice(startIndex, startIndex + itemsPerPage);

    const renderStars = (rating) => {
        return (
            <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={14}
                        fill={star <= rating ? '#f39c12' : 'none'}
                        color={star <= rating ? '#f39c12' : '#ddd'}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="page-content">
            <div className="items-header">
                <h1 className="page-title">Quản lý Đánh giá</h1>
            </div>

            <div className="table-container">
                <div className="table-header-bar">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm đánh giá..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="table-search"
                        />
                        <select
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value)}
                            className="form-select"
                            style={{ width: '150px' }}
                        >
                            <option value="all">Tất cả đánh giá</option>
                            <option value="5">5 sao</option>
                            <option value="4">4 sao</option>
                            <option value="3">3 sao</option>
                            <option value="2">2 sao</option>
                            <option value="1">1 sao</option>
                        </select>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>Tên sách</th>
                            <th>Khách hàng</th>
                            <th style={{ width: '120px' }}>Đánh giá</th>
                            <th style={{ width: '300px' }}>Nhận xét</th>
                            <th style={{ width: '120px' }}>Trạng thái</th>
                            <th style={{ width: '100px' }}>Ngày</th>
                            <th style={{ width: '100px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentReviews.length > 0 ? (
                            currentReviews.map((review, index) => {
                                const badge = getStatusBadge(review.status);
                                return (
                                    <tr key={review.id}>
                                        <td>{startIndex + index + 1}</td>
                                        <td><strong>{review.bookTitle}</strong></td>
                                        <td>{review.customerName}</td>
                                        <td>{renderStars(review.rating)}</td>
                                        <td style={{ fontSize: '13px' }}>{review.comment}</td>
                                        <td>
                                            <span className={`badge ${badge.class}`}>
                                                {badge.text}
                                            </span>
                                        </td>
                                        <td>{review.date}</td>
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
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" className="empty-state">
                                    <div className="empty-state-title">Không tìm thấy đánh giá</div>
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
