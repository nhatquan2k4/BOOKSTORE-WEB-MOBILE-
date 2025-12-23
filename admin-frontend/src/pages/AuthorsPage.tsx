import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import type { Author } from '../types';
import { authorService } from '../services';
import { bookService } from '../services';
import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../constants';
import { useCrudOperations } from '../hooks/useCrudOperations';

const AuthorsPage: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
    const [formData, setFormData] = useState({ name: '', avatarUrl: '' });
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
            setFormData({ name: '', avatarUrl: '' });
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
            key: 'avatarUrl',
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
            render: (_value: any, item: Author) => (
                <span className="font-semibold text-blue-600">{authorCounts[item.id] ?? 0}</span>
            )
        },
    ];

    const handleEdit = (author: Author) => {
        setEditingAuthor(author);
        // backend/type uses `avartarUrl` (typo) so read that field when editing
        setFormData({ name: author.name, avatarUrl: (author as any).avartarUrl || '' });
        setShowModal(true);
    };

    // View books by author
    const [showBooksModal, setShowBooksModal] = useState(false);
    const [authorBooks, setAuthorBooks] = useState<Array<any>>([]);
    const [booksLoading, setBooksLoading] = useState(false);
    const [booksError, setBooksError] = useState<string | null>(null);
    const [selectedAuthorName, setSelectedAuthorName] = useState<string>('');
    const [authorCounts, setAuthorCounts] = useState<Record<string, number>>({});
    const [countsLoading, setCountsLoading] = useState(false);

    const handleViewBooks = async (author: Author) => {
        setSelectedAuthorName(author.name || '');
        setShowBooksModal(true);
        setBooksLoading(true);
        setAuthorBooks([]);
        setBooksError(null);
        try {
            
            const resp = await bookService.getAll({ pageSize: 1000, authorId: author.id });
            console.debug('bookService.getAll response:', resp);
           
            if (Array.isArray((resp as any).items)) {
                setAuthorBooks((resp as any).items);
            } else if (Array.isArray(resp as any)) {
                setAuthorBooks(resp as any);
            } else if (Array.isArray((resp as any).data)) {
                setAuthorBooks((resp as any).data);
            } else {
                
                try {
                    const raw = await apiClient.get(API_ENDPOINTS.BOOK.GET_BY_AUTHOR(author.id));
                    console.debug('Fallback raw GET response:', raw);
                    if (Array.isArray(raw.data)) {
                        setAuthorBooks(raw.data);
                    } else if (Array.isArray(raw.data?.data)) {
                        setAuthorBooks(raw.data.data);
                    } else if (Array.isArray(raw.data?.items)) {
                        setAuthorBooks(raw.data.items);
                    } else {
                        setAuthorBooks([]);
                    }
                } catch (fallbackErr) {
                    console.error('Fallback fetch error:', fallbackErr);
                    setAuthorBooks([]);
                }
            }
        } catch (err: any) {
            console.error('Error fetching books for author:', err);
            setBooksError(err?.message || 'Lỗi khi tải sách');
        } finally {
            setBooksLoading(false);
        }
    };

    // Fetch book counts for currently loaded authors (for the "Số sách" column)
    useEffect(() => {
        let mounted = true;
        const loadCounts = async () => {
            if (!authors || authors.length === 0) {
                setAuthorCounts({});
                return;
            }
            setCountsLoading(true);
            try {
                const promises = authors.map(async (a) => {
                    try {
                        const res = await bookService.getAll({ pageSize: 1, authorId: a.id });
                        // res may be { items, totalCount } or array — prefer totalCount
                        const total = (res as any)?.totalCount ?? (Array.isArray(res as any) ? (res as any).length : ((res as any)?.data?.totalCount ?? (res as any)?.data?.length ?? 0));
                        return { id: a.id, count: typeof total === 'number' ? total : 0 };
                    } catch (e) {
                        console.error('Error fetching count for author', a.id, e);
                        return { id: a.id, count: 0 };
                    }
                });

                const results = await Promise.all(promises);
                if (!mounted) return;
                const map: Record<string, number> = {};
                results.forEach(r => { map[r.id] = r.count; });
                setAuthorCounts(map);
            } finally {
                if (mounted) setCountsLoading(false);
            }
        };

        loadCounts();
        return () => { mounted = false; };
    }, [authors]);

    const handleDeleteAuthor = (author: Author) => {
        handleDelete(author.id, author.name);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Map UI form field `avatarUrl` to backend's `avartarUrl` (typo in types/api)
            const basePayload: any = { name: formData.name, avartarUrl: (formData as any).avatarUrl };
            if (editingAuthor) {
                // Update endpoint expects body to include `Id` that matches URL
                const updatePayload = { ...basePayload, id: editingAuthor.id };
                await authorService.update(editingAuthor.id, updatePayload as any);
            } else {
                await authorService.create(basePayload as any);
            }
            setShowModal(false);
            setEditingAuthor(null);
            setFormData({ name: '', avatarUrl: '' });
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
        setFormData({ name: '', avatarUrl: '' });
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
                    onView={handleViewBooks}
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
                                    value={(formData as any).avatarUrl}
                                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
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

            {/* View Books Modal */}
            {showBooksModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Sách của: {selectedAuthorName}</h2>
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
                        ) : authorBooks.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">Không có sách nào.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {authorBooks.map((book) => (
                                    <div key={book.id} className="border rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-800">{book.title}</h3>
                                        <div className="text-sm text-gray-600 mt-2">
                                            <div><span className="font-medium">ISBN:</span> {book.isbn || 'N/A'}</div>
                                            <div><span className="font-medium">Năm xuất bản:</span> {book.publicationYear ?? 'N/A'}</div>
                                            <div><span className="font-medium">Nhà xuất bản:</span> {book.publisherName || 'N/A'}</div>
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

export default AuthorsPage;
