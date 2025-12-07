using BookStore.Domain.Entities.Analytics___Activity;

namespace BookStore.Domain.IRepository.Analytics
{
    public interface IBookViewRepository : IGenericRepository<BookView>
    {
        Task<IEnumerable<BookView>> GetByBookIdAsync(Guid bookId, int pageNumber = 1, int pageSize = 20);
        Task<IEnumerable<BookView>> GetByUserIdAsync(Guid userId, int pageNumber = 1, int pageSize = 20);
        Task<int> GetViewCountByBookIdAsync(Guid bookId, DateTime? from = null, DateTime? to = null);
        Task<Dictionary<Guid, int>> GetTopViewedBooksAsync(DateTime from, DateTime to, int top = 10);
        Task<IEnumerable<BookView>> GetByDateRangeAsync(DateTime from, DateTime to);
    }
}
