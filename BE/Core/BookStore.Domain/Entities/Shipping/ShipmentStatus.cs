using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Shipping
{
    public class ShipmentStatus
    {
        public Guid Id { get; set; }

        public Guid ShipmentId { get; set; }                    // FK: Vận đơn liên quan
        public virtual Shipment Shipment { get; set; } = null!;

        public string Status { get; set; } = null!;             // Trạng thái (Preparing, InTransit, Delivered, Failed,…)
        public string? Description { get; set; }                // Mô tả chi tiết (VD: "Đang giao, chưa liên hệ được khách")
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // Thời gian cập nhật trạng thái
        public string? UpdatedBy { get; set; }                  // Ai cập nhật (System/Shipper/Admin)

    }
}
