using System.ComponentModel.DataAnnotations;

namespace BookStore.Application.DTOs.System.Notification
{
    public class NotificationDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public string? Type { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Link { get; set; }
    }

    public class CreateNotificationDto
    {
        [Required(ErrorMessage = "UserId is required")]
        public Guid UserId { get; set; }

        [Required(ErrorMessage = "Title is required")]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [Required(ErrorMessage = "Message is required")]
        [MaxLength(1000)]
        public string Message { get; set; } = null!;

        [MaxLength(50)]
        public string? Type { get; set; }

        [MaxLength(500)]
        public string? Link { get; set; }
    }

    public class NotificationListDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public string? Type { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Link { get; set; }
    }

    public class UnreadCountDto
    {
        public int UnreadCount { get; set; }
    }
}
