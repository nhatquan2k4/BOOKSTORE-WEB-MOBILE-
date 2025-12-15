using BookStore.Application.DTO.Analytics;

namespace BookStore.Application.IService.Analytics
{
    /// <summary>
    /// Service for admin dashboard analytics
    /// </summary>
    public interface IDashboardService
    {
        /// <summary>
        /// Get revenue data for a date range
        /// </summary>
        Task<RevenueDto> GetRevenueAsync(DateTime from, DateTime to);

        /// <summary>
        /// Get top selling books for a date range
        /// </summary>
        Task<List<TopSellingBookDto>> GetTopSellingBooksAsync(DateTime from, DateTime to, int top = 10);

        /// <summary>
        /// Get top viewed books for a date range
        /// </summary>
        Task<List<TopViewedBookDto>> GetTopViewedBooksAsync(DateTime from, DateTime to, int top = 10);

        /// <summary>
        /// Get order statistics for a date range
        /// </summary>
        Task<OrderStatsDto> GetOrderStatsAsync(DateTime from, DateTime to);
    }
}
