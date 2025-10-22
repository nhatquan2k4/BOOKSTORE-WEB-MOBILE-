using BookStore.Domain.Entities.Ordering;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Ordering___Payment
{
    public class OrderStatusLog
    {
        public Guid Id { get; set; }

        public Guid OrderId { get; set; }
        public virtual Order Order { get; set; } = null!;

        public string OldStatus { get; set; } = null!;         // Trạng thái cũ
        public string NewStatus { get; set; } = null!;         // Trạng thái mới
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
        public string? ChangedBy { get; set; }                 // Ai thay đổi (Admin/User/System)

    }
}
