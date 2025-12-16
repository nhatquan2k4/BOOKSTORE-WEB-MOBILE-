// Transaction Histories Page - Using shared UI components
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  EmptyState,
  Pagination,
} from '@/components/ui';
import { orderService } from '@/services/order.service';
import { OrderDto } from '@/types/dtos';

interface Transaction {
  id: string;
  date: string;
  type: 'order' | 'refund';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  orderId?: string;
}

const typeConfig = {
  order: {
    label: 'Mua hàng',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-blue-600"
      >
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </svg>
    ),
  },
  refund: {
    label: 'Hoàn tiền',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-green-600"
      >
        <path d="M12 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5" />
        <path d="m16 19 3 3 3-3" />
        <path d="M18 12h.01" />
        <path d="M19 16v6" />
        <path d="M6 12h.01" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
} as const;

const statusConfig = {
  completed: { label: 'Thành công', color: 'bg-green-100 text-green-700' },
  pending: { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-700' },
  failed: { label: 'Thất bại', color: 'bg-red-100 text-red-700' },
};

export default function TransactionHistoriesPage() {
  const [selectedType, setSelectedType] = useState<'all' | 'order' | 'refund'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load transactions from API (using orders as transactions)
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await orderService.getMyOrders(1, 100);
        
        // Map OrderDto to Transaction
        const txns: Transaction[] = result.items.map((order: OrderDto) => ({
          id: order.id,
          date: order.createdAt,
          type: order.status === 'Cancelled' || order.status === 'Refunded' ? 'refund' : 'order',
          description: `Đơn hàng ${order.id}`,
          amount: order.status === 'Cancelled' || order.status === 'Refunded' ? order.totalPrice : -order.totalPrice,
          status: order.status === 'Delivered' || order.status === 'Completed' ? 'completed' : 
                 order.status === 'Cancelled' || order.status === 'Refunded' ? 'failed' : 'pending',
          orderId: order.id,
        }));
        
        setTransactions(txns);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions =
    selectedType === 'all'
      ? transactions
      : transactions.filter((txn) => txn.type === selectedType);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto space-y-6 px-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Lịch sử giao dịch
          </h1>
          <p className="text-gray-600 mt-1">
            Theo dõi các giao dịch mua hàng và hoàn tiền
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>

        {/* Filters */}
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 py-4">
            <span className="text-sm font-medium text-gray-700">
              Loại giao dịch:
            </span>
            <div className="flex gap-2">
              <Button
                variant={selectedType === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('all')}
              >
                Tất cả
              </Button>
              <Button
                variant={selectedType === 'order' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('order')}
              >
                Mua hàng
              </Button>
              <Button
                variant={selectedType === 'refund' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('refund')}
              >
                Hoàn tiền
              </Button>
            </div>

            <div className="ml-auto text-sm text-gray-500">
              {filteredTransactions.length} giao dịch
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử gần đây</CardTitle>
            <CardDescription>
              Các giao dịch mới nhất của bạn
            </CardDescription>
          </CardHeader>

          {filteredTransactions.length === 0 ? (
            <EmptyState
              title="Chưa có giao dịch"
              description="Lịch sử giao dịch sẽ hiển thị ở đây khi bạn phát sinh giao dịch."
              action={{
                label: 'Quay lại trang chủ',
                onClick: () => {},
              }}
            />
          ) : (
            <CardContent className="divide-y divide-gray-200 p-0">
              {filteredTransactions.map((txn) => (
                <div
                  key={txn.id}
                  className="p-4 md:p-5 hover:bg-gray-50 transition flex items-center gap-4"
                >
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {typeConfig[txn.type].icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">
                        {typeConfig[txn.type].label}
                      </h3>
                      <Badge
                        variant="default"
                        className={statusConfig[txn.status].color}
                      >
                        {statusConfig[txn.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{txn.description}</p>

                    {/* note cho hoàn tiền qr */}
                    {txn.type === 'refund' && (
                      <p className="text-xs text-green-700 mt-1">
                        Hoàn tiền sẽ được chuyển về tài khoản ngân hàng đã dùng
                        để thanh toán.
                      </p>
                    )}

                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(txn.date).toLocaleString('vi-VN')}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        txn.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {txn.amount >= 0 ? '+' : ''}
                      {txn.amount.toLocaleString('vi-VN')}đ
                    </p>
                    {txn.orderId && (
                      <p className="text-xs text-gray-500 mt-1">
                        {txn.orderId}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="py-5">
              <p className="text-sm text-gray-600 mb-2">Tổng chi</p>
              <p className="text-2xl font-bold text-red-600">
                {transactions
                  .filter((t) => t.type === 'order' && t.amount < 0 && t.status === 'completed')
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  .toLocaleString('vi-VN')}
                đ
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <p className="text-sm text-gray-600 mb-2">Tổng hoàn về ngân hàng</p>
              <p className="text-2xl font-bold text-green-600">
                {transactions
                  .filter((t) => t.type === 'refund' && t.amount > 0 && t.status === 'completed')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString('vi-VN')}
                đ
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <p className="text-sm text-gray-600 mb-2">
                Giao dịch thành công
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {transactions.filter((t) => t.status === 'completed').length}
              </p>
            </CardContent>
          </Card>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
