using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Shipping
{
    public class Shipper
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = null!;               // Tên shipper hoặc tên công ty vận chuyển
        public string PhoneNumber { get; set; } = null!;        // Số điện thoại liên hệ
        public string? Email { get; set; }                      // Email hỗ trợ
        public string? VehicleNumber { get; set; }              // Biển số xe hoặc mã phương tiện
        public bool IsActive { get; set; } = true;              // Đang hoạt động không

        // 🔗 1-n: Một shipper có thể giao nhiều đơn hàng
        public virtual ICollection<Shipment> Shipments { get; set; } = new List<Shipment>();
    }
}
