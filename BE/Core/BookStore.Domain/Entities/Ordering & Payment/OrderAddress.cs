using BookStore.Domain.Entities.Ordering;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Ordering___Payment
{
    public class OrderAddress
    {
        public Guid Id { get; set; }

        public string RecipientName { get; set; } = null!;     // Người nhận hàng
        public string PhoneNumber { get; set; } = null!;       // Số điện thoại liên hệ
        public string Province { get; set; } = null!;          // Tỉnh/Thành phố
        public string District { get; set; } = null!;          // Quận/Huyện
        public string Ward { get; set; } = null!;              // Phường/Xã
        public string Street { get; set; } = null!;            // Địa chỉ chi tiết
        public string? Note { get; set; }                      // Ghi chú giao hàng (tuỳ chọn)

        // 🔗 1-1: Mỗi OrderAddress chỉ thuộc về một đơn hàng
        public virtual Order? Order { get; set; }
    }
}
