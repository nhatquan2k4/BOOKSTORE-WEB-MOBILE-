using BookStore.Application.Dtos.Catalog.Book;

namespace BookStore.Application.IService.Catalog
{
    public interface IBookImageService
    {
        Task<IEnumerable<BookImageDto>> GetAllAsync();
        Task<BookImageDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<BookImageDto>> GetByBookIdAsync(Guid bookId);
        Task<BookImageDto> CreateAsync(BookImageDto dto);
        Task<BookImageDto> UpdateAsync(BookImageDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> DeleteByBookIdAsync(Guid bookId);
    }
}