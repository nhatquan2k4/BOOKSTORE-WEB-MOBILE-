namespace BookStore.Application.Dtos.Rental
{

    public class BookRentalResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = null!;
        public Guid? RentalId { get; set; }
        public string? BookTitle { get; set; }
        public string? PlanName { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? DurationDays { get; set; }
        public string? Status { get; set; }
    }
}
