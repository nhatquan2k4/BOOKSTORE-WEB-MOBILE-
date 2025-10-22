using BookStore.Domain.Entities.Catalog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Pricing___Inventory
{
    public class StockItem
    {
        public Guid Id { get; set; }

        public Guid BookId { get; set; }                       // FK tới sách
        public virtual Book Book { get; set; } = null!;

        public int Quantity { get; set; }                      // Số lượng tồn trong kho
        public int Reserved { get; set; }                      // Số lượng đang giữ cho các đơn hàng chưa giao
        public int Sold { get; set; }                          // Tổng số lượng đã bán ra

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow; // Lần cập nhật gần nhất
    }
}
