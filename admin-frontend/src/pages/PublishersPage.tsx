import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import type { Publisher } from '../types';
import { publisherService } from '../services';
import { bookService } from '../services';
import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../constants';
import { useCrudOperations } from '../hooks/useCrudOperations';

const PublishersPage: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phoneNumber: '',
        email: '',
        website: ''
    });
    const pageSize = 10;

    const {
        items: publishers,
        loading,
        error,
        currentPage,
        setCurrentPage,
        totalCount,
        searchTerm,
        setSearchTerm,
        fetchItems: fetchPublishers,
        handleDelete,
    } = useCrudOperations<Publisher>(publisherService, {
        entityName: 'nhà xuất bản',
        onSuccess: (action) => {
            const messages = {
                create: 'Thêm nhà xuất bản thành công!',
                update: 'Cập nhật nhà xuất bản thành công!',
                delete: 'Xóa nhà xuất bản thành công!'
            };
            alert(messages[action]);
            setShowModal(false);
            setEditingPublisher(null);
            setFormData({ name: '', address: '', phoneNumber: '', email: '', website: '' });
        },
        onError: (action, error) => {
            const actions = { create: 'thêm', update: 'cập nhật', delete: 'xóa' };
            alert(`Lỗi khi ${actions[action]} nhà xuất bản: ${error.message}`);
        },
    });

    useEffect(() => {
        fetchPublishers({
            page: currentPage,
            pageSize: pageSize,
            search: searchTerm || undefined,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm]);

    const columns = [
        { key: 'name', label: 'Tên nhà xuất bản' },
        { key: 'address', label: 'Địa chỉ' },
        { key: 'phoneNumber', label: 'Số điện thoại' },
        { key: 'email', label: 'Email' },
        {
            key: 'bookCount',
            label: 'Số sách',
            render: (_value: any, item: Publisher) => (
                <span className="font-semibold text-blue-600">{publisherCounts[item.id] ?? 0}</span>
            )
        },
    ];

    const handleEdit = (publisher: Publisher) => {
        setEditingPublisher(publisher);
        setFormData({
            name: publisher.name,
            address: publisher.address || '',
            phoneNumber: publisher.phoneNumber || '',
            email: publisher.email || '',
            website: publisher.website || ''
        });
        setShowModal(true);
    };

    // View books by publisher
    const [showBooksModal, setShowBooksModal] = useState(false);
    const [publisherBooks, setPublisherBooks] = useState<Array<any>>([]);
    const [booksLoading, setBooksLoading] = useState(false);
    const [booksError, setBooksError] = useState<string | null>(null);
    const [selectedPublisherName, setSelectedPublisherName] = useState<string>('');
    const [publisherCounts, setPublisherCounts] = useState<Record<string, number>>({});

    const handleViewBooks = async (publisher: Publisher) => {
        setSelectedPublisherName(publisher.name || '');
        setShowBooksModal(true);
        setBooksLoading(true);
        setPublisherBooks([]);
        setBooksError(null);
        try {
            const resp = await bookService.getAll({ pageSize: 1000, publisherId: publisher.id });
            console.debug('bookService.getAll (publisher) response:', resp);
            if (Array.isArray((resp as any).items)) {
                setPublisherBooks((resp as any).items);
            } else if (Array.isArray(resp as any)) {
                setPublisherBooks(resp as any);
            } else if (Array.isArray((resp as any).data)) {
                setPublisherBooks((resp as any).data);
            } else {
                try {
                    const raw = await apiClient.get(API_ENDPOINTS.BOOK.GET_BY_PUBLISHER(publisher.id));
                    console.debug('Fallback raw GET (publisher) response:', raw);
                    if (Array.isArray(raw.data)) {
                        setPublisherBooks(raw.data);
                    } else if (Array.isArray(raw.data?.data)) {
                        setPublisherBooks(raw.data.data);
                    } else if (Array.isArray(raw.data?.items)) {
                        setPublisherBooks(raw.data.items);
                    } else {
                        setPublisherBooks([]);
                    }
                } catch (fallbackErr) {
                    console.error('Fallback fetch error (publisher):', fallbackErr);
                    setPublisherBooks([]);
                }
            }
        } catch (err: any) {
            console.error('Error fetching books for publisher:', err);
            setBooksError(err?.message || 'Lỗi khi tải sách');
        } finally {
            setBooksLoading(false);
        }
    };

    const handleDeletePublisher = (publisher: Publisher) => {
        handleDelete(publisher.id, publisher.name);
    };

    const handleAddNew = () => {
        setEditingPublisher(null);
        setFormData({ name: '', address: '', phoneNumber: '', email: '', website: '' });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPublisher) {
                await publisherService.update(editingPublisher.id, formData);
            } else {
                await publisherService.create(formData);
            }
            setShowModal(false);
            setEditingPublisher(null);
            setFormData({ name: '', address: '', phoneNumber: '', email: '', website: '' });
            fetchPublishers({
                page: currentPage,
                pageSize: pageSize,
                search: searchTerm || undefined,
            });
        } catch (err: any) {
            console.error('Error saving publisher:', err);
            alert(`Không thể lưu nhà xuất bản: ${err.message}`);
        }
    };


    const totalPages = Math.ceil(totalCount / pageSize);

    // Fetch book counts for currently loaded publishers (for the "Số sách" column)
    useEffect(() => {
        let mounted = true;
        const loadCounts = async () => {
            if (!publishers || publishers.length === 0) {
                setPublisherCounts({});
                return;
            }
            try {
                const promises = publishers.map(async (p) => {
                    try {
                        const res = await bookService.getAll({ pageSize: 1, publisherId: p.id });
                        const total = (res as any)?.totalCount ?? (Array.isArray(res as any) ? (res as any).length : ((res as any)?.data?.totalCount ?? (res as any)?.data?.length ?? 0));
                        return { id: p.id, count: typeof total === 'number' ? total : 0 };
                    } catch (e) {
                        console.error('Error fetching count for publisher', p.id, e);
                        return { id: p.id, count: 0 };
                    }
                });

                const results = await Promise.all(promises);
                if (!mounted) return;
                const map: Record<string, number> = {};
                results.forEach(r => { map[r.id] = r.count; });
                setPublisherCounts(map);
            } finally {
                if (mounted) {
                    // no-op; we could set a counts loading flag if desired
                }
            }
        };

        loadCounts();
        return () => { mounted = false; };
    }, [publishers]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý nhà xuất bản</h1>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Thêm nhà xuất bản
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4 flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm nhà xuất bản..."
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
                    data={publishers}
                    onView={handleViewBooks}
                    onEdit={handleEdit}
                    onDelete={handleDeletePublisher}
                    loading={loading}
                />

                {!loading && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        itemsCount={publishers?.length || 0}
                        onPageChange={setCurrentPage}
                        entityName="nhà xuất bản"
                    />
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingPublisher ? 'Sửa nhà xuất bản' : 'Thêm nhà xuất bản mới'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên nhà xuất bản *
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
                                    Địa chỉ
                                </label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Website
                                </label>
                                <input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    {editingPublisher ? 'Cập nhật' : 'Thêm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Books Modal (publisher) */}
            {showBooksModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Sách của: {selectedPublisherName}</h2>
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
                        ) : publisherBooks.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">Không có sách nào.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {publisherBooks.map((book) => (
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

export default PublishersPage;
