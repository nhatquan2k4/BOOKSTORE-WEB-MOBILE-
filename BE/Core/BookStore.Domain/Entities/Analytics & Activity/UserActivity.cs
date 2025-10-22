using BookStore.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Analytics___Activity
{
    public class UserActivity
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }                        // FK: Người dùng thực hiện hành động
        public virtual User User { get; set; } = null!;

        public string Action { get; set; } = null!;             // Hành động (Login, ViewBook, AddToCart, Purchase,...)
        public string? Description { get; set; }                // Mô tả chi tiết hành động
        public string? IPAddress { get; set; }                  // Địa chỉ IP (phục vụ bảo mật & thống kê)
        public string? DeviceInfo { get; set; }                 // Thông tin thiết bị (mobile/web/desktop,...)
        public DateTime Timestamp { get; set; } = DateTime.UtcNow; // Thời điểm hành động

        // Có thể gắn với đối tượng cụ thể (Book, Order,...)
        public Guid? RelatedEntityId { get; set; }              // ID của đối tượng liên quan
        public string? RelatedEntityType { get; set; }          // Kiểu đối tượng (Book, Order, Review,...)

    }
}
#region notes
//Lưu toàn bộ hành vi của người dùng → hỗ trợ analytics, bảo mật, và phát hiện gian lận.

//Có thể dùng cho thống kê như:

//“Người dùng xem sách nào nhiều nhất?”

//“Có bao nhiêu lượt đăng nhập mỗi ngày?”
#endregion
