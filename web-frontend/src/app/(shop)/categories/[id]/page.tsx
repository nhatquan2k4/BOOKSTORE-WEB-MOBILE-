"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { bookService, categoryService } from "@/services";
import type { BookDto, CategoryDto } from "@/types/dtos";
import { normalizeImageUrl } from "@/lib/imageUtils";

// ============================================================================
// CONFIG & HELPERS
// ============================================================================


// Helper: Format tiền tệ
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Helper: Tính % giảm giá
const calculateDiscount = (original: number, current: number) => {
  if (original <= 0 || current <= 0 || current >= original) return 0;
  return Math.round(((original - current) / original) * 100);
};

// ============================================================================
// TYPES
// ============================================================================
type BookDisplay = {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  cover: string | null;
  rating: number;
  reviewCount: number;
  isBestseller: boolean;
  stockQuantity: number;
  isAvailable: boolean;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function CategoryDetailPage() {
  const params = useParams();
  const categoryId = params?.id as string;

  // State
  const [category, setCategory] = useState<CategoryDto | null>(null);
  const [subCategories, setSubCategories] = useState<CategoryDto[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  
  const [books, setBooks] = useState<BookDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  // 1. Fetch Category Info
  useEffect(() => {
    const fetchCategoryInfo = async () => {
      if (!categoryId) return;
      try {
        setCategoryLoading(true);
        const catRes = await categoryService.getCategoryById(categoryId);
        setCategory((catRes as any).data || catRes);

        // Fetch sub-categories (nếu có API)
        try {
           // const subs = await categoryService.getSubCategories(categoryId);
           // setSubCategories(subs);
           setSubCategories([]); 
        } catch (err) {
           console.log("No subcategories");
        }
      } catch (error) {
        console.error("Error fetching category:", error);
      } finally {
        setCategoryLoading(false);
      }
    };
    fetchCategoryInfo();
  }, [categoryId]);

  // 2. Fetch Books
  useEffect(() => {
    const fetchBooks = async () => {
      if (!categoryId) return;

      try {
        setLoading(true);
        const targetId = selectedSubCategory === "all" ? categoryId : selectedSubCategory;

        const response = await bookService.getBooks({
          pageNumber: currentPage,
          pageSize: itemsPerPage,
          categoryId: targetId
        });

        if (response.items && response.items.length > 0) {
          // --- LOGIC MAP DỮ LIỆU ĐÃ SỬA ---
          const transformedBooks: BookDisplay[] = response.items.map((book: any) => {
            // Ưu tiên lấy currentPrice, nếu không có thì lấy price, không có nữa thì 0
            const finalPrice = book.currentPrice ?? book.price ?? 0;
            const originalPrice = book.originalPrice ?? 0;

            return {
              id: book.id,
              title: book.title,
              author: book.authorNames?.[0] || "Tác giả không xác định",
              cover: normalizeImageUrl(book.coverImage),
              rating: book.averageRating || 0,
              reviewCount: book.totalReviews || 0,
              price: finalPrice, // Sử dụng giá đã check kỹ
              originalPrice: originalPrice > finalPrice ? originalPrice : undefined,
              isBestseller: (book.totalReviews || 0) > 50,
              stockQuantity: book.stockQuantity ?? 0,
              isAvailable: book.isAvailable ?? true,
            };
          });

          setBooks(transformedBooks);
          setTotalItems(response.totalCount || 0);
        } else {
          setBooks([]);
          setTotalItems(0);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [categoryId, selectedSubCategory, currentPage]);

  // Handlers
  const handleSubCategoryChange = (subCatId: string) => {
    setSelectedSubCategory(subCatId);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // --- RENDER ---

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy danh mục</h2>
        <Link href="/" className="text-blue-600 hover:underline">Về trang chủ</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          {" / "}
          <Link href="/categories" className="hover:text-blue-600">Danh mục</Link>
          {" / "}
          <span className="font-medium text-gray-800">{category.name}</span>
        </nav>

        {/* Header - Giữ phần "Não bộ" & Icon */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">{category.name}</h1>
          </div>
          
          <p className="text-gray-600 text-lg">
            {(category as any).description || `Khám phá những cuốn sách hay nhất thuộc chủ đề ${category.name}`}
          </p>
          <p className="text-gray-500 text-sm mt-1">
             Tìm thấy <span className="font-bold text-gray-800">{totalItems}</span> đầu sách
          </p>
        </div>

        {/* Subcategory Filters */}
        {subCategories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-3">
            <Button
              onClick={() => handleSubCategoryChange("all")}
              variant={selectedSubCategory === "all" ? "primary" : "outline"}
              size="sm"
            >
              Tất cả
            </Button>
            {subCategories.map((sub) => (
              <Button
                key={sub.id}
                onClick={() => handleSubCategoryChange(sub.id)}
                variant={selectedSubCategory === sub.id ? "primary" : "outline"}
                size="sm"
              >
                {sub.name}
              </Button>
            ))}
          </div>
        )}

        {/* Loading Books */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col rounded-xl bg-white p-3 shadow-sm animate-pulse">
                <div className="w-full aspect-[3/4] bg-gray-200 rounded-lg mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có sách nào</h3>
            <p className="text-gray-600 mb-4">Chúng tôi đang cập nhật thêm sách cho danh mục này.</p>
            <Link href="/categories" className="inline-block text-blue-600 hover:underline font-medium">
              Xem các danh mục khác →
            </Link>
          </div>
        ) : (
          /* Books Grid - Giao diện giống Life Skills */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="flex flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg hover:-translate-y-1 group border border-transparent hover:border-blue-100"
              >
                {/* Book Cover */}
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg mb-3 shadow-inner">
                  {book.cover ? (
                    <Image
                      src={book.cover}
                      alt={book.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Badges Container */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    {/* Bestseller Badge */}
                    {book.isBestseller && (
                      <Badge className="text-[10px] bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-md px-2 py-0.5">
                        HOT
                      </Badge>
                    )}
                    
                    {/* Stock Badge */}
                    {!book.isAvailable || book.stockQuantity === 0 ? (
                      <Badge variant="danger" className="text-[10px] font-bold px-2 py-0.5">
                        HẾT HÀNG
                      </Badge>
                    ) : book.stockQuantity > 0 && book.stockQuantity < 10 ? (
                      <Badge variant="warning" className="text-[10px] font-bold px-2 py-0.5">
                        Còn {book.stockQuantity}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                {/* Book Info */}
                <h3 className="font-bold text-sm text-gray-800 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors min-h-[40px]" title={book.title}>
                  {book.title}
                </h3>
                <p className="text-xs text-gray-500 mb-2 line-clamp-1">{book.author}</p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  {book.rating > 0 ? (
                    <>
                      <span className="text-yellow-400 text-xs">★</span>
                      <span className="text-xs font-medium text-gray-700">{book.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-gray-400">({book.reviewCount})</span>
                    </>
                  ) : (
                    <span className="text-[10px] text-gray-400 italic">Chưa có đánh giá</span>
                  )}
                </div>

                {/* Price - Đã Fix hiển thị */}
                <div className="mt-auto flex items-center gap-2 flex-wrap pt-2 border-t border-gray-50">
                  <p className="text-red-600 font-bold text-sm">
                    {formatPrice(book.price)}
                  </p>
                  {book.originalPrice && (
                    <>
                      <p className="text-[10px] text-gray-400 line-through">
                        {formatPrice(book.originalPrice)}
                      </p>
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1 rounded">
                        -{calculateDiscount(book.originalPrice, book.price)}%
                      </span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex justify-center mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </main>
  );
}