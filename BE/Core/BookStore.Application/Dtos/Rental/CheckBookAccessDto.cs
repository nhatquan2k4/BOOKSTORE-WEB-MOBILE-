namespace BookStore.Application.Dtos.Rental
{
    /// <summary>
    /// DTO kiểm tra quyền đọc sách
    /// </summary>
    public class CheckBookAccessDto
    {
        public bool CanAccess { get; set; }
        public string Reason { get; set; } = null!;
        public Guid? RentalId { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public int? DaysRemaining { get; set; }
        public string? AccessType { get; set; } // "Rental" hoặc "Subscription"
    }
}
