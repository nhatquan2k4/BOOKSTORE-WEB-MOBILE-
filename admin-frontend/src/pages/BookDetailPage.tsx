import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Package, Calendar, BookOpen, Globe, FileText, DollarSign, X, Upload } from 'lucide-react';
import { bookService, bookImageService, authorService, publisherService, categoryService } from '../services';
import type { BookDetail, Author, Publisher, Category } from '../types';
import { getImageUrl } from '../constants/config';

const BookDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [book, setBook] = useState<BookDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [editPrice, setEditPrice] = useState('');
    const [uploadingImages, setUploadingImages] = useState(false);
    
    // Edit form state
    const [editForm, setEditForm] = useState({
        title: '',
        isbn: '',
        description: '',
        publicationYear: 2024,
        language: 'Tiếng Việt',
        edition: '',
        pageCount: 0,
        publisherId: '',
        authorIds: [] as string[],
        categoryIds: [] as string[]
    });
    
    // Dropdown data
    const [authors, setAuthors] = useState<Author[]>([]);
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

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

    const handleEdit = async () => {
        if (!book) return;
        
        // Load dropdown data
        try {
            const [authorsData, publishersData, categoriesData] = await Promise.all([
                authorService.getAll({ pageSize: 1000 }),
                publisherService.getAll({ pageSize: 1000 }),
                categoryService.getAll({ pageSize: 1000 })
            ]);
            
            setAuthors(authorsData.items);
            setPublishers(publishersData.items);
            setCategories(categoriesData.items);
            
            // Populate form with current book data
            setEditForm({
                title: book.title,
                isbn: book.isbn,
                description: book.description || '',
                publicationYear: book.publicationYear,
                language: book.language,
                edition: book.edition || '',
                pageCount: book.pageCount,
                publisherId: book.publisher.id,
                authorIds: book.authors.map(a => a.id),
                categoryIds: book.categories.map(c => c.id)
            });
            
            setShowEditModal(true);
        } catch (err: any) {
            alert('Lỗi khi tải dữ liệu: ' + err.message);
        }
    };

    const handleEditPrice = () => {
        if (book) {
            setEditPrice(book.currentPrice?.toString() || '');
            setShowPriceModal(true);
        }
    };

    const handleSavePrice = async () => {
        if (!book || !editPrice) return;
        
        console.log('=== SAVE PRICE DEBUG ===');
        console.log('Book ID:', book.id);
        console.log('Edit Price:', editPrice);
        console.log('Parsed Price:', parseFloat(editPrice));
        
        try {
            console.log('Sending request to updatePrice...');
            const result = await bookService.updatePrice(book.id, parseFloat(editPrice));
            console.log('Update price response:', result);
            
            alert('Cập nhật giá thành công!');
            setShowPriceModal(false);
            fetchBookDetail(book.id);
        } catch (err: any) {
            console.error('=== ERROR UPDATING PRICE ===');
            console.error('Error object:', err);
            console.error('Error message:', err.message);
            console.error('Error response:', err.response);
            console.error('Error response data:', err.response?.data);
            console.error('Error response status:', err.response?.status);
            console.error('Error config:', err.config);
            
            const errorMessage = err.response?.data?.message || err.response?.data?.details || err.message || 'Lỗi không xác định';
            alert(`Lỗi: ${errorMessage}`);
        }
    };

    const handleSaveBook = async () => {
        if (!book) return;
        
        // Validation
        if (!editForm.title.trim()) {
            alert('Vui lòng nhập tên sách');
            return;
        }
        if (!editForm.isbn.trim()) {
            alert('Vui lòng nhập ISBN');
            return;
        }
        if (!/^\d{10}$|^\d{13}$/.test(editForm.isbn)) {
            alert('ISBN phải có 10 hoặc 13 chữ số');
            return;
        }
        if (editForm.authorIds.length === 0) {
            alert('Vui lòng chọn ít nhất một tác giả');
            return;
        }
        if (editForm.categoryIds.length === 0) {
            alert('Vui lòng chọn ít nhất một thể loại');
            return;
        }
        
        try {
            await bookService.update(book.id, editForm);
            alert('Cập nhật sách thành công!');
            setShowEditModal(false);
            fetchBookDetail(book.id);
        } catch (err: any) {
            alert(`Lỗi: ${err.message}`);
        }
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !book) return;

        setUploadingImages(true);
        try {
            // Nếu upload 1 file → set làm cover (ghi đè ảnh cũ)
            // Nếu upload nhiều file → không set cover (thêm ảnh phụ)
            const isCoverImage = files.length === 1;
            const currentImageCount = book.images?.length || 0;
            
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append('file', files[i]);
                formData.append('isCover', isCoverImage ? 'true' : 'false');
                formData.append('displayOrder', (currentImageCount + i).toString());

                await bookImageService.upload(book.id, formData);
            }

            alert(`Đã thêm ${files.length} ảnh thành công!`);
            fetchBookDetail(book.id);
        } catch (err: any) {
            console.error('Error uploading images:', err);
            alert(`Lỗi khi upload ảnh: ${err.message || 'Vui lòng thử lại'}`);
        } finally {
            setUploadingImages(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        if (!book || !window.confirm('Bạn có chắc muốn xóa ảnh này?')) return;

        try {
            await bookImageService.delete(book.id, imageId);
            alert('Xóa ảnh thành công!');
            fetchBookDetail(book.id);
        } catch (err: any) {
            alert(`Lỗi: ${err.message || 'Không thể xóa ảnh'}`);
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

    const coverImage = book.images?.find(img => img.isCover)?.imageUrl || book.images?.[0]?.imageUrl;
    const coverImageUrl = getImageUrl(coverImage);

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
                <div className="flex gap-2">
                    <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Edit size={18} />
                        <span>Sửa thông tin</span>
                    </button>
                    <button
                        onClick={handleEditPrice}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <DollarSign size={18} />
                        <span>Sửa giá</span>
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <Trash2 size={18} />
                        <span>Xóa</span>
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
                                    src={coverImageUrl}
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
                            {book.images && book.images.length > 1 && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Ảnh khác</h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {book.images.map((image) => (
                                            <div key={image.id} className="relative group">
                                                <img
                                                    src={getImageUrl(image.imageUrl)}
                                                    alt={`${book.title} - ${image.displayOrder}`}
                                                    className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://via.placeholder.com/100';
                                                    }}
                                                />
                                                <button
                                                    onClick={() => handleDeleteImage(image.id)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Xóa ảnh"
                                                >
                                                    <X size={14} />
                                                </button>
                                                {image.isCover && (
                                                    <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                                        Bìa
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload More Images */}
                            <div className="mt-4">
                                <label className="block">
                                    <div className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Upload size={20} />
                                            <span className="text-sm font-medium">
                                                {uploadingImages ? 'Đang tải ảnh...' : 'Thêm ảnh mới'}
                                            </span>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        disabled={uploadingImages}
                                    />
                                </label>
                                <p className="text-xs text-gray-500 mt-1 text-center">
                                    Có thể chọn nhiều ảnh cùng lúc
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Book Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title & Basic Info */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                            
                            {/* Price & Availability */}
                            <div className="flex items-center gap-4 mb-4">
                                {book.currentPrice && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-500 uppercase">Giá:</span>
                                        <span className="text-2xl font-bold text-green-600">
                                            {book.currentPrice.toLocaleString('vi-VN')}₫
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Package size={20} className={book.isAvailable ? 'text-green-600' : 'text-red-600'} />
                                    <span className={`font-semibold ${book.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                        {book.isAvailable ? 'Còn hàng' : 'Hết hàng'}
                                    </span>
                                    {book.stockQuantity !== undefined && (
                                        <span className="text-sm text-gray-600">
                                            ({book.stockQuantity} sản phẩm)
                                        </span>
                                    )}
                                </div>
                            </div>
                            
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
                                    <button
                                        key={author.id}
                                        onClick={() => navigate(`/books?authorId=${author.id}`)}
                                        className="flex items-center gap-2 bg-gray-100 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                                    >
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
                                        <span className="font-medium hover:text-blue-600">{author.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Categories */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Thể loại</h3>
                            <div className="flex flex-wrap gap-2">
                                {book.categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => navigate(`/books?categoryId=${category.id}`)}
                                        className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-medium transition-colors cursor-pointer"
                                    >
                                        {category.name}
                                    </button>
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

            {/* Edit Book Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Chỉnh sửa thông tin sách</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); handleSaveBook(); }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Title */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên sách *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập tên sách..."
                                    />
                                </div>

                                {/* ISBN */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ISBN *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.isbn}
                                        onChange={(e) => setEditForm({...editForm, isbn: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="10 hoặc 13 chữ số"
                                        pattern="^\d{10}$|^\d{13}$"
                                    />
                                </div>

                                {/* Publisher */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nhà xuất bản *
                                    </label>
                                    <select
                                        required
                                        value={editForm.publisherId}
                                        onChange={(e) => setEditForm({...editForm, publisherId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Chọn nhà xuất bản</option>
                                        {publishers.map((pub) => (
                                            <option key={pub.id} value={pub.id}>
                                                {pub.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Publication Year */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Năm xuất bản *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={editForm.publicationYear}
                                        onChange={(e) => setEditForm({...editForm, publicationYear: parseInt(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="1900"
                                        max={new Date().getFullYear() + 1}
                                    />
                                </div>

                                {/* Language */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ngôn ngữ *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.language}
                                        onChange={(e) => setEditForm({...editForm, language: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Page Count */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số trang *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={editForm.pageCount}
                                        onChange={(e) => setEditForm({...editForm, pageCount: parseInt(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="1"
                                    />
                                </div>

                                {/* Edition */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phiên bản
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.edition}
                                        onChange={(e) => setEditForm({...editForm, edition: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ví dụ: Tái bản lần 1"
                                    />
                                </div>

                                {/* Authors */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tác giả * (Chọn nhiều)
                                    </label>
                                    <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                                        {authors.map((author) => (
                                            <label key={author.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={editForm.authorIds.includes(author.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setEditForm({...editForm, authorIds: [...editForm.authorIds, author.id]});
                                                        } else {
                                                            setEditForm({...editForm, authorIds: editForm.authorIds.filter(id => id !== author.id)});
                                                        }
                                                    }}
                                                    className="rounded border-gray-300"
                                                />
                                                <span>{author.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Đã chọn: {editForm.authorIds.length} tác giả
                                    </p>
                                </div>

                                {/* Categories */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Thể loại * (Chọn nhiều)
                                    </label>
                                    <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                                        {categories.map((category) => (
                                            <label key={category.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={editForm.categoryIds.includes(category.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setEditForm({...editForm, categoryIds: [...editForm.categoryIds, category.id]});
                                                        } else {
                                                            setEditForm({...editForm, categoryIds: editForm.categoryIds.filter(id => id !== category.id)});
                                                        }
                                                    }}
                                                    className="rounded border-gray-300"
                                                />
                                                <span>{category.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Đã chọn: {editForm.categoryIds.length} thể loại
                                    </p>
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mô tả
                                    </label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                        rows={6}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập mô tả sách..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Price Modal */}
            {showPriceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Chỉnh sửa giá bán</h2>
                            <button
                                onClick={() => setShowPriceModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); handleSavePrice(); }}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên sách
                                </label>
                                <input
                                    type="text"
                                    value={book?.title}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Giá bán (VND) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập giá bán..."
                                    min="0"
                                    step="1000"
                                />
                                {editPrice && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {parseInt(editPrice).toLocaleString('vi-VN')}₫
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowPriceModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Lưu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookDetailPage;