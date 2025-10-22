using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Shipping
{
    public class ShipmentRoutePoint
    {
        public Guid Id { get; set; }

        public Guid ShipmentId { get; set; }                    // FK: Thuộc vận đơn nào
        public virtual Shipment Shipment { get; set; } = null!;

        public string Location { get; set; } = null!;           // Vị trí cụ thể (VD: “Kho HCM”, “Bưu cục Gò Vấp”)
        public string Status { get; set; } = "InTransit";       // Trạng thái tại điểm này (InTransit, Arrived, Delayed,…)
        public DateTime Timestamp { get; set; } = DateTime.UtcNow; // Thời gian cập nhật
        public string? Note { get; set; }                       // Ghi chú thêm (ví dụ: “Đã rời kho”, “Đang giao”)

    }
}
