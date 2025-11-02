using BookStore.Application.Dtos.Catalog.Book;

namespace BookStore.Application.IService.Catalog
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