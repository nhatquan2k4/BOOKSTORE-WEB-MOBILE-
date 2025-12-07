namespace BookStore.Application.IService.Analytics
{
    /// <summary>
    /// Service for tracking and analyzing book page views
    /// </summary>
    public interface IBookViewService
    {
        /// <summary>
        /// Record a book page view
        /// </summary>
        /// <param name="bookId">ID of the book being viewed</param>
        /// <param name="userId">ID of the user viewing (null for anonymous)</param>
        /// <param name="ipAddress">IP address of the viewer</param>
        /// <param name="userAgent">Browser/client user agent</param>
        /// <param name="sessionId">Session ID for tracking unique sessions</param>
        Task RecordViewAsync(Guid bookId, Guid? userId, string? ipAddress, string? userAgent, string? sessionId);

        /// <summary>
        /// Get view count for a specific book
        /// </summary>
        Task<int> GetViewCountAsync(Guid bookId, DateTime? from = null, DateTime? to = null);

        /// <summary>
        /// Get top viewed books within a date range
        /// </summary>
        /// <returns>Dictionary with BookId as key and view count as value</returns>
        Task<Dictionary<Guid, int>> GetTopViewedBooksAsync(DateTime from, DateTime to, int top = 10);

        /// <summary>
        /// Get all views for a specific book
        /// </summary>
        Task<IEnumerable<object>> GetBookViewsAsync(Guid bookId, int pageNumber = 1, int pageSize = 20);
    }
}
