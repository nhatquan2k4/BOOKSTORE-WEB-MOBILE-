using BookStore.Application.DTOs.Catalog.Book;

namespace BookStore.Application.Interfaces.Catalog
{
    public interface IBookService
    {
        Task<(List<BookDto> Items, int TotalCount)> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            string? searchTerm = null,
            Guid? categoryId = null,
            Guid? authorId = null,
            Guid? publisherId = null,
            bool? isAvailable = null);
        Task<BookDetailDto?> GetByIdAsync(Guid id);

        Task<BookDetailDto?> GetByISBNAsync(string isbn);

        Task<bool> IsISBNExistsAsync(string isbn, Guid? excludeBookId = null);
        Task<BookDetailDto> CreateAsync(CreateBookDto dto);
        Task<BookDetailDto> UpdateAsync(UpdateBookDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> UpdateAvailabilityAsync(Guid id, bool isAvailable);
        Task<List<BookDto>> GetByCategoryAsync(Guid categoryId, int top = 10);
        Task<List<BookDto>> GetByAuthorAsync(Guid authorId, int top = 10);
        Task<List<BookDto>> GetByPublisherAsync(Guid publisherId, int top = 10);
        Task<List<BookDto>> SearchAsync(string searchTerm, int top = 20);
    }
}