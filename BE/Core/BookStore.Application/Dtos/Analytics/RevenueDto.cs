namespace BookStore.Application.DTO.Analytics
{
    /// <summary>
    /// Revenue data for a single day
    /// </summary>
    public class DailyRevenueDto
    {
        public DateTime Date { get; set; }
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
    }

    /// <summary>
    /// Aggregated revenue data for dashboard
    /// </summary>
    public class RevenueDto
    {
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
        public List<DailyRevenueDto> DailyRevenues { get; set; } = new();
    }
}
