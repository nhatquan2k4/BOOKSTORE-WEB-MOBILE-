using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Common
{
    public class Review
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }                        // FK: Người viết đánh giá
        public virtual User User { get; set; } = null!;

        public Guid BookId { get; set; }                        // FK: Sách được đánh giá
        public virtual Book Book { get; set; } = null!;

        public Guid? OrderId { get; set; }                      // FK: Đơn hàng đã mua sách này (để verify purchase)
        public virtual Ordering.Order? Order { get; set; }

        public int Rating { get; set; }                         // Điểm đánh giá (1–5 sao)
        public string? Title { get; set; }                      // Tiêu đề đánh giá (optional)
        public string Content { get; set; } = null!;            // Nội dung đánh giá
        
        public string Status { get; set; } = "Pending";         // Pending, Approved, Rejected
        public bool IsVerifiedPurchase { get; set; } = false;   // Đã mua hàng thật
        public bool IsEdited { get; set; } = false;             // Đã chỉnh sửa hay chưa
        public bool IsDeleted { get; set; } = false;            // Đánh dấu xóa mềm (soft delete)
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Thời điểm viết đánh giá
        public DateTime? UpdatedAt { get; set; }                // Khi chỉnh sửa đánh giá
        public DateTime? ApprovedAt { get; set; }               // Khi admin duyệt
        public Guid? ApprovedBy { get; set; }                   // Admin duyệt

    }
}
