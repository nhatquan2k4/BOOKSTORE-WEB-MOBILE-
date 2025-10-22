using BookStore.Domain.Entities.Ordering;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Shipping
{
    public class Shipment
    {
        public Guid Id { get; set; }

        public Guid OrderId { get; set; }                       // FK: Mỗi vận đơn gắn với 1 đơn hàng
        public virtual Order Order { get; set; } = null!;

        public Guid ShipperId { get; set; }                     // FK: Shipper phụ trách đơn hàng này
        public virtual Shipper Shipper { get; set; } = null!;

        public string TrackingCode { get; set; } = null!;       // Mã vận đơn (do hệ thống hoặc đối tác cung cấp)
        public string Status { get; set; } = "Preparing";       // Trạng thái hiện tại (Preparing, InTransit, Delivered, Cancelled)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Thời điểm tạo vận đơn
        public DateTime? DeliveredAt { get; set; }              // Khi hàng được giao thành công
        public string? Notes { get; set; }                      // Ghi chú giao hàng (ví dụ: "Giao ngoài giờ hành chính")

        // 🔗 1-n: Theo dõi lộ trình di chuyển
        public virtual ICollection<ShipmentRoutePoint> RoutePoints { get; set; } = new List<ShipmentRoutePoint>();

        // 🔗 1-n: Nhật ký trạng thái (cập nhật từ shipper hoặc hệ thống)
        public virtual ICollection<ShipmentStatus> StatusHistory { get; set; } = new List<ShipmentStatus>();

    }
}
