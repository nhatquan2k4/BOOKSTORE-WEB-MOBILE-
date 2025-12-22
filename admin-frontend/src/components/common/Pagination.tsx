import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    itemsCount: number;
    onPageChange: (page: number) => void;
    entityName: string; // e.g., "tác giả", "nhà xuất bản", "sách"
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    itemsCount,
    onPageChange,
    entityName
}) => {
    const startIndex = itemsCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    const endIndex = Math.min(currentPage * pageSize, totalCount);

    return (
        <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600">
                Hiển thị {startIndex} - {endIndex} trong tổng số {totalCount} {entityName}
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    Trước
                </button>
                <span className="px-4 py-2">
                    Trang {currentPage} / {totalPages || 1}
                </span>
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    Sau
                </button>
            </div>
        </div>
    );
};

export default Pagination;
