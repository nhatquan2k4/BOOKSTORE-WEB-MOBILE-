using BookStore.Application.DTOs.Catalog.Book;

namespace BookStore.Application.Interfaces.Catalog
{
    public interface IBookFileService
    {
        Task<IEnumerable<BookFileDto>> GetAllAsync();
        Task<BookFileDto?> GetByIdAsync(Guid id);
        Task<BookFileDto> CreateAsync(BookFileDto dto);
        Task<BookFileDto> UpdateAsync(BookFileDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}