namespace BookStore.Application.Dtos.Rental
{

    public class RentalPlanDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int DurationDays { get; set; }
        public string PlanType { get; set; } = "SingleBook"; // "Subscription" | "SingleBook"
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateRentalPlanDto
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int DurationDays { get; set; }
        public string PlanType { get; set; } = "SingleBook"; // "Subscription" | "SingleBook"
    }
    public class UpdateRentalPlanDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int DurationDays { get; set; }
        public string PlanType { get; set; } = "SingleBook"; // "Subscription" | "SingleBook"
        public bool IsActive { get; set; }
    }
}
