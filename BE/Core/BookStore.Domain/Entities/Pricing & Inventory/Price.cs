using BookStore.Domain.Entities.Catalog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Pricing___Inventory
{
    public class Price
    {
        public Guid Id { get; set; }

        public Guid BookId { get; set; }                       // FK tới sách
        public virtual Book Book { get; set; } = null!;        // Mỗi giá ứng với 1 quyển sách

        public decimal Amount { get; set; }                    // Giá bán hiện tại của sách
        public string Currency { get; set; } = "VND";          // Loại tiền tệ (mặc định là VNĐ)
        public bool IsCurrent { get; set; } = true;            // Có phải giá hiện hành không
        public DateTime EffectiveFrom { get; set; }            // Ngày bắt đầu áp dụng
        public DateTime? EffectiveTo { get; set; }             // Ngày kết thúc (null = vẫn còn hiệu lực)

        public Guid? DiscountId { get; set; }                  // Nếu giá thuộc 1 chương trình giảm giá cụ thể
        public virtual Discount? Discount { get; set; }        // Quan hệ đến Discount
    }
}
