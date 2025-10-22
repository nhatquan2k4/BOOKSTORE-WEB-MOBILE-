using BookStore.Domain.Entities.Ordering;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Ordering___Payment
{
    public class PaymentTransaction
    {
        public Guid Id { get; set; }

        public Guid OrderId { get; set; }
        public virtual Order Order { get; set; } = null!;

        public string Provider { get; set; } = "VNPay";        // Cổng thanh toán (VNPay, MoMo, COD,…)
        public string TransactionCode { get; set; } = null!;   // Mã giao dịch từ phía cổng thanh toán
        public string PaymentMethod { get; set; } = "Online";  // Hình thức thanh toán
        public decimal Amount { get; set; }                    // Số tiền thanh toán
        public string Status { get; set; } = "Pending";        // Pending / Success / Failed / Refunded
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PaidAt { get; set; }                  // Khi thanh toán thành công

        // 🔗 1-n: Có thể có nhiều Refund
        public virtual ICollection<Refund> Refunds { get; set; } = new List<Refund>();
    }
}
