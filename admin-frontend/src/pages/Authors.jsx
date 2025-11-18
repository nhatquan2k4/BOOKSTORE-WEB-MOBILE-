import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import { authorService } from '../services/bookService';

export default function Authors() {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadAuthors();
    }, [currentPage]);

    const loadAuthors = async () => {
        try {
            setLoading(true);
            const response = await authorService.getAll({
                pageNumber: currentPage,
                pageSize: 10,
            });
            setAuthors(response.data.items || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error('Failed to load authors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (author) => {
        if (!confirm(`Bạn có chắc muốn xóa tác giả "${author.name}"?`)) return;
        try {
            await authorService.delete(author.id);
            alert('Xóa thành công!');
            loadAuthors();
        } catch (error) {
            alert('Không thể xóa tác giả');
        }
    };

    const columns = [
        { key: 'name', label: 'Tên tác giả' },
        { key: 'biography', label: 'Tiểu sử' },
    ];

    return (
        <div className="page-content">
            <div className="page-header">
                <h1 className="page-title">Quản lý Tác giả</h1>
                <button className="btn btn-primary">
                    <Plus size={20} />
                    Thêm tác giả
                </button>
            </div>

            <DataTable
                columns={columns}
                data={authors}
                onEdit={() => { }}
                onDelete={handleDelete}
                loading={loading}
            />

            {!loading && totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
}
