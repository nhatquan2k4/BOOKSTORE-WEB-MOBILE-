using BookStore.Application.DTO.Analytics;
using BookStore.Application.IService.Analytics;
using BookStore.Application.Mappers.Analytics;
using BookStore.Domain.IRepository.Analytics;
using BookStore.Domain.IRepository.Ordering;

namespace BookStore.Application.Service.Analytics
{
    public class DashboardService : IDashboardService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IBookViewRepository _bookViewRepository;

        public DashboardService(
            IOrderRepository orderRepository,
            IBookViewRepository bookViewRepository)
        {
            _orderRepository = orderRepository;
            _bookViewRepository = bookViewRepository;
        }

        public async Task<RevenueDto> GetRevenueAsync(DateTime from, DateTime to)
        {
            var summary = await _orderRepository.GetRevenueSummaryAsync(from, to);
            return summary.ToRevenueDto();
        }

        public async Task<List<TopSellingBookDto>> GetTopSellingBooksAsync(DateTime from, DateTime to, int top = 10)
        {
            var stats = await _orderRepository.GetTopSellingBookStatsAsync(from, to, top);
            return stats.ToTopSellingBookDtos();
        }

        public async Task<List<TopViewedBookDto>> GetTopViewedBooksAsync(DateTime from, DateTime to, int top = 10)
        {
            var stats = await _bookViewRepository.GetTopViewedBookStatsAsync(from, to, top);
            return stats.ToTopViewedBookDtos();
        }

        public async Task<OrderStatsDto> GetOrderStatsAsync(DateTime from, DateTime to)
        {
            var statusCounts = await _orderRepository.GetOrderCountsByStatusAsync(from, to);
            return statusCounts.ToOrderStatsDto();
        }
    }
}
