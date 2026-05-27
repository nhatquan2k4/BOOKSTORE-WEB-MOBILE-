using BookStore.Application.DTO.Analytics;

namespace BookStore.Application.Mappers.Analytics
{
    public static class DashboardMapper
    {
        public static RevenueDto ToRevenueDto(
            this (decimal TotalRevenue, int TotalOrders, IReadOnlyList<(DateTime Date, decimal Revenue, int OrderCount)> DailyRevenues) summary)
        {
            return new RevenueDto
            {
                TotalRevenue = summary.TotalRevenue,
                TotalOrders = summary.TotalOrders,
                AverageOrderValue = summary.TotalOrders > 0
                    ? summary.TotalRevenue / summary.TotalOrders
                    : 0,
                DailyRevenues = summary.DailyRevenues
                    .Select(dailyRevenue => new DailyRevenueDto
                    {
                        Date = dailyRevenue.Date,
                        Revenue = dailyRevenue.Revenue,
                        OrderCount = dailyRevenue.OrderCount
                    })
                    .ToList()
            };
        }

        public static List<TopSellingBookDto> ToTopSellingBookDtos(
            this IEnumerable<(Guid BookId, string BookTitle, string? BookCoverUrl, int QuantitySold, decimal TotalRevenue, decimal AveragePrice)> stats)
        {
            return stats
                .Select(stat => new TopSellingBookDto
                {
                    BookId = stat.BookId,
                    BookTitle = stat.BookTitle,
                    BookCoverUrl = stat.BookCoverUrl,
                    QuantitySold = stat.QuantitySold,
                    TotalRevenue = stat.TotalRevenue,
                    AveragePrice = stat.AveragePrice
                })
                .ToList();
        }

        public static List<TopViewedBookDto> ToTopViewedBookDtos(
            this IEnumerable<(Guid BookId, string BookTitle, string? BookCoverUrl, int ViewCount, int UniqueViewers)> stats)
        {
            return stats
                .Select(stat => new TopViewedBookDto
                {
                    BookId = stat.BookId,
                    BookTitle = stat.BookTitle,
                    BookCoverUrl = stat.BookCoverUrl,
                    ViewCount = stat.ViewCount,
                    UniqueViewers = stat.UniqueViewers
                })
                .ToList();
        }

        public static OrderStatsDto ToOrderStatsDto(this IReadOnlyDictionary<string, int> statusCounts)
        {
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
