'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  EmptyState,
} from '@/components/ui';

interface WishlistItem {
  id: number;
  title: string;
  author: string;
  cover: string;
  price: number;
  originalPrice?: number;
  rating: number;
  inStock: boolean;
  addedDate: string;
}

const mockWishlist: WishlistItem[] = [];

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>(mockWishlist);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);

  // ====== HÀM GỌI API (placeholder) ======
  // sau này bạn chỉ cần đổi URL và body cho khớp BE
  const addManyToCartApi = async (items: { bookId: number; quantity: number }[]) => {
    const res = await fetch('/api/cart/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    if (!res.ok) {
      throw new Error('Failed to add to cart');
    }

    return res.json();
  };

  const addSingleToCartApi = async (item: { bookId: number; quantity: number }) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) {
      throw new Error('Failed to add single item');
    }
    return res.json();
  };

  // ====== HÀM UI GỌI API ======

  const addToCart = async (id: number) => {
    const item = wishlist.find((x) => x.id === id);
    if (!item || !item.inStock) return;

    try {
      await addSingleToCartApi({ bookId: item.id, quantity: 1 });
      // nếu muốn: hiện toast
      // toast.success('Đã thêm vào giỏ');
    } catch (err) {
      console.error(err);
      // toast.error('Thêm vào giỏ thất bại');
    }
  };

  const addAllToCart = async () => {
    // chỉ lấy sách còn hàng
    const items = wishlist
      .filter((x) => x.inStock)
      .map((x) => ({
        bookId: x.id,
        quantity: 1,
      }));

    if (items.length === 0) return;

    try {
      setLoadingAll(true);
      await addManyToCartApi(items);
      // toast.success('Đã thêm tất cả vào giỏ');
    } catch (err) {
      console.error(err);
      // toast.error('Thêm tất cả thất bại');
    } finally {
      setLoadingAll(false);
    }
  };

  // ====== phần render giữ nguyên ý tưởng của bạn ======
  const totalValue = wishlist.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sách yêu thích</h1>
          <p className="text-gray-600 mt-1">{wishlist.length} sản phẩm</p>
        </div>

        {wishlist.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                title="Danh sách yêu thích trống"
                description="Hãy thêm những cuốn sách bạn thích vào đây."
                action={{
                  label: 'Khám phá sách',
                  onClick: () => router.push('/books'),
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ... danh sách của bạn ... */}

            {/* Summary */}
            <Card>
              <CardContent className="flex items-center justify-between py-5">
                <div>
                  <p className="text-gray-600">Tổng giá trị danh sách</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {totalValue.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <Button onClick={addAllToCart} disabled={loadingAll}>
                  {loadingAll ? 'Đang thêm...' : 'Thêm tất cả vào giỏ'}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
