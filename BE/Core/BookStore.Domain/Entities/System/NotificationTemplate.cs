namespace BookStore.Domain.Entities.System
{
    public class NotificationTemplate
    {
        public Guid Id { get; set; }

        public string Code { get; set; } = null!;

        public string Subject { get; set; } = null!;

        public string Body { get; set; } = null!;

        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public string? Placeholders { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
