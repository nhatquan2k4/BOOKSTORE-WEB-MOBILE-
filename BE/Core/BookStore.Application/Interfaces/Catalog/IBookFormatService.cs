using BookStore.Application.DTOs.Catalog.Book;

namespace BookStore.Application.Interfaces.Catalog
{
    public interface IBookFormatService
    {
        Task<IEnumerable<BookFormatDto>> GetAllAsync();
        Task<BookFormatDto?> GetByIdAsync(Guid id);
        Task<BookFormatDto?> GetByFormatTypeAsync(string formatType);
        Task<BookFormatDto> CreateAsync(BookFormatDto dto);
        Task<BookFormatDto> UpdateAsync(BookFormatDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> IsFormatTypeExistsAsync(string formatType, Guid? excludeId = null);
    }
}