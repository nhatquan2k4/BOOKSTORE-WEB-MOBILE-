import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import type { Publisher } from '../types';
import { publisherService } from '../services';
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
            render: (value: number) => (
                <span className="font-semibold text-blue-600">{value}</span>
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
        </div>
    );
};

export default PublishersPage;
