using BookStore.Domain.Entities.Identity;
using BookStore.Domain.Entities.Ordering___Payment;
using BookStore.Domain.Entities.Pricing___Inventory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Ordering
{
    public class Order
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }                       // Người mua hàng
        public virtual User User { get; set; } = null!;

        public string Status { get; set; } = "Pending";        // Trạng thái hiện tại (Pending, Paid, Shipped, Completed, Cancelled)
        public string OrderNumber { get; set; } = null!;       // Mã đơn hàng hiển thị cho khách (VD: BK-2025-0001)
        public decimal TotalAmount { get; set; }               // Tổng tiền đơn hàng
        public decimal DiscountAmount { get; set; }            // Tổng tiền giảm giá (từ Discount/Coupon)
        public decimal FinalAmount => TotalAmount - DiscountAmount; // Số tiền khách phải trả sau giảm

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PaidAt { get; set; }                  // Thời điểm thanh toán (nếu đã trả)
        public DateTime? CompletedAt { get; set; }             // Khi đơn hoàn thành
        public DateTime? CancelledAt { get; set; }             // Khi đơn bị hủy

        // 🔗 1-n: Chi tiết sản phẩm
        public virtual ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();

        // 🔗 1-1: Địa chỉ giao hàng riêng cho đơn
        public Guid AddressId { get; set; }
        public virtual OrderAddress Address { get; set; } = null!;

        // 🔗 1-1: Giao dịch thanh toán
        public virtual PaymentTransaction? PaymentTransaction { get; set; }

        // 🔗 1-n: Lịch sử trạng thái
        public virtual ICollection<OrderStatusLog> StatusLogs { get; set; } = new List<OrderStatusLog>();

        // 🔗 1-n: Lịch sử hành động chi tiết
        public virtual ICollection<OrderHistory> Histories { get; set; } = new List<OrderHistory>();

        // 🔗 n-1: Có thể dùng coupon
        public Guid? CouponId { get; set; }
        public virtual Coupon? Coupon { get; set; }
    }
}
