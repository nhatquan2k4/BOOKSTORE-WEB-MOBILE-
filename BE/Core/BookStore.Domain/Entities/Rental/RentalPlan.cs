using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Rental
{
    public class RentalPlan
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = null!;               // Tên gói thuê (VD: 7 ngày, 30 ngày, 90 ngày)
        public string? Description { get; set; }                // Mô tả ngắn gọn về gói thuê
        public decimal Price { get; set; }                      // Giá thuê gói này (tính theo VND)
        public int DurationDays { get; set; }                   // Thời lượng thuê (tính bằng ngày)
        public bool IsActive { get; set; } = true;              // Gói thuê đang hoạt động hay không
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // 🔗 1-n: Một gói thuê có thể áp dụng cho nhiều lượt thuê sách
        public virtual ICollection<BookRental> BookRentals { get; set; } = new List<BookRental>();
    }
}
