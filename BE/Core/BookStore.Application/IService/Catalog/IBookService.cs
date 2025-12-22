using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Application.IService;
using BookStore.Shared.Utilities;

namespace BookStore.Application.IService.Catalog
{
    public interface IBookService : IGenericService<BookDto, CreateBookDto, UpdateBookDto>
    {
        // Override methods to return BookDetailDto
        new Task<BookDetailDto?> GetByIdAsync(Guid id);
        new Task<BookDetailDto> AddAsync(CreateBookDto dto);
        new Task<BookDetailDto> UpdateAsync(UpdateBookDto dto);

        // Custom GetAllAsync with pagination and filters
        Task<PagedResult<BookDto>> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            string? searchTerm = null,
            Guid? categoryId = null,
            Guid? authorId = null,
            Guid? publisherId = null,
            bool? isAvailable = null);

        // Specific queries
        Task<BookDetailDto?> GetByISBNAsync(string isbn);
        Task<bool> IsISBNExistsAsync(string isbn, Guid? excludeBookId = null);
        Task<bool> UpdateAvailabilityAsync(Guid id, bool isAvailable);
        Task<List<BookDto>> GetByCategoryAsync(Guid categoryId, int top = 10);
        Task<List<BookDto>> GetByAuthorAsync(Guid authorId, int top = 10);
        Task<List<BookDto>> GetByPublisherAsync(Guid publisherId, int top = 10);
        Task<List<BookDto>> SearchAsync(string searchTerm, int top = 20);

        // Smart recommendations
        Task<List<BookDto>> GetRecommendationsAsync(List<Guid> excludeBookIds, List<Guid> categoryIds, int limit = 8);
        
        // Popular books
        Task<List<BookDto>> GetBestSellingBooksAsync(int top = 10);
        Task<List<BookDto>> GetNewestBooksAsync(int top = 10);
        Task<List<BookDto>> GetMostViewedBooksAsync(int top = 10);
    }
}