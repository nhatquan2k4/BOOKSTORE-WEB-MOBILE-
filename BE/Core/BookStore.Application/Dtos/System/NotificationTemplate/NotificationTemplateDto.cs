using System.ComponentModel.DataAnnotations;

namespace BookStore.Application.DTOs.System.NotificationTemplate
{
    public class CreateNotificationTemplateDto
    {
        [Required(ErrorMessage = "Code is required")]
        [MaxLength(100, ErrorMessage = "Code cannot exceed 100 characters")]
        [RegularExpression(@"^[A-Z0-9_]+$", ErrorMessage = "Code must contain only uppercase letters, numbers and underscores")]
        public string Code { get; set; } = null!;

        [Required(ErrorMessage = "Subject is required")]
        [MaxLength(200, ErrorMessage = "Subject cannot exceed 200 characters")]
        public string Subject { get; set; } = null!;

        [Required(ErrorMessage = "Body is required")]
        [MinLength(10, ErrorMessage = "Body must be at least 10 characters")]
        public string Body { get; set; } = null!;

        [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        [MaxLength(1000, ErrorMessage = "Placeholders cannot exceed 1000 characters")]
        public string? Placeholders { get; set; }
    }

    public class UpdateNotificationTemplateDto
    {
        [Required(ErrorMessage = "Subject is required")]
        [MaxLength(200, ErrorMessage = "Subject cannot exceed 200 characters")]
        public string Subject { get; set; } = null!;

        [Required(ErrorMessage = "Body is required")]
        [MinLength(10, ErrorMessage = "Body must be at least 10 characters")]
        public string Body { get; set; } = null!;

        [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }

        public bool IsActive { get; set; }

        [MaxLength(1000, ErrorMessage = "Placeholders cannot exceed 1000 characters")]
        public string? Placeholders { get; set; }
    }

    public class NotificationTemplateDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = null!;
        public string Subject { get; set; } = null!;
        public string Body { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public string? Placeholders { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class NotificationTemplateListDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = null!;
        public string Subject { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
