export interface Book {
    id: string;
    title: string;
    isbn: string;
    publicationYear: number;
    language: string;
    pageCount: number;
    isAvailable: boolean;
    publisherId: string;
    publisherName: string;
    bookFormatId?: string;
    bookFormatName?: string;
    authorNames: string[];
    categoryNames: string[];
    currentPrice?: number;
    discountPrice?: number;
    stockQuantity?: number;
    averageRating?: number;
    totalReviews: number;
}

export interface BookImage {
    id: string;
    imageUrl: string;
    isCover: boolean;
    displayOrder: number;
    bookId: string;
}

export interface Author {
    id: string;
    name: string;
    avartarUrl?: string;
    bookCount: number;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    parentId?: string;
    parentName?: string;
    bookCount: number;
    subCategoriesCount: number;
}

export interface Publisher {
    id: string;
    name: string;
    address?: string;
    email?: string;
    phoneNumber?: string;
    website?: string;
    bookCount: number;
}

export interface BookFormat {
    id: string;
    name: string;
}

export interface BookFile {
    id: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
}

export interface BookMetadata {
    id: string;
    key: string;
    value: string;
}

export interface BookDetail {
    id: string;
    title: string;
    isbn: string;
    description?: string;
    publicationYear: number;
    language: string;
    edition?: string;
    pageCount: number;
    isAvailable: boolean;
    currentPrice?: number;
    stockQuantity?: number;
    publisher: Publisher;
    bookFormat?: BookFormat;
    authors: Author[];
    categories: Category[];
    images: BookImage[];
    files: BookFile[];
    metadata: BookMetadata[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'admin' | 'customer';
    createdAt: string;
    status: 'active' | 'inactive';
}

export interface Order {
    id: string;
    userId: string;
    customerName: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
    orderDate: string;
    deliveryAddress: string;
    orderNumber?: string;
    createdAt?: string;
    phoneNumber?: string;
    email?: string;
    shippingAddress?: string;
    subtotal?: number;
    shippingFee?: number;
    discount?: number;
    paymentMethod?: string;
    notes?: string;
}

export interface OrderItem {
    bookId: string;
    bookTitle: string;
    quantity: number;
    price: number;
    isbn?: string;
}

export interface CreateBookDto {
    title: string;
    isbn: string;
    description?: string;
    publicationYear: number;
    language: string;
    edition?: string;
    pageCount: number;
    isAvailable: boolean;
    publisherId: string;
    bookFormatId?: string;
    authorIds: string[];
    categoryIds: string[];
}
