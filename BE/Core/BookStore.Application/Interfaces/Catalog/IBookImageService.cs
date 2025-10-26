using BookStore.Application.DTOs.Catalog.Book;

namespace BookStore.Application.Interfaces.Catalog
{
    public interface IBookImageService
    {
        // ❌ XÓA GetAllAsync() - Hình ảnh chỉ nên lấy theo BookId
        Task<BookImageDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<BookImageDto>> GetByBookIdAsync(Guid bookId);
        Task<BookImageDto> CreateAsync(BookImageDto dto);
        Task<BookImageDto> UpdateAsync(BookImageDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> DeleteByBookIdAsync(Guid bookId);
    }
}