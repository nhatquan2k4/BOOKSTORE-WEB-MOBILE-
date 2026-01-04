using BookStore.Application.DTO.Analytics;

namespace BookStore.Application.IService.Analytics
{
    public interface IDashboardService
    {
        Task<RevenueDto> GetRevenueAsync(DateTime from, DateTime to);
        Task<List<TopSellingBookDto>> GetTopSellingBooksAsync(DateTime from, DateTime to, int top = 10);
        Task<List<TopViewedBookDto>> GetTopViewedBooksAsync(DateTime from, DateTime to, int top = 10);
        Task<OrderStatsDto> GetOrderStatsAsync(DateTime from, DateTime to);
    }
}
