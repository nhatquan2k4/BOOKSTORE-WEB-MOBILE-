import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { bookService, authorService, publisherService, categoryService, bookImageService } from '../services';
import type { Author, Publisher, Category, CreateBookDto } from '../types';
import { useAuth } from '../context/AuthContext';

const CreateBookPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        isbn: '',
        description: '',
        publicationYear: new Date().getFullYear(),
        language: 'vi',
        edition: '',
        pageCount: 0,
        isAvailable: true,
        publisherId: '',
        bookFormatId: '',
        authorIds: [] as string[],
        categoryIds: [] as string[],
    });

    // Load danh sách authors, publishers, categories
    useEffect(() => {
        // Kiểm tra role Admin (no debug logs)
        
        const loadData = async () => {
            try {
                const [authorsRes, publishersRes, categoriesRes] = await Promise.all([
                    authorService.getAll({ pageSize: 1000 }),
                    publisherService.getAll({ pageSize: 1000 }),
                    categoryService.getAll({ pageSize: 1000 }),
                ]);
                setAuthors(authorsRes.items);
                setPublishers(publishersRes.items);
                setCategories(categoriesRes.items);
            } catch (error) {
                console.error('Error loading data:', error);
                alert('Không thể tải dữ liệu. Vui lòng thử lại.');
            }
        };
        loadData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            isAvailable: e.target.checked
        }));
    };

    const handleMultiSelect = (field: 'authorIds' | 'categoryIds', value: string) => {
        setFormData(prev => {
            const currentValues = prev[field];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(id => id !== value)
                : [...currentValues, value];
            return { ...prev, [field]: newValues };
        });
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setImageFiles(prev => [...prev, ...files]);

        // Tạo preview cho ảnh
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!formData.title.trim()) {
            alert('Vui lòng nhập tên sách');
            return;
        }
        if (!formData.isbn.trim()) {
            alert('Vui lòng nhập ISBN');
            return;
        }
        
        // Validate ISBN format (10 hoặc 13 chữ số, có thể có dấu gạch ngang)
        const isbnDigits = formData.isbn.replace(/[-\s]/g, '');
        if (!/^\d{10}$|^\d{13}$/.test(isbnDigits)) {
            alert('ISBN không hợp lệ. Vui lòng nhập ISBN-10 (10 số) hoặc ISBN-13 (13 số).\nVí dụ: 9786043331806 hoặc 978-604-333-180-6');
            return;
        }
        
        if (!formData.publisherId) {
            alert('Vui lòng chọn nhà xuất bản');
            return;
        }
        if (formData.authorIds.length === 0) {
            alert('Vui lòng chọn ít nhất một tác giả');
            return;
        }
        if (formData.categoryIds.length === 0) {
            alert('Vui lòng chọn ít nhất một thể loại');
            return;
        }

        setLoading(true);
        try {
            // Tạo sách
            const bookData: CreateBookDto = {
                title: formData.title,
                isbn: formData.isbn,
                description: formData.description || undefined,
                publicationYear: formData.publicationYear,
                language: formData.language,
                edition: formData.edition || undefined,
                pageCount: formData.pageCount,
                isAvailable: formData.isAvailable,
                publisherId: formData.publisherId,
                bookFormatId: formData.bookFormatId ? formData.bookFormatId : undefined,
                authorIds: formData.authorIds,
                categoryIds: formData.categoryIds,
            };

            const createdBook = await bookService.create(bookData);
            console.log('Book created successfully:', createdBook);
            
            // Upload ảnh nếu có
            if (imageFiles.length > 0 && createdBook.id) {
                try {
                    await uploadImages(createdBook.id);
                    alert('Thêm sách và ảnh thành công!');
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                    alert('Sách đã được tạo nhưng có lỗi khi upload ảnh. Bạn có thể thêm ảnh sau.');
                }
            } else {
                alert('Thêm sách thành công!');
            }

            navigate('/books');
        } catch (error: any) {
            console.error('Error creating book:', error);
            console.error('Error response:', error.response);
            const errorMessage = error.response?.data?.message || error.response?.data?.details || error.message || 'Không thể tạo sách';
            const errorDetails = error.response?.data?.errors ? '\n' + JSON.stringify(error.response.data.errors, null, 2) : '';
            alert(`Lỗi: ${errorMessage}${errorDetails}`);
        } finally {
            setLoading(false);
        }
    };

    const uploadImages = async (bookId: string) => {
        try {
            for (let i = 0; i < imageFiles.length; i++) {
                const formData = new FormData();
                formData.append('file', imageFiles[i]);
                formData.append('isCover', i === 0 ? 'true' : 'false');
                formData.append('displayOrder', i.toString());

                // Upload ảnh lên server
                await bookImageService.upload(bookId, formData);
                console.log(`Uploaded image ${i + 1}/${imageFiles.length} for book:`, bookId);
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            // Không throw error vì sách đã tạo thành công
            throw error; // Throw để thông báo cho user
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/books')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">Thêm sách mới</h1>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Image Upload */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                            <h2 className="text-xl font-semibold mb-4">Ảnh sách</h2>
                            
                            {/* Upload Button */}
                            <div className="mb-4">
                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-10 h-10 text-gray-400 mb-3" />
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Nhấn để tải ảnh</span>
                                        </p>
                                        <p className="text-xs text-gray-400">PNG, JPG (MAX. 5MB)</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageSelect}
                                    />
                                </label>
                            </div>

                            {/* Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-gray-700">
                                        Ảnh đã chọn ({imagePreviews.length})
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                                {index === 0 && (
                                                    <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                                        Bìa
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        * Ảnh đầu tiên sẽ là ảnh bìa
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Form Fields */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-6">Thông tin sách</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Title */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên sách <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập tên sách"
                                        required
                                    />
                                </div>

                                {/* ISBN */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ISBN <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="isbn"
                                        value={formData.isbn}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="978-604-xxx-xxx-x hoặc 10 chữ số"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        ISBN-13 (13 số) hoặc ISBN-10 (10 số)
                                    </p>
                                </div>

                                {/* Publication Year */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Năm xuất bản
                                    </label>
                                    <input
                                        type="number"
                                        name="publicationYear"
                                        value={formData.publicationYear}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="1900"
                                        max="2100"
                                    />
                                </div>

                                {/* Language */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ngôn ngữ
                                    </label>
                                    <select
                                        name="language"
                                        value={formData.language}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="vi">Tiếng Việt</option>
                                        <option value="en">English</option>
                                        <option value="fr">Français</option>
                                        <option value="de">Deutsch</option>
                                        <option value="ja">日本語</option>
                                        <option value="ko">한국어</option>
                                        <option value="zh">中文</option>
                                    </select>
                                </div>

                                {/* Page Count */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số trang
                                    </label>
                                    <input
                                        type="number"
                                        name="pageCount"
                                        value={formData.pageCount}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                    />
                                </div>

                                {/* Edition */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phiên bản
                                    </label>
                                    <input
                                        type="text"
                                        name="edition"
                                        value={formData.edition}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ví dụ: Tái bản lần 1"
                                    />
                                </div>

                                {/* Publisher */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nhà xuất bản <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="publisherId"
                                        value={formData.publisherId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">-- Chọn nhà xuất bản --</option>
                                        {publishers.map(publisher => (
                                            <option key={publisher.id} value={publisher.id}>
                                                {publisher.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mô tả
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập mô tả chi tiết về sách..."
                                    />
                                </div>

                                {/* Authors (Multi-select) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tác giả <span className="text-red-500">*</span>
                                    </label>
                                    <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                                        {authors.length === 0 ? (
                                            <p className="text-gray-400">Đang tải...</p>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2">
                                                {authors.map(author => (
                                                    <label key={author.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.authorIds.includes(author.id)}
                                                            onChange={() => handleMultiSelect('authorIds', author.id)}
                                                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm">{author.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Đã chọn: {formData.authorIds.length} tác giả
                                    </p>
                                </div>

                                {/* Categories (Multi-select) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Thể loại <span className="text-red-500">*</span>
                                    </label>
                                    <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                                        {categories.length === 0 ? (
                                            <p className="text-gray-400">Đang tải...</p>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2">
                                                {categories.map(category => (
                                                    <label key={category.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.categoryIds.includes(category.id)}
                                                            onChange={() => handleMultiSelect('categoryIds', category.id)}
                                                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm">{category.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Đã chọn: {formData.categoryIds.length} thể loại
                                    </p>
                                </div>

                                {/* Is Available */}
                                <div className="md:col-span-2">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isAvailable}
                                            onChange={handleCheckboxChange}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Sách có sẵn để bán
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="mt-8 flex gap-4 justify-end">
                                <button
                                    type="button"
                                    onClick={() => navigate('/books')}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={loading}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang xử lý...' : 'Tạo sách'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBookPage;
