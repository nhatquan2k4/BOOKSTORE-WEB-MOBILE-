using BookStore.Domain.Entities.Ordering;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Ordering___Payment
{
    public class OrderHistory
    {
        public Guid Id { get; set; }

        public Guid OrderId { get; set; }
        public virtual Order Order { get; set; } = null!;

        public string Action { get; set; } = null!;            // Hành động cụ thể (Thêm sách, Cập nhật địa chỉ, Thanh toán,…)
        public string? Details { get; set; }                   // Thông tin bổ sung
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
