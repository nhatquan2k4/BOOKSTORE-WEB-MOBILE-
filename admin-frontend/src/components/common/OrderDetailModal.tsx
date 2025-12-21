import React from 'react';
import { X, Package, MapPin, Calendar, CreditCard, User } from 'lucide-react';
import type { Order } from '../../types';

interface OrderDetailModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose }) => {
    if (!isOpen || !order) return null;

    const getStatusColor = (status: Order['status']) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            processing: 'bg-blue-100 text-blue-800 border-blue-300',
            shipped: 'bg-purple-100 text-purple-800 border-purple-300',
            delivered: 'bg-green-100 text-green-800 border-green-300',
            completed: 'bg-green-100 text-green-800 border-green-300',
            cancelled: 'bg-red-100 text-red-800 border-red-300',
        };
        return colors[status];
    };

    const getStatusText = (status: Order['status']) => {
        const texts = {
            pending: 'Chờ xử lý',
            processing: 'Đang xử lý',
            shipped: 'Đang giao',
            delivered: 'Đã giao',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy',
        };
        return texts[status];
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Chi tiết đơn hàng</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Mã đơn: <span className="font-semibold">{order.orderNumber || order.id}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Status and Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar size={18} className="text-gray-600" />
                                <span className="text-sm font-semibold text-gray-600">Ngày đặt hàng</span>
                            </div>
                            <p className="text-gray-800 font-medium">
                                {new Date(order.orderDate || order.createdAt || new Date()).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Package size={18} className="text-gray-600" />
                                <span className="text-sm font-semibold text-gray-600">Trạng thái</span>
                            </div>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                            </span>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <User size={18} className="text-gray-600" />
                            <h3 className="font-semibold text-gray-800">Thông tin khách hàng</h3>
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-700">
                                <span className="font-medium">Tên:</span> {order.customerName || 'N/A'}
                            </p>
                            {order.phoneNumber && (
                                <p className="text-gray-700">
                                    <span className="font-medium">Số điện thoại:</span> {order.phoneNumber}
                                </p>
                            )}
                            {order.email && (
                                <p className="text-gray-700">
                                    <span className="font-medium">Email:</span> {order.email}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin size={18} className="text-gray-600" />
                            <h3 className="font-semibold text-gray-800">Địa chỉ giao hàng</h3>
                        </div>
                        <p className="text-gray-700">{order.deliveryAddress || order.shippingAddress || 'N/A'}</p>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Package size={18} />
                            Sản phẩm
                        </h3>
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Sản phẩm</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Số lượng</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Đơn giá</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {order.items?.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-800">{item.bookTitle}</p>
                                                {item.isbn && (
                                                    <p className="text-sm text-gray-500">ISBN: {item.isbn}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right text-gray-700">
                                                ${item.price?.toFixed(2) || '0.00'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-gray-800">
                                                ${((item.price || 0) * item.quantity).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <CreditCard size={18} className="text-gray-600" />
                            <h3 className="font-semibold text-gray-800">Thanh toán</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-gray-700">
                                <span>Tạm tính:</span>
                                <span>${(order.subtotal || order.totalAmount)?.toFixed(2) || '0.00'}</span>
                            </div>
                            {order.shippingFee !== undefined && order.shippingFee > 0 && (
                                <div className="flex justify-between text-gray-700">
                                    <span>Phí vận chuyển:</span>
                                    <span>${order.shippingFee.toFixed(2)}</span>
                                </div>
                            )}
                            {order.discount !== undefined && order.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Giảm giá:</span>
                                    <span>-${order.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t border-gray-300 pt-2 mt-2">
                                <div className="flex justify-between text-lg font-bold text-gray-800">
                                    <span>Tổng cộng:</span>
                                    <span className="text-green-600">
                                        ${order.totalAmount?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                            </div>
                            {order.paymentMethod && (
                                <div className="flex justify-between text-gray-700 text-sm mt-2">
                                    <span>Phương thức thanh toán:</span>
                                    <span className="font-medium">{order.paymentMethod}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-2">Ghi chú</h3>
                            <p className="text-gray-700">{order.notes}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                    >
                        Đóng
                    </button>
                    {order.status === 'pending' && (
                        <button
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Xử lý đơn hàng
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
