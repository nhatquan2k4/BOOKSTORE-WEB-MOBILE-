using BookStore.Domain.Entities.Catalog;

namespace BookStore.Domain.Interfaces.Catalog
{
    public interface IBookRepository : IGenericRepository<Book>
    {
        Task<Book?> GetByISBNAsync(string isbn);
        Task<Book?> GetDetailByIdAsync(Guid id);
        Task<IEnumerable<Book>> SearchAsync(string searchTerm);
        Task<IEnumerable<Book>> GetByCategoryAsync(Guid categoryId);
        Task<IEnumerable<Book>> GetByAuthorAsync(Guid authorId);
        Task<IEnumerable<Book>> GetByPublisherAsync(Guid publisherId);
        Task<IEnumerable<Book>> GetLatestBooksAsync(int count);
        Task<bool> IsISBNExistsAsync(string isbn, Guid? excludeId = null);

    }
}