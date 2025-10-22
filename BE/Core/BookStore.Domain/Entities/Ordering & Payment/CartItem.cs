using BookStore.Domain.Entities.Catalog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Ordering
{
    public class CartItem
    {
        public Guid Id { get; set; }

        public Guid CartId { get; set; }
        public virtual Cart Cart { get; set; } = null!;        // FK: thuộc giỏ hàng nào

        public Guid BookId { get; set; }
        public virtual Book Book { get; set; } = null!;        // Sản phẩm là quyển sách

        public int Quantity { get; set; }                      // Số lượng đặt mua
        public decimal UnitPrice { get; set; }                 // Giá 1 quyển tại thời điểm thêm vào giỏ
        public decimal TotalPrice => Quantity * UnitPrice;     // Tổng giá trị (computed)

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }
}
