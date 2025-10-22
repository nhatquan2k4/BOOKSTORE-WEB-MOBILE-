using BookStore.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.System
{
    public class Notification
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }                        // FK: Người nhận thông báo
        public virtual User User { get; set; } = null!;

        public string Title { get; set; } = null!;              // Tiêu đề thông báo
        public string Message { get; set; } = null!;            // Nội dung thông báo chi tiết
        public string? Type { get; set; }                       // Loại thông báo (Order, System, Promotion,...)
        public bool IsRead { get; set; } = false;               // Đã đọc hay chưa
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? Link { get; set; }                       // Link điều hướng đến trang chi tiết (VD: /order/123)


    }
}
