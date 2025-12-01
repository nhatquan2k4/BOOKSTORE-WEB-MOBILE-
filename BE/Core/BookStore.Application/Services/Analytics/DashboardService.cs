using BookStore.Application.DTO.Analytics;
using BookStore.Application.IService.Analytics;
using BookStore.Domain.IRepository.Analytics;
using BookStore.Domain.IRepository.Ordering;
using BookStore.Domain.IRepository.Catalog;

namespace BookStore.Application.Service.Analytics
{
    public class DashboardService : IDashboardService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IBookViewRepository _bookViewRepository;
        private readonly IBookRepository _bookRepository;

        public DashboardService(
            IOrderRepository orderRepository,
            IBookViewRepository bookViewRepository,
            IBookRepository bookRepository)
        {
            _orderRepository = orderRepository;
            _bookViewRepository = bookViewRepository;
            _bookRepository = bookRepository;
        }

        public async Task<RevenueDto> GetRevenueAsync(DateTime from, DateTime to)
        {
            // Query completed orders in date range
            var orders = await _orderRepository.GetCompletedOrdersByDateRangeAsync(from, to);
            var orderList = orders.ToList();

            var totalRevenue = orderList.Sum(o => o.FinalAmount);
            var totalOrders = orderList.Count;

            // Group by date for daily revenue
            var dailyRevenues = orderList
                .GroupBy(o => o.CompletedAt!.Value.Date)
                .Select(g => new DailyRevenueDto
                {
                    Date = g.Key,
                    Revenue = g.Sum(o => o.FinalAmount),
                    OrderCount = g.Count()
                })
                .OrderBy(d => d.Date)
                .ToList();

            return new RevenueDto
            {
                TotalRevenue = totalRevenue,
                TotalOrders = totalOrders,
                AverageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0,
                DailyRevenues = dailyRevenues
            };
        }

        public async Task<List<TopSellingBookDto>> GetTopSellingBooksAsync(DateTime from, DateTime to, int top = 10)
        {
            // Get top selling book IDs with quantities from order repository
            var topBooks = await _orderRepository.GetTopSellingBooksAsync(from, to, top);

            // Get book details from completed orders
            var orders = await _orderRepository.GetCompletedOrdersByDateRangeAsync(from, to);
            var bookStats = orders
                .SelectMany(o => o.Items)
                .Where(oi => topBooks.ContainsKey(oi.BookId))
                .GroupBy(oi => oi.BookId)
                .Select(g => new
                {
                    BookId = g.Key,
                    TotalRevenue = g.Sum(oi => oi.UnitPrice * oi.Quantity),
                    AveragePrice = g.Average(oi => oi.UnitPrice)
                })
                .ToDictionary(x => x.BookId);

            // Get book details
            var result = new List<TopSellingBookDto>();
            foreach (var bookId in topBooks.Keys)
            {
                var book = await _bookRepository.GetByIdAsync(bookId);
                if (book != null)
                {
                    result.Add(new TopSellingBookDto
                    {
                        BookId = bookId,
                        BookTitle = book.Title,
                        BookCoverUrl = null, // Book entity doesn't have CoverImageUrl, set to null
                        QuantitySold = topBooks[bookId],
                        TotalRevenue = bookStats.ContainsKey(bookId) ? bookStats[bookId].TotalRevenue : 0,
                        AveragePrice = bookStats.ContainsKey(bookId) ? bookStats[bookId].AveragePrice : 0
                    });
                }
            }

            return result.OrderByDescending(b => b.QuantitySold).ToList();
        }

        public async Task<List<TopViewedBookDto>> GetTopViewedBooksAsync(DateTime from, DateTime to, int top = 10)
        {
            // Get top viewed books from BookViewRepository
            var topViews = await _bookViewRepository.GetTopViewedBooksAsync(from, to, top);

            // Get book details and calculate unique viewers
            var result = new List<TopViewedBookDto>();
            foreach (var bookView in topViews)
            {
                var book = await _bookRepository.GetByIdAsync(bookView.Key);
                if (book != null)
                {
                    // Get views for this book to count unique viewers
                    var views = await _bookViewRepository.GetByDateRangeAsync(from, to);
                    var uniqueViewers = views
                        .Where(v => v.BookId == bookView.Key && v.UserId.HasValue)
                        .Select(v => v.UserId)
                        .Distinct()
                        .Count();

                    result.Add(new TopViewedBookDto
                    {
                        BookId = bookView.Key,
                        BookTitle = book.Title,
                        BookCoverUrl = null, // Book entity doesn't have CoverImageUrl
                        ViewCount = bookView.Value,
                        UniqueViewers = uniqueViewers
                    });
                }
            }

            return result;
        }

        public async Task<OrderStatsDto> GetOrderStatsAsync(DateTime from, DateTime to)
        {
            // Get order counts by status from repository
            var statusCounts = await _orderRepository.GetOrderCountsByStatusAsync(from, to);

            var totalOrders = statusCounts.Values.Sum();
            var pendingOrders = statusCounts.GetValueOrDefault("Pending", 0);
            var confirmedOrders = statusCounts.GetValueOrDefault("Confirmed", 0) + statusCounts.GetValueOrDefault("Paid", 0);
            var shippingOrders = statusCounts.GetValueOrDefault("Shipping", 0) + statusCounts.GetValueOrDefault("Shipped", 0);
            var deliveredOrders = statusCounts.GetValueOrDefault("Delivered", 0) + statusCounts.GetValueOrDefault("Completed", 0);
            var cancelledOrders = statusCounts.GetValueOrDefault("Cancelled", 0);

            return new OrderStatsDto
            {
                TotalOrders = totalOrders,
                PendingOrders = pendingOrders,
                ConfirmedOrders = confirmedOrders,
                ShippingOrders = shippingOrders,
                DeliveredOrders = deliveredOrders,
                CancelledOrders = cancelledOrders,
                CompletionRate = totalOrders > 0 ? (decimal)deliveredOrders / totalOrders * 100 : 0,
                CancellationRate = totalOrders > 0 ? (decimal)cancelledOrders / totalOrders * 100 : 0
            };
        }
    }
}
