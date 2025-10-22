using BookStore.Domain.Entities.Catalog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Ordering
{
    public class OrderItem
    {
        public Guid Id { get; set; }

        public Guid OrderId { get; set; }
        public virtual Order Order { get; set; } = null!;      // FK: đơn hàng chứa sản phẩm

        public Guid BookId { get; set; }
        public virtual Book Book { get; set; } = null!;        // FK: sách được mua

        public int Quantity { get; set; }                      // Số lượng đặt
        public decimal UnitPrice { get; set; }                 // Giá đơn vị tại thời điểm đặt hàng
        public decimal Subtotal => Quantity * UnitPrice;       // Thành tiền (computed)
    }
}
