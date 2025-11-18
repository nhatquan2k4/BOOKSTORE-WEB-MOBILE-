import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange
}) {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return (
        <div className="pagination">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
            >
                <ChevronLeft size={18} />
            </button>

            {start > 1 && (
                <>
                    <button onClick={() => onPageChange(1)} className="pagination-btn">
                        1
                    </button>
                    {start > 2 && <span className="pagination-dots">...</span>}
                </>
            )}

            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                >
                    {page}
                </button>
            ))}

            {end < totalPages && (
                <>
                    {end < totalPages - 1 && <span className="pagination-dots">...</span>}
                    <button onClick={() => onPageChange(totalPages)} className="pagination-btn">
                        {totalPages}
                    </button>
                </>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
}
