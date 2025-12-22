import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import type { Category } from '../types';
import { categoryService } from '../services';
import { bookService } from '../services';
import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../constants';
import { useCrudOperations } from '../hooks/useCrudOperations';

const CategoriesPage: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parentId: ''
    });
    const pageSize = 10;

    const {
        items: categories,
        loading,
        error,
        currentPage,
        setCurrentPage,
        totalCount,
        searchTerm,
        setSearchTerm,
        fetchItems: fetchCategories,
        handleDelete,
    } = useCrudOperations<Category>(categoryService, {
        entityName: 'thể loại',
        onSuccess: (action) => {
            const messages = {
                create: 'Thêm thể loại thành công!',
                update: 'Cập nhật thể loại thành công!',
                delete: 'Xóa thể loại thành công!'
            };
            alert(messages[action]);
            setShowModal(false);
            setEditingCategory(null);
            setFormData({ name: '', description: '', parentId: '' });
        },
        onError: (action, error) => {
            const actions = { create: 'thêm', update: 'cập nhật', delete: 'xóa' };
            alert(`Lỗi khi ${actions[action]} thể loại: ${error.message}`);
        },
    });

    useEffect(() => {
        fetchCategories({
            page: currentPage,
            pageSize: pageSize,
            search: searchTerm || undefined,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm]);

    const columns = [
        { key: 'name', label: 'Tên thể loại' },
        {
            key: 'description',
            label: 'Mô tả',
            render: (value?: string) => (
                <span className="text-gray-600 line-clamp-2">
                    {value || 'Chưa có mô tả'}
                </span>
            )
        },
        {
            key: 'parentName',
            label: 'Danh mục cha',
            render: (value?: string) => (
                <span className="text-gray-600">
                    {value || '-'}
                </span>
            )
        },
        {
            key: 'bookCount',
            label: 'Số sách',
            render: (_value: any, item: Category) => (
                <span className="font-semibold text-blue-600">{categoryCounts[item.id] ?? 0}</span>
            )
        },
        {
            key: 'subCategoriesCount',
            label: 'Danh mục con',
            render: (value: number) => (
                <span className="font-semibold text-green-600">{value}</span>
            )
        },
    ];

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            parentId: category.parentId || ''
        });
        setShowModal(true);
    };

    const handleDeleteCategory = (category: Category) => {
        handleDelete(category.id, category.name);
    };

    // View books by category
    const [showBooksModal, setShowBooksModal] = useState(false);
    const [categoryBooks, setCategoryBooks] = useState<Array<any>>([]);
    const [booksLoading, setBooksLoading] = useState(false);
    const [booksError, setBooksError] = useState<string | null>(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

    const handleViewBooks = async (category: Category) => {
        setSelectedCategoryName(category.name || '');
        setShowBooksModal(true);
        setBooksLoading(true);
        setCategoryBooks([]);
        setBooksError(null);
        try {
            const resp = await bookService.getAll({ pageSize: 1000, categoryId: category.id });
            console.debug('bookService.getAll (category) response:', resp);
            if (Array.isArray((resp as any).items)) {
                setCategoryBooks((resp as any).items);
            } else if (Array.isArray(resp as any)) {
                setCategoryBooks(resp as any);
            } else if (Array.isArray((resp as any).data)) {
                setCategoryBooks((resp as any).data);
            } else {
                try {
                    const raw = await apiClient.get(API_ENDPOINTS.BOOK.GET_BY_CATEGORY(category.id));
                    console.debug('Fallback raw GET (category) response:', raw);
                    if (Array.isArray(raw.data)) {
                        setCategoryBooks(raw.data);
                    } else if (Array.isArray(raw.data?.data)) {
                        setCategoryBooks(raw.data.data);
                    } else if (Array.isArray(raw.data?.items)) {
                        setCategoryBooks(raw.data.items);
                    } else {
                        setCategoryBooks([]);
                    }
                } catch (fallbackErr) {
                    console.error('Fallback fetch error (category):', fallbackErr);
                    setCategoryBooks([]);
                }
            }
        } catch (err: any) {
            console.error('Error fetching books for category:', err);
            setBooksError(err?.message || 'Lỗi khi tải sách');
        } finally {
            setBooksLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                description: formData.description || undefined,
                parentId: formData.parentId || undefined
            };
            
            if (editingCategory) {
                await categoryService.update(editingCategory.id, payload);
            } else {
                await categoryService.create(payload);
            }
            setShowModal(false);
            setEditingCategory(null);
            setFormData({ name: '', description: '', parentId: '' });
            fetchCategories({
                page: currentPage,
                pageSize: pageSize,
                search: searchTerm || undefined,
            });
        } catch (err: any) {
            console.error('Error saving category:', err?.response?.data ?? err);
            const serverMessage = err?.response?.data?.message || err?.response?.data || err.message || 'Không thể lưu thể loại';
            alert(`Lỗi khi lưu thể loại: ${typeof serverMessage === 'string' ? serverMessage : JSON.stringify(serverMessage)}`);
        }
    };

    const handleAddNew = () => {
        setEditingCategory(null);
        setFormData({ name: '', description: '', parentId: '' });
        setShowModal(true);
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    // Fetch book counts for currently loaded categories (for the "Số sách" column)
    useEffect(() => {
        let mounted = true;
        const loadCounts = async () => {
            if (!categories || categories.length === 0) {
                setCategoryCounts({});
                return;
            }
            try {
                const promises = categories.map(async (c) => {
                    try {
                        const res = await bookService.getAll({ pageSize: 1, categoryId: c.id });
                        const total = (res as any)?.totalCount ?? (Array.isArray(res as any) ? (res as any).length : ((res as any)?.data?.totalCount ?? (res as any)?.data?.length ?? 0));
                        return { id: c.id, count: typeof total === 'number' ? total : 0 };
                    } catch (e) {
                        console.error('Error fetching count for category', c.id, e);
                        return { id: c.id, count: 0 };
                    }
                });

                const results = await Promise.all(promises);
                if (!mounted) return;
                const map: Record<string, number> = {};
                results.forEach(r => { map[r.id] = r.count; });
                setCategoryCounts(map);
            } finally {
                // no-op
            }
        };

        loadCounts();
        return () => { mounted = false; };
    }, [categories]);

    // Lọc categories có thể làm parent (loại bỏ chính nó và các con của nó)
    const availableParents = categories.filter(cat => 
        !editingCategory || (cat.id !== editingCategory.id && cat.parentId !== editingCategory.id)
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý thể loại</h1>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Thêm thể loại
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4 flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm thể loại..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                <Table
                    columns={columns}
                    data={categories}
                    onView={handleViewBooks}
                    onEdit={handleEdit}
                    onDelete={handleDeleteCategory}
                    loading={loading}
                />

                {!loading && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        itemsCount={categories?.length || 0}
                        onPageChange={setCurrentPage}
                        entityName="thể loại"
                    />
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingCategory ? 'Sửa thể loại' : 'Thêm thể loại mới'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên thể loại *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mô tả
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Danh mục cha
                                </label>
                                <select
                                    value={formData.parentId}
                                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Không có --</option>
                                    {availableParents.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingCategory ? 'Cập nhật' : 'Thêm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Books Modal (category) */}
            {showBooksModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Sách của: {selectedCategoryName}</h2>
                            <button
                                onClick={() => setShowBooksModal(false)}
                                className="px-3 py-1 border rounded-lg hover:bg-gray-50"
                            >
                                Đóng
                            </button>
                        </div>

                        {booksLoading ? (
                            <div className="py-8 text-center text-gray-500">Đang tải sách...</div>
                        ) : booksError ? (
                            <div className="py-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                {booksError}
                            </div>
                        ) : categoryBooks.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">Không có sách nào.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {categoryBooks.map((book) => (
                                    <div key={book.id} className="border rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-800">{book.title}</h3>
                                        <div className="text-sm text-gray-600 mt-2">
                                            <div><span className="font-medium">ISBN:</span> {book.isbn || 'N/A'}</div>
                                            <div><span className="font-medium">Năm xuất bản:</span> {book.publicationYear ?? 'N/A'}</div>
                                            <div><span className="font-medium">Tác giả:</span> {(book.authorNames || []).join(', ') || 'N/A'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesPage;
