import React, { useState, useEffect } from 'react';
import { Search, Package, AlertCircle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

interface StockItem {
    id: string;
    bookId: string;
    bookTitle: string;
    bookIsbn?: string;
    warehouseId: string;
    warehouseName: string;
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    minStockLevel: number;
    maxStockLevel: number;
    reorderPoint: number;
    lastRestockedAt?: string;
    createdAt: string;
    updatedAt: string;
}

interface InventoryUpdate {
    stockItemId: string;
    quantity: number;
    transactionType: 'IN' | 'OUT' | 'ADJUSTMENT';
    notes: string;
}

const InventoryPage: React.FC = () => {
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');
    const pageSize = 10;

    // Update modal state
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
    const [updateForm, setUpdateForm] = useState<InventoryUpdate>({
        stockItemId: '',
        quantity: 0,
        transactionType: 'IN',
        notes: '',
    });

    useEffect(() => {
        fetchStockItems();
    }, [currentPage, searchTerm, filterStatus]);

    const fetchStockItems = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params: any = {
                page: currentPage,
                pageSize: pageSize,
            };

            if (searchTerm) {
                params.search = searchTerm;
            }

            const response = await apiClient.get(API_ENDPOINTS.STOCK_ITEMS.LIST, { params });
            
            let items = response.data.items || response.data || [];
            
            // Filter by status
            if (filterStatus === 'low') {
                items = items.filter((item: StockItem) => 
                    item.availableQuantity <= item.reorderPoint && item.availableQuantity > 0
                );
            } else if (filterStatus === 'out') {
                items = items.filter((item: StockItem) => item.availableQuantity === 0);
            }

            setStockItems(items);
            setTotalCount(response.data.totalCount || items.length);
        } catch (err: any) {
            console.error('Error fetching stock items:', err);
            setError('Không thể tải danh sách tồn kho');
            alert('Không thể tải danh sách tồn kho');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenUpdateModal = (item: StockItem) => {
        setSelectedItem(item);
        setUpdateForm({
            stockItemId: item.id,
            quantity: 0,
            transactionType: 'IN',
            notes: '',
        });
        setShowUpdateModal(true);
    };

    const handleCloseUpdateModal = () => {
        setShowUpdateModal(false);
        setSelectedItem(null);
        setUpdateForm({
            stockItemId: '',
            quantity: 0,
            transactionType: 'IN',
            notes: '',
        });
    };

    const handleUpdateStock = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!updateForm.quantity || updateForm.quantity === 0) {
            alert('Vui lòng nhập số lượng');
            return;
        }

        try {
            await apiClient.post(API_ENDPOINTS.INVENTORY_TRANSACTIONS.CREATE, updateForm);
            alert('Cập nhật tồn kho thành công');
            handleCloseUpdateModal();
            fetchStockItems();
        } catch (err: any) {
            console.error('Error updating stock:', err);
            alert(err.response?.data?.message || 'Không thể cập nhật tồn kho');
        }
    };

    const getStockStatus = (item: StockItem) => {
        if (item.availableQuantity === 0) {
            return { label: 'Hết hàng', color: 'text-red-600 bg-red-50', icon: AlertCircle };
        } else if (item.availableQuantity <= item.reorderPoint) {
            return { label: 'Sắp hết', color: 'text-yellow-600 bg-yellow-50', icon: AlertCircle };
        } else {
            return { label: 'Còn hàng', color: 'text-green-600 bg-green-50', icon: CheckCircle };
        }
    };

    const columns = [
        {
            key: 'bookTitle',
            label: 'Sách',
            render: (item: StockItem) => (
                <div>
                    <div className="font-medium text-gray-900">{item.bookTitle}</div>
                    {item.bookIsbn && (
                        <div className="text-sm text-gray-500">ISBN: {item.bookIsbn}</div>
                    )}
                </div>
            ),
        },
        {
            key: 'warehouseName',
            label: 'Kho',
            render: (item: StockItem) => (
                <span className="text-gray-700">{item.warehouseName}</span>
            ),
        },
        {
            key: 'quantity',
            label: 'Tồn kho',
            render: (item: StockItem) => (
                <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{item.availableQuantity}</div>
                    <div className="text-xs text-gray-500">
                        Tổng: {item.quantity} | Đặt: {item.reservedQuantity}
                    </div>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (item: StockItem) => {
                const status = getStockStatus(item);
                const Icon = status.icon;
                return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        <Icon size={14} />
                        {status.label}
                    </span>
                );
            },
        },
        {
            key: 'reorderPoint',
            label: 'Điểm đặt lại',
            render: (item: StockItem) => (
                <div className="text-center text-sm text-gray-600">{item.reorderPoint}</div>
            ),
        },
        {
            key: 'actions',
            label: 'Thao tác',
            render: (item: StockItem) => (
                <button
                    onClick={() => handleOpenUpdateModal(item)}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Cập nhật
                </button>
            ),
        },
    ];

    const totalPages = Math.ceil(totalCount / pageSize);

    // Statistics
    const stats = {
        total: stockItems.length,
        low: stockItems.filter(item => item.availableQuantity <= item.reorderPoint && item.availableQuantity > 0).length,
        out: stockItems.filter(item => item.availableQuantity === 0).length,
        ok: stockItems.filter(item => item.availableQuantity > item.reorderPoint).length,
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Cập nhật tồn kho</h1>
                <p className="text-gray-600 mt-1">Quản lý và cập nhật số lượng tồn kho</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng SKU</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <Package className="text-blue-600" size={32} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Còn hàng</p>
                            <p className="text-2xl font-bold text-green-600">{stats.ok}</p>
                        </div>
                        <CheckCircle className="text-green-600" size={32} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Sắp hết</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.low}</p>
                        </div>
                        <AlertCircle className="text-yellow-600" size={32} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Hết hàng</p>
                            <p className="text-2xl font-bold text-red-600">{stats.out}</p>
                        </div>
                        <AlertCircle className="text-red-600" size={32} />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên sách, ISBN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Filter by status */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filterStatus === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setFilterStatus('low')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filterStatus === 'low'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Sắp hết
                        </button>
                        <button
                            onClick={() => setFilterStatus('out')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filterStatus === 'out'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Hết hàng
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <AlertCircle className="mx-auto text-red-500 mb-2" size={48} />
                        <p className="text-gray-600">{error}</p>
                        <button
                            onClick={fetchStockItems}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : stockItems.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="mx-auto text-gray-400 mb-2" size={48} />
                        <p className="text-gray-600">Không có dữ liệu tồn kho</p>
                    </div>
                ) : (
                    <>
                        <Table columns={columns} data={stockItems} />
                        <div className="px-6 py-4 border-t border-gray-200">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalCount={totalCount}
                                pageSize={pageSize}
                                itemsCount={stockItems.length}
                                onPageChange={setCurrentPage}
                                entityName="sản phẩm"
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Update Stock Modal */}
            {showUpdateModal && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Cập nhật tồn kho
                            </h2>
                            
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <p className="font-medium text-gray-900">{selectedItem.bookTitle}</p>
                                <p className="text-sm text-gray-600">Kho: {selectedItem.warehouseName}</p>
                                <p className="text-sm text-gray-600">Tồn kho hiện tại: <span className="font-semibold">{selectedItem.availableQuantity}</span></p>
                            </div>

                            <form onSubmit={handleUpdateStock}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loại giao dịch
                                    </label>
                                    <select
                                        value={updateForm.transactionType}
                                        onChange={(e) => setUpdateForm({ ...updateForm, transactionType: e.target.value as 'IN' | 'OUT' | 'ADJUSTMENT' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="IN">Nhập kho (+)</option>
                                        <option value="OUT">Xuất kho (-)</option>
                                        <option value="ADJUSTMENT">Điều chỉnh</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số lượng
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={updateForm.quantity || ''}
                                        onChange={(e) => setUpdateForm({ ...updateForm, quantity: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập số lượng"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ghi chú
                                    </label>
                                    <textarea
                                        value={updateForm.notes}
                                        onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        placeholder="Ghi chú về giao dịch..."
                                    />
                                </div>

                                {updateForm.transactionType !== 'ADJUSTMENT' && (
                                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            {updateForm.transactionType === 'IN' && (
                                                <>
                                                    <TrendingUp size={16} className="inline mr-1" />
                                                    Tồn kho mới: <span className="font-semibold">{selectedItem.availableQuantity + (updateForm.quantity || 0)}</span>
                                                </>
                                            )}
                                            {updateForm.transactionType === 'OUT' && (
                                                <>
                                                    <TrendingDown size={16} className="inline mr-1" />
                                                    Tồn kho mới: <span className="font-semibold">{Math.max(0, selectedItem.availableQuantity - (updateForm.quantity || 0))}</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseUpdateModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                    >
                                        Cập nhật
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;
