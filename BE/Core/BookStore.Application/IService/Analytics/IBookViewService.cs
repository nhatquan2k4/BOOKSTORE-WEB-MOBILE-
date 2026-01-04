namespace BookStore.Application.IService.Analytics
{

    public interface IBookViewService
    {

        Task RecordViewAsync(Guid bookId, Guid? userId, string? ipAddress, string? userAgent, string? sessionId);

        Task<int> GetViewCountAsync(Guid bookId, DateTime? from = null, DateTime? to = null);

        Task<Dictionary<Guid, int>> GetTopViewedBooksAsync(DateTime from, DateTime to, int top = 10);

        Task<IEnumerable<object>> GetBookViewsAsync(Guid bookId, int pageNumber = 1, int pageSize = 20);
    }
}
