using System.ComponentModel.DataAnnotations;

namespace BookStore.Application.Dtos.Shipping
{
    // DTO hiển thị thông tin vận đơn
    public class ShipmentDto
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public Guid ShipperId { get; set; }
        public string ShipperName { get; set; } = null!;
        public string TrackingCode { get; set; } = null!;
        public string Status { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public string? Notes { get; set; }
        
        // Thông tin shipper
        public ShipperDto? Shipper { get; set; }
        
        // Lịch sử trạng thái
        public List<ShipmentStatusDto>? StatusHistory { get; set; }
        
        // Route points
        public List<ShipmentRoutePointDto>? RoutePoints { get; set; }
    }

    // DTO tạo vận đơn mới
    public class CreateShipmentDto
    {
        [Required(ErrorMessage = "OrderId là bắt buộc")]
        public Guid OrderId { get; set; }

        [Required(ErrorMessage = "ShipperId là bắt buộc")]
        public Guid ShipperId { get; set; }

        public string? Notes { get; set; }
    }

    // DTO cập nhật trạng thái vận đơn
    public class UpdateShipmentStatusDto
    {
        [Required(ErrorMessage = "Status là bắt buộc")]
        public string Status { get; set; } = null!; // Preparing, InTransit, Delivered, Cancelled

        public string? Notes { get; set; }
        

        public string? Location { get; set; } // Vị trí hiện tại
    }

    // DTO hoàn thành giao hàng
    public class CompleteDeliveryDto
    {
        public string? ReceiverName { get; set; }
        public string? ReceiverPhone { get; set; }
        public string? Notes { get; set; }
        public string? ProofImageUrl { get; set; } // URL ảnh chứng minh giao hàng
    }

    // DTO thêm điểm route
    public class CreateRoutePointDto
    {
        [Required(ErrorMessage = "Location là bắt buộc")]
        public string Location { get; set; } = null!;

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? Notes { get; set; }
    }

    // DTO webhook từ đối tác giao vận
    public class ShipmentWebhookDto
    {
        [Required(ErrorMessage = "TrackingCode là bắt buộc")]
        public string TrackingCode { get; set; } = null!;

        [Required(ErrorMessage = "Status là bắt buộc")]
        public string Status { get; set; } = null!;

        public string? Location { get; set; }
        public string? Notes { get; set; }
        public DateTime? Timestamp { get; set; }
        

        // Signature để verify webhook
        public string? Signature { get; set; }
    }

    // DTO trạng thái vận đơn
    public class ShipmentStatusDto
    {
        public Guid Id { get; set; }
        public string Status { get; set; } = null!;
        public string? Notes { get; set; }
        public string? Location { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // DTO điểm route
    public class ShipmentRoutePointDto
    {
        public Guid Id { get; set; }
        public string Location { get; set; } = null!;
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? Notes { get; set; }
        public DateTime ArrivedAt { get; set; }
    }
}
}
