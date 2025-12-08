import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Package, Calendar, BookOpen, Globe, FileText } from 'lucide-react';
import { bookService } from '../services';
import type { BookDetail } from '../types';

const BookDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [book, setBook] = useState<BookDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchBookDetail(id);
        }
    }, [id]);

    const fetchBookDetail = async (bookId: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await bookService.getById(bookId);
            setBook(data);
        } catch (err: any) {
            console.error('Error fetching book detail:', err);
            setError(err.message || 'Không thể tải thông tin sách');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        // Navigate to edit page
        console.log('Edit book:', book?.id);
    };

    const handleDelete = async () => {
        if (window.confirm(`Bạn có chắc muốn xóa sách "${book?.title}"?`)) {
            try {
                await bookService.delete(book!.id);
                navigate('/books');
            } catch (err) {
                console.error('Error deleting book:', err);
                alert('Không thể xóa sách');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải thông tin sách...</p>
                </div>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-semibold">Lỗi</p>
                <p>{error || 'Không tìm thấy thông tin sách'}</p>
                <button
                    onClick={() => navigate('/books')}
                    className="mt-4 text-blue-600 hover:text-blue-800 underline"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    const coverImage = book.images.find(img => img.isCover)?.imageUrl || book.images[0]?.imageUrl;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/books')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Quay lại danh sách</span>
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Edit size={18} />
                        Chỉnh sửa
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <Trash2 size={18} />
                        Xóa
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
                    {/* Left Column - Book Cover */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            {coverImage ? (
                                <img
                                    src={coverImage}
                                    alt={book.title}
                                    className="w-full rounded-lg shadow-md object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://via.placeholder.com/400x600?text=No+Image';
                                    }}
                                />
                            ) : (
                                <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg flex items-center justify-center">
                                    <BookOpen size={64} className="text-gray-400" />
                                </div>
                            )}

                            {/* Additional Images */}
                            {book.images.length > 1 && (
                                <div className="mt-4 grid grid-cols-4 gap-2">
                                    {book.images.slice(0, 4).map((image) => (
                                        <img
                                            key={image.id}
                                            src={image.imageUrl}
                                            alt={`${book.title} - ${image.displayOrder}`}
                                            className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://via.placeholder.com/100';
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Availability Status */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Package size={20} className={book.isAvailable ? 'text-green-600' : 'text-red-600'} />
                                    <span className={`font-semibold ${book.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                        {book.isAvailable ? 'Còn hàng' : 'Hết hàng'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Book Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title & Basic Info */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-gray-600">
                                <span className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    {book.publicationYear}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Globe size={16} />
                                    {book.language}
                                </span>
                                <span className="flex items-center gap-1">
                                    <FileText size={16} />
                                    {book.pageCount} trang
                                </span>
                                {book.edition && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                        {book.edition}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Authors */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Tác giả</h3>
                            <div className="flex flex-wrap gap-2">
                                {book.authors.map((author) => (
                                    <div key={author.id} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                                        {author.avartarUrl ? (
                                            <img
                                                src={author.avartarUrl}
                                                alt={author.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                                {author.name.charAt(0)}
                                            </div>
                                        )}
                                        <span className="font-medium">{author.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Categories */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Thể loại</h3>
                            <div className="flex flex-wrap gap-2">
                                {book.categories.map((category) => (
                                    <span
                                        key={category.id}
                                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium"
                                    >
                                        {category.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Publisher */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Nhà xuất bản</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="font-semibold text-lg">{book.publisher.name}</p>
                                {book.publisher.address && (
                                    <p className="text-gray-600 text-sm mt-1">{book.publisher.address}</p>
                                )}
                                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                    {book.publisher.email && <span>📧 {book.publisher.email}</span>}
                                    {book.publisher.phoneNumber && <span>📞 {book.publisher.phoneNumber}</span>}
                                </div>
                            </div>
                        </div>

                        {/* ISBN & Format */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">ISBN</h3>
                                <p className="text-lg font-mono bg-gray-50 px-4 py-2 rounded-lg">{book.isbn}</p>
                            </div>
                            {book.bookFormat && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Định dạng</h3>
                                    <p className="text-lg bg-gray-50 px-4 py-2 rounded-lg">{book.bookFormat.name}</p>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {book.description && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Mô tả</h3>
                                <div className="prose max-w-none bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{book.description}</p>
                                </div>
                            </div>
                        )}

                        {/* Metadata */}
                        {book.metadata.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Thông tin bổ sung</h3>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                    {book.metadata.map((meta) => (
                                        <div key={meta.id} className="flex justify-between">
                                            <span className="font-medium text-gray-700">{meta.key}:</span>
                                            <span className="text-gray-600">{meta.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Files */}
                        {book.files.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Tài liệu đính kèm</h3>
                                <div className="space-y-2">
                                    {book.files.map((file) => (
                                        <div
                                            key={file.id}
                                            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText size={20} className="text-blue-600" />
                                                <div>
                                                    <p className="font-medium">{file.fileType}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={file.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Tải xuống
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailPage;
