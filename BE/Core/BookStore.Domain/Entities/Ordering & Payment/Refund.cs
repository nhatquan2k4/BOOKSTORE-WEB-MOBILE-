using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Ordering___Payment
{
    public class Refund
    {
        public Guid Id { get; set; }

        public Guid PaymentTransactionId { get; set; }
        public virtual PaymentTransaction PaymentTransaction { get; set; } = null!;

        public decimal Amount { get; set; }                    // Số tiền hoàn lại
        public string Reason { get; set; } = null!;            // Lý do hoàn tiền
        public string Status { get; set; } = "Pending";        // Pending / Completed / Rejected
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ProcessedAt { get; set; }             // Khi xử lý xong hoàn tiền
    }
}
