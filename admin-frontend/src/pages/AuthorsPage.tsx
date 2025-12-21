import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import type { Author } from '../types';
import { authorService } from '../services';
import { useCrudOperations } from '../hooks/useCrudOperations';

const AuthorsPage: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
    const [formData, setFormData] = useState({ name: '', avartarUrl: '' });
    const pageSize = 10;

    const {
        items: authors,
        loading,
        error,
        currentPage,
        setCurrentPage,
        totalCount,
        searchTerm,
        setSearchTerm,
        fetchItems: fetchAuthors,
        handleDelete,
    } = useCrudOperations<Author>(authorService, {
        entityName: 'tác giả',
        onSuccess: (action) => {
            if (action === 'create') {
                alert('Thêm tác giả thành công!');
            } else if (action === 'update') {
                alert('Cập nhật tác giả thành công!');
            } else if (action === 'delete') {
                alert('Xóa tác giả thành công!');
            }
            setShowModal(false);
            setEditingAuthor(null);
            setFormData({ name: '', avartarUrl: '' });
        },
        onError: (action, error) => {
            alert(`Lỗi khi ${action === 'create' ? 'thêm' : action === 'update' ? 'cập nhật' : 'xóa'} tác giả: ${error.message}`);
        },
    });

    useEffect(() => {
        fetchAuthors({
            page: currentPage,
            pageSize: pageSize,
            search: searchTerm || undefined,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm]);

    const columns = [
        { key: 'name', label: 'Tên tác giả' },
        {
            key: 'avartarUrl',
            label: 'Avatar',
            render: (value?: string) => (
                value ? (
                    <img src={value} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No Image</span>
                    </div>
                )
            )
        },
        {
            key: 'bookCount',
            label: 'Số sách',
            render: (value: number) => (
                <span className="font-semibold text-blue-600">{value}</span>
            )
        },
    ];

    const handleEdit = (author: Author) => {
        setEditingAuthor(author);
        setFormData({ name: author.name, avartarUrl: author.avartarUrl || '' });
        setShowModal(true);
    };

    const handleDeleteAuthor = (author: Author) => {
        handleDelete(author.id, author.name);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAuthor) {
                await authorService.update(editingAuthor.id, formData);
            } else {
                await authorService.create(formData);
            }
            setShowModal(false);
            setEditingAuthor(null);
            setFormData({ name: '', avartarUrl: '' });
            fetchAuthors({
                page: currentPage,
                pageSize: pageSize,
                search: searchTerm || undefined,
            });
        } catch (err: any) {
            console.error('Error saving author:', err);
            alert(`Không thể lưu tác giả: ${err.message}`);
        }
    };

    const handleAddNew = () => {
        setEditingAuthor(null);
        setFormData({ name: '', avartarUrl: '' });
        setShowModal(true);
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý tác giả</h1>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Thêm tác giả
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4 flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm tác giả..."
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
                    data={authors}
                    onEdit={handleEdit}
                    onDelete={handleDeleteAuthor}
                    loading={loading}
                />

                {!loading && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        itemsCount={authors?.length || 0}
                        onPageChange={setCurrentPage}
                        entityName="tác giả"
                    />
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingAuthor ? 'Sửa tác giả' : 'Thêm tác giả mới'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên tác giả *
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
                                    URL Avatar
                                </label>
                                <input
                                    type="url"
                                    value={formData.avartarUrl}
                                    onChange={(e) => setFormData({ ...formData, avartarUrl: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://example.com/avatar.jpg"
                                />
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
                                    {editingAuthor ? 'Cập nhật' : 'Thêm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthorsPage;
