using BookStore.Domain.Entities.Identity;
using BookStore.Domain.Entities.Ordering;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Pricing___Inventory
{
    public class Coupon
    {
        public Guid Id { get; set; }

        public string Code { get; set; } = null!;              // Mã coupon do hệ thống cấp cho người dùng
        public decimal Value { get; set; }                     // Giá trị giảm (theo số tiền hoặc %)
        public bool IsPercentage { get; set; }                 // true = giảm theo %, false = giảm theo tiền mặt
        public DateTime Expiration { get; set; }               // Ngày hết hạn
        public bool IsUsed { get; set; } = false;              // Đã sử dụng hay chưa

        public Guid? UserId { get; set; }                      // Coupon có thể gán riêng cho 1 user
        public virtual User? User { get; set; }

        // 🔗 Có thể gắn coupon vào nhiều đơn hàng
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
