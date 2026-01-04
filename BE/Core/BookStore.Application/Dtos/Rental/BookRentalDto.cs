namespace BookStore.Application.Dtos.Rental
{

    public class BookRentalDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserEmail { get; set; } = null!;
        
        public Guid BookId { get; set; }
        public string BookTitle { get; set; } = null!;
        public string? BookISBN { get; set; }
        public string? BookCoverImage { get; set; }
        
        public Guid RentalPlanId { get; set; }
        public string RentalPlanName { get; set; } = null!;
        public int DurationDays { get; set; }
        public decimal Price { get; set; }
        
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsReturned { get; set; }
        public bool IsRenewed { get; set; }
        public string Status { get; set; } = "Active"; // Active, Expired, Cancelled
        
        public int DaysRemaining
        {
            get
            {
                var remaining = (EndDate - DateTime.UtcNow).Days;
                return remaining > 0 ? remaining : 0;
            }
        }
        
        public bool IsExpired => DateTime.UtcNow > EndDate;
        public bool CanRead => Status == "Active" && !IsExpired && !IsReturned;
    }
}
