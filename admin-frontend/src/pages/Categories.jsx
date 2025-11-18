import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import { categoryService } from '../services/bookService';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadCategories();
    }, [currentPage]);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const response = await categoryService.getAll({
                pageNumber: currentPage,
                pageSize: 10,
            });
            setCategories(response.data.items || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (category) => {
        if (!confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) return;
        try {
            await categoryService.delete(category.id);
            alert('Xóa thành công!');
            loadCategories();
        } catch (error) {
            alert('Không thể xóa danh mục');
        }
    };

    const columns = [
        { key: 'name', label: 'Tên danh mục' },
        { key: 'description', label: 'Mô tả' },
    ];

    return (
        <div className="page-content">
            <div className="page-header">
                <h1 className="page-title">Quản lý Danh mục</h1>
                <button className="btn btn-primary">
                    <Plus size={20} />
                    Thêm danh mục
                </button>
            </div>

            <DataTable
                columns={columns}
                data={categories}
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
