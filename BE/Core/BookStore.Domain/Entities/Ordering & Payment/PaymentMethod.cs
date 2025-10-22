using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Ordering___Payment
{
    public class PaymentMethod
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = null!;              // Tên phương thức (COD, VNPay, MoMo,…)
        public string Description { get; set; } = null!;       // Mô tả cách thức thanh toán
        public bool IsActive { get; set; } = true;             // Đang hoạt động không

        // 🔗 1-n: Một phương thức có thể dùng cho nhiều giao dịch
        public virtual ICollection<PaymentTransaction> Transactions { get; set; } = new List<PaymentTransaction>();

    }
}
