using BookStore.Domain.Entities.Catalog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Pricing___Inventory
{
    public class InventoryTransaction
    {
        public Guid Id { get; set; }
        public Guid WarehouseId { get; set; }
        public Guid BookId { get; set; }
        public InventoryTransactionType Type { get; set; }
        public int QuantityChange { get; set; }    // Dương = nhập, âm = xuất
        public string? ReferenceId { get; set; }   // OrderId, RefundId, v.v.
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Warehouse Warehouse { get; set; } = null!;
        public virtual Book Book { get; set; } = null!;
    }

    public enum InventoryTransactionType
    {
        Inbound,     // Nhập
        Outbound,    // Xuất
        Adjustment   // Điều chỉnh tồn
    }

}
