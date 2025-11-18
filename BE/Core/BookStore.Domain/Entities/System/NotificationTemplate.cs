namespace BookStore.Domain.Entities.System
{
    /// <summary>
    /// Email/Notification template for various system events
    /// </summary>
    public class NotificationTemplate
    {
        public Guid Id { get; set; }

        /// <summary>
        /// Unique code identifying the template (e.g., ORDER_CONFIRMED, PASSWORD_RESET)
        /// </summary>
        public string Code { get; set; } = null!;

        /// <summary>
        /// Email subject template (can contain placeholders like {UserName}, {OrderId})
        /// </summary>
        public string Subject { get; set; } = null!;

        /// <summary>
        /// Email body template (HTML format, can contain placeholders)
        /// </summary>
        public string Body { get; set; } = null!;

        /// <summary>
        /// Template description for admin reference
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Whether this template is active and should be used
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Available placeholders for this template (JSON format)
        /// Example: ["UserName", "OrderId", "BookTitle"]
        /// </summary>
        public string? Placeholders { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
