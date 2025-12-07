namespace BookStore.Application.DTO.Analytics
{
    /// <summary>
    /// Top selling book information for dashboard
    /// </summary>
    public class TopSellingBookDto
    {
        public Guid BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string? BookCoverUrl { get; set; }
        public int QuantitySold { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AveragePrice { get; set; }
    }
}
