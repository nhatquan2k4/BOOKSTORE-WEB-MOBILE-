import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, X, TrendingUp, TrendingDown, Package, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import Table from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import type { Book } from '../types';
import { bookService } from '../services';
import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

interface StockUpdateForm {
    bookId: string;
    bookTitle: string;
    currentStock: number;
    quantity: number;
    transactionType: 'IN' | 'OUT' | 'ADJUSTMENT';
    warehouseId: string;
    notes: string;
}

const BooksPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;
    
    // Stock statistics
    const [stockStats, setStockStats] = useState({
        totalSKU: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
    });
    
    // Stock update modal
    const [showStockModal, setShowStockModal] = useState(false);
    const [stockForm, setStockForm] = useState<StockUpdateForm>({
        bookId: '',
        bookTitle: '',
        currentStock: 0,
        quantity: 0,
        transactionType: 'IN',
        warehouseId: '',
        notes: '',
    });
    const [warehouses, setWarehouses] = useState<any[]>([]);
    
    // Get filters from URL
    const authorId = searchParams.get('authorId');
    const categoryId = searchParams.get('categoryId');

    // Fetch books from API
    useEffect(() => {
        fetchBooks();
        fetchStockStats();
    }, [currentPage, searchTerm, authorId, categoryId]);

    // Fetch warehouses on mount
    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.WAREHOUSES.LIST);
            const warehouseList = response.data.items || response.data || [];
            setWarehouses(warehouseList);
            if (warehouseList.length > 0) {
                setStockForm(prev => ({ ...prev, warehouseId: warehouseList[0].id }));
            }
        } catch (err) {
            console.error('Error fetching warehouses:', err);
        }
    };

    const fetchStockStats = async () => {
        try {
            // Fetch all books to calculate accurate statistics
            const response = await bookService.getAll({
                page: 1,
                pageSize: 1000, // Get all books for accurate stats
                search: searchTerm || undefined,
                authorId: authorId || undefined,
                categoryId: categoryId || undefined,
            });
            
            const allBooks = response.items;
            const stats = {
                totalSKU: response.totalCount,
                inStock: allBooks.filter((book: Book) => (book.stockQuantity || 0) > 20).length,
                lowStock: allBooks.filter((book: Book) => {
                    const qty = book.stockQuantity || 0;
                    return qty > 0 && qty <= 20;
                }).length,
                outOfStock: allBooks.filter((book: Book) => (book.stockQuantity || 0) === 0).length,
            };
            setStockStats(stats);
        } catch (err) {
            console.error('Error fetching stock stats:', err);
        }
    };

    const fetchBooks = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await bookService.getAll({
                page: currentPage,
                pageSize: pageSize,
                search: searchTerm || undefined,
                authorId: authorId || undefined,
                categoryId: categoryId || undefined,
            });
            setBooks(response.items);
            setTotalCount(response.totalCount);
        } catch (err: any) {
            console.error('Error fetching books:', err);
            setError(err.message || 'Không thể tải danh sách sách');
        } finally {
            setLoading(false);
        }
    };

    const clearFilter = (filterType: 'author' | 'category') => {
        const params = new URLSearchParams(searchParams);
        if (filterType === 'author') {
            params.delete('authorId');
        } else {
            params.delete('categoryId');
        }
        setSearchParams(params);
        setCurrentPage(1);
    };

    const columns = [
        { key: 'title', label: 'Tên sách' },
        {
            key: 'authorNames',
            label: 'Tác giả',
            render: (value: string[]) => value.join(', ')
        },
        {
            key: 'categoryNames',
            label: 'Danh mục',
            render: (value: string[]) => value.join(', ')
        },
        {
            key: 'currentPrice',
            label: 'Giá',
            render: (value?: number) => value ? `${value.toLocaleString('vi-VN')}₫` : 'N/A'
        },
        {
            key: 'stockQuantity',
            label: 'Tồn kho',
            render: (value?: number) => (
                <span className={!value || value < 20 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                    {value ?? 0}
                </span>
            )
        },
    ];

    const handleEdit = (book: Book) => {
        // Open stock update modal
        setStockForm({
            bookId: book.id,
            bookTitle: book.title,
            currentStock: book.stockQuantity || 0,
            quantity: 0,
            transactionType: 'IN',
            warehouseId: warehouses.length > 0 ? warehouses[0].id : '',
            notes: '',
        });
        setShowStockModal(true);
    };

    const handleCloseStockModal = () => {
        setShowStockModal(false);
        setStockForm({
            bookId: '',
            bookTitle: '',
            currentStock: 0,
            quantity: 0,
            transactionType: 'IN',
            warehouseId: '',
            notes: '',
        });
    };

    const handleUpdateStock = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stockForm.quantity || stockForm.quantity === 0) {
            alert('Vui lòng nhập số lượng');
            return;
        }

        if (!stockForm.warehouseId) {
            alert('Vui lòng chọn kho');
            return;
        }

        try {
            // First, get or create stock item for this book
            
            try {
                const stockResponse = await apiClient.get(API_ENDPOINTS.STOCK_ITEMS.GET_BY_BOOK(stockForm.bookId));
                const stockItems = stockResponse.data.items || stockResponse.data || [];
                
                // Find stock item for selected warehouse
                const existingStock = stockItems.find((item: any) => item.warehouseId === stockForm.warehouseId);
                
                if (!existingStock) {
                    // Create new stock item
                    await apiClient.post(API_ENDPOINTS.STOCK_ITEMS.CREATE, {
                        bookId: stockForm.bookId,
                        warehouseId: stockForm.warehouseId,
                        quantity: 0,
                        minStockLevel: 10,
                        maxStockLevel: 1000,
                        reorderPoint: 20,
                    });
                }
            } catch (err) {
                console.error('Error getting stock item:', err);
                alert('Không thể lấy thông tin tồn kho');
                return;
            }

            // Create inventory transaction
            // Map transaction type to API format
            const transactionTypeMap: Record<string, string> = {
                'IN': 'Inbound',
                'OUT': 'Outbound',
                'ADJUSTMENT': 'Adjustment'
            };

            // Calculate quantity change based on transaction type
            // Inbound: positive, Outbound: negative, Adjustment: as entered
            let quantityChange = stockForm.quantity;
            if (stockForm.transactionType === 'OUT') {
                quantityChange = -Math.abs(stockForm.quantity); // Ensure negative for outbound
            } else if (stockForm.transactionType === 'IN') {
                quantityChange = Math.abs(stockForm.quantity); // Ensure positive for inbound
            }

            const transactionData = {
                warehouseId: stockForm.warehouseId,
                bookId: stockForm.bookId,
                type: transactionTypeMap[stockForm.transactionType],
                quantityChange: quantityChange,
                note: stockForm.notes || `${stockForm.transactionType === 'IN' ? 'Nhập' : stockForm.transactionType === 'OUT' ? 'Xuất' : 'Điều chỉnh'} kho sách: ${stockForm.bookTitle}`,
            };

            console.log('Creating transaction:', transactionData);
            await apiClient.post(API_ENDPOINTS.INVENTORY_TRANSACTIONS.CREATE, transactionData);
            
            // Update stock quantity
            const updateStockData = {
                quantity: Math.abs(stockForm.quantity),
                operation: stockForm.transactionType === 'IN' ? 'increase' : 
                          stockForm.transactionType === 'OUT' ? 'decrease' : 'set',
                reason: stockForm.notes || `${stockForm.transactionType === 'IN' ? 'Nhập' : stockForm.transactionType === 'OUT' ? 'Xuất' : 'Điều chỉnh'} kho`
            };
            
            console.log('Updating stock:', updateStockData);
            await apiClient.put(
                `/StockItems/book/${stockForm.bookId}/warehouse/${stockForm.warehouseId}`,
                updateStockData
            );
            
            alert('Cập nhật tồn kho thành công!');
            handleCloseStockModal();
            fetchBooks(); // Reload book list
            fetchStockStats(); // Update statistics
        } catch (err: any) {
            console.error('Error updating stock:', err);
            alert(err.response?.data?.message || 'Không thể cập nhật tồn kho');
        }
    };

    const handleDelete = async (book: Book) => {
        if (window.confirm(`Bạn có chắc muốn xóa sách "${book.title}"?`)) {
            try {
                await bookService.delete(book.id);
                alert('Xóa sách thành công!');
                fetchBooks(); // Reload list after delete
            } catch (err: any) {
                console.error('Error deleting book:', err);
                console.error('Error response:', err.response);
                
                let errorMessage = 'Không thể xóa sách';
                
                if (err.response) {
                    // Server responded with error
                    const status = err.response.status;
                    const data = err.response.data;
                    
                    if (status === 500) {
                        errorMessage = 'Lỗi server: Không thể xóa sách này. Có thể sách đang có ảnh, đơn hàng hoặc dữ liệu liên quan khác.';
                    } else if (status === 404) {
                        errorMessage = 'Sách không tồn tại hoặc đã bị xóa';
                    } else if (status === 403) {
                        errorMessage = 'Bạn không có quyền xóa sách này';
                    } else {
                        errorMessage = data?.message || data?.title || err.message || errorMessage;
                    }
                } else if (err.request) {
                    errorMessage = 'Không thể kết nối đến server';
                } else {
                    errorMessage = err.message || errorMessage;
                }
                
                alert(`Lỗi xóa sách:\n${errorMessage}\n\nVui lòng liên hệ quản trị viên hoặc kiểm tra xem sách có dữ liệu liên quan không.`);
            }
        }
    };

    const handleView = (book: Book) => {
        navigate(`/books/${book.id}`);
    };

    const filteredBooks = books;

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Cập nhật tồn kho</h1>
                    <p className="text-gray-600 text-sm mt-1">Quản lý và cập nhật số lượng tồn kho</p>
                </div>
                <button 
                    onClick={() => navigate('/books/create')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Thêm sách mới
                </button>
            </div>

            {/* Stock Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Tổng Sách</p>
                            <p className="text-3xl font-bold text-gray-900">{stockStats.totalSKU}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package size={24} className="text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Còn hàng</p>
                            <p className="text-3xl font-bold text-green-600">{stockStats.inStock}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle size={24} className="text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Sắp hết</p>
                            <p className="text-3xl font-bold text-orange-600">{stockStats.lowStock}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <AlertCircle size={24} className="text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Hết hàng</p>
                            <p className="text-3xl font-bold text-red-600">{stockStats.outOfStock}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <XCircle size={24} className="text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Filters */}
            {(authorId || categoryId) && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {authorId && (
                        <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                            <span className="text-sm">Lọc theo tác giả</span>
                            <button
                                onClick={() => clearFilter('author')}
                                className="hover:bg-blue-200 rounded-full p-1"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    {categoryId && (
                        <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                            <span className="text-sm">Lọc theo thể loại</span>
                            <button
                                onClick={() => clearFilter('category')}
                                className="hover:bg-purple-200 rounded-full p-1"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1 flex items-center bg-gray-100 rounded-lg px-4 py-2">
                        <Search size={20} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, tác giả, ISBN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none ml-2 w-full"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                </div>
            ) : (
                <>
                    <Table
                        columns={columns}
                        data={filteredBooks}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                    />

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        itemsCount={filteredBooks?.length || 0}
                        onPageChange={setCurrentPage}
                        entityName="sách"
                    />
                </>
            )}

            {/* Stock Update Modal */}
            {showStockModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Cập nhật tồn kho
                            </h2>
                            
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <p className="font-medium text-gray-900">{stockForm.bookTitle}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Tồn kho hiện tại: <span className="font-semibold text-lg">{stockForm.currentStock}</span>
                                </p>
                            </div>

                            <form onSubmit={handleUpdateStock}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kho <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={stockForm.warehouseId}
                                        onChange={(e) => setStockForm({ ...stockForm, warehouseId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Chọn kho</option>
                                        {warehouses.map((warehouse) => (
                                            <option key={warehouse.id} value={warehouse.id}>
                                                {warehouse.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loại giao dịch
                                    </label>
                                    <select
                                        value={stockForm.transactionType}
                                        onChange={(e) => setStockForm({ ...stockForm, transactionType: e.target.value as 'IN' | 'OUT' | 'ADJUSTMENT' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="IN">Nhập kho (+)</option>
                                        <option value="OUT">Xuất kho (-)</option>
                                        <option value="ADJUSTMENT">Điều chỉnh</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số lượng <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={stockForm.quantity || ''}
                                        onChange={(e) => setStockForm({ ...stockForm, quantity: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Nhập số lượng"
                                        required
                                    />
                                </div>

                                {stockForm.transactionType !== 'ADJUSTMENT' && stockForm.quantity > 0 && (
                                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            {stockForm.transactionType === 'IN' && (
                                                <>
                                                    <TrendingUp size={16} className="inline mr-1" />
                                                    Tồn kho mới: <span className="font-semibold">{stockForm.currentStock + stockForm.quantity}</span>
                                                </>
                                            )}
                                            {stockForm.transactionType === 'OUT' && (
                                                <>
                                                    <TrendingDown size={16} className="inline mr-1" />
                                                    Tồn kho mới: <span className="font-semibold">{Math.max(0, stockForm.currentStock - stockForm.quantity)}</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ghi chú
                                    </label>
                                    <textarea
                                        value={stockForm.notes}
                                        onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Ghi chú về giao dịch..."
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseStockModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
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

export default BooksPage;
