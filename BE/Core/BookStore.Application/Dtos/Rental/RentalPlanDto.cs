namespace BookStore.Application.Dtos.Rental
{
    /// <summary>
    /// DTO cho gói thuê sách
    /// </summary>
    public class RentalPlanDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int DurationDays { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// DTO để tạo gói thuê mới (Admin)
    /// </summary>
    public class CreateRentalPlanDto
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int DurationDays { get; set; }
    }

    /// <summary>
    /// DTO để cập nhật gói thuê (Admin)
    /// </summary>
    public class UpdateRentalPlanDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int DurationDays { get; set; }
        public bool IsActive { get; set; }
    }
}
