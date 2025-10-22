using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Pricing___Inventory
{
    public class Discount
    {
        public Guid Id { get; set; }

        public string Code { get; set; } = null!;              // Mã giảm giá (VD: SUMMER2025)
        public string Title { get; set; } = null!;             // Tên chương trình giảm giá
        public string? Description { get; set; }               // Mô tả ngắn gọn
        public decimal Percentage { get; set; }                // % giảm (0.1 = giảm 10%)
        public decimal? MaxDiscountAmount { get; set; }        // Giới hạn số tiền giảm tối đa

        public DateTime StartDate { get; set; }                // Ngày bắt đầu
        public DateTime EndDate { get; set; }                  // Ngày kết thúc
        public bool IsActive { get; set; } = true;             // Còn hiệu lực không

        // 🔗 1-n: Một chương trình giảm giá có thể áp dụng cho nhiều sách
        public virtual ICollection<Price> Prices { get; set; } = new List<Price>();
    }
}
