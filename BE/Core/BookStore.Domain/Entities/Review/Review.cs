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

        public int Rating { get; set; }                         // Điểm đánh giá (1–5 sao)
        public string Comment { get; set; } = null!;            // Nội dung đánh giá
        public bool IsEdited { get; set; } = false;             // Đã chỉnh sửa hay chưa
        public bool IsDeleted { get; set; } = false;            // Đánh dấu xóa mềm (soft delete)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Thời điểm viết đánh giá
        public DateTime? UpdatedAt { get; set; }                // Khi chỉnh sửa đánh giá

    }
}
