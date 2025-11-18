import { useState } from 'react';
import { Edit, Trash2, Plus, Eye } from 'lucide-react';

export default function Publishers() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Mock data - Nhà xuất bản
    const mockPublishers = [
        { id: 1, name: 'NXB Kim Đồng', address: '55 Quang Trung, Hà Nội', phone: '024-39434730', email: 'kimdong@nxbkimdong.com.vn', totalBooks: 1250, established: 1957 },
        { id: 2, name: 'NXB Trẻ', address: '161B Lý Chính Thắng, Q.3, TP.HCM', phone: '028-39316289', email: 'info@nxbtre.com.vn', totalBooks: 2150, established: 1981 },
        { id: 3, name: 'NXB Văn học', address: '18 Nguyễn Trường Tộ, Hà Nội', phone: '024-38223900', email: 'vanhoc@nxbvanhoc.com.vn', totalBooks: 1850, established: 1957 },
        { id: 4, name: 'NXB Hội Nhà văn', address: '65 Nguyễn Du, Hà Nội', phone: '024-38222135', email: 'info@nxbhoinvhn.vn', totalBooks: 950, established: 1987 },
        { id: 5, name: 'NXB Phụ nữ Việt Nam', address: '39 Hàng Chuối, Hà Nội', phone: '024-39719020', email: 'info@nxbphunuvn.vn', totalBooks: 780, established: 1958 },
        { id: 6, name: 'Alphabooks', address: '268 Lý Thường Kiệt, Q.Tân Bình, TP.HCM', phone: '028-38481632', email: 'info@alphabooks.vn', totalBooks: 650, established: 2006 },
        { id: 7, name: 'NXB Lao động', address: '175 Giảng Võ, Hà Nội', phone: '024-38512211', email: 'info@nxblaodong.com.vn', totalBooks: 890, established: 1961 },
        { id: 8, name: 'First News', address: '90 Lê Lợi, Q.1, TP.HCM', phone: '028-38220102', email: 'contact@firstnews.com.vn', totalBooks: 1100, established: 2004 },
        { id: 9, name: 'NXB Tổng hợp TP.HCM', address: '62 Nguyễn Thị Minh Khai, Q.1, TP.HCM', phone: '028-38256804', email: 'info@nxbhcm.com.vn', totalBooks: 1450, established: 1976 },
        { id: 10, name: 'NXB Thế giới', address: '7 Nguyễn Thị Minh Khai, Hà Nội', phone: '024-39434730', email: 'thegioi@nxbthegioi.com.vn', totalBooks: 1650, established: 1957 },
    ];

    const filteredPublishers = mockPublishers.filter(pub =>
        pub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPublishers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPublishers = filteredPublishers.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="page-content">
            <div className="items-header">
                <h1 className="page-title">Nhà xuất bản</h1>
            </div>

            <div className="table-container">
                <div className="table-header-bar">
                    <input
                        type="text"
                        placeholder="Tìm kiếm nhà xuất bản..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="table-search"
                    />
                    <button className="btn-primary">
                        <Plus size={18} />
                        Thêm nhà xuất bản
                    </button>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>Tên nhà xuất bản</th>
                            <th>Địa chỉ</th>
                            <th style={{ width: '130px' }}>Điện thoại</th>
                            <th style={{ width: '100px' }}>Số sách</th>
                            <th style={{ width: '100px' }}>Năm thành lập</th>
                            <th style={{ width: '120px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPublishers.length > 0 ? (
                            currentPublishers.map((pub, index) => (
                                <tr key={pub.id}>
                                    <td>{startIndex + index + 1}</td>
                                    <td><strong>{pub.name}</strong></td>
                                    <td>{pub.address}</td>
                                    <td>{pub.phone}</td>
                                    <td>
                                        <span className="badge badge-processing">
                                            {pub.totalBooks}
                                        </span>
                                    </td>
                                    <td>{pub.established}</td>
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
                                    <div className="empty-state-title">Không tìm thấy nhà xuất bản</div>
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
