using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Analytics___Activity
{
    /// <summary>
    /// BookView entity for tracking book detail page views
    /// Used for analytics: most viewed books, user behavior tracking
    /// </summary>
    public class BookView
    {
        public Guid Id { get; set; }

        // FK: Book being viewed
        public Guid BookId { get; set; }
        public virtual Book Book { get; set; } = null!;

        // FK: User who viewed (nullable for guest users)
        public Guid? UserId { get; set; }
        public virtual User? User { get; set; }

        // Timestamp of the view
        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;

        // IP Address (for guest tracking and security)
        public string? IpAddress { get; set; }

        // User Agent (browser/device info)
        public string? UserAgent { get; set; }

        // Session ID (for tracking user journey)
        public string? SessionId { get; set; }
    }
}
//Giải thích:
//Dùng để đếm lượt xem sách, xác định sách hot hoặc được quan tâm nhiều nhất.
//Cũng có thể dùng để gợi ý đề xuất (“người xem sách này cũng xem…”).