using BookStore.Domain.Entities.Pricing_Inventory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Pricing___Inventory
{
    public class Warehouse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = "Main Warehouse";
        public string? Address { get; set; }
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        // 🔗 1-n: Một kho có thể chứa nhiều mặt hàng tồn kho
        public virtual ICollection<StockItem> StockItems { get; set; } = new List<StockItem>();
    }
}
