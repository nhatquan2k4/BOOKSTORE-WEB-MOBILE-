using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Ordering___Payment
{
    public class PaymentProvider
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = null!;              // Tên nhà cung cấp (VNPay, PayPal, Stripe,…)
        public string ApiUrl { get; set; } = null!;            // URL API của provider
        public string PublicKey { get; set; } = null!;         // Key public để xác thực
        public string SecretKey { get; set; } = null!;         // Secret key để ký giao dịch
        public bool IsSandbox { get; set; } = true;            // Chạy thử nghiệm hay thật

    }
}
