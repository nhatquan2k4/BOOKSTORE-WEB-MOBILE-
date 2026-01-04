namespace BookStore.Application.DTO.Analytics
{

    public class DailyRevenueDto
    {
        public DateTime Date { get; set; }
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
    }


    public class RevenueDto
    {
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
        public List<DailyRevenueDto> DailyRevenues { get; set; } = new();
    }
}
