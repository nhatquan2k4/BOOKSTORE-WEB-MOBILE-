using BookStore.Domain.Entities.Catalog;

namespace BookStore.Domain.IRepository.Catalog
{
    public interface IBookRepository : IGenericRepository<Book>
    {
        Task<Book?> GetByISBNAsync(string isbn);
        Task<Book?> GetDetailByIdAsync(Guid id);
        Task<(IEnumerable<Book> Items, int TotalCount)> GetPagedAsync(
            int pageNumber,
            int pageSize,
            string? searchTerm = null,
            Guid? categoryId = null,
            Guid? authorId = null,
            Guid? publisherId = null,
            bool? isAvailable = null);
        Task<IEnumerable<Book>> SearchAsync(string searchTerm, int? take = null);
        Task<IEnumerable<Book>> GetByCategoryAsync(Guid categoryId, int? take = null);
        Task<IEnumerable<Book>> GetByAuthorAsync(Guid authorId, int? take = null);
        Task<IEnumerable<Book>> GetByPublisherAsync(Guid publisherId, int? take = null);
        Task<IEnumerable<Book>> GetLatestBooksAsync(int count);
        Task<IEnumerable<Book>> GetRecommendationsAsync(
            IReadOnlyCollection<Guid> excludeBookIds,
            IReadOnlyCollection<Guid> categoryIds,
            int limit);
        Task<IEnumerable<Book>> GetBestSellingBooksAsync(int count);
        Task<IEnumerable<Book>> GetNewestBooksAsync(int count);
        Task<IEnumerable<Book>> GetMostViewedBooksAsync(int count);
        Task<bool> IsISBNExistsAsync(string isbn, Guid? excludeId = null);

    }
}
