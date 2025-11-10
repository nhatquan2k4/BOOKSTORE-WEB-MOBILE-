using BookStore.Application.Dtos.Shipping;

namespace BookStore.Application.IService.Shipping
{
    public interface IShipmentService
    {
        // Tạo vận đơn mới
        Task<ShipmentDto> CreateShipmentAsync(CreateShipmentDto dto);
        
        // Lấy thông tin vận đơn
        Task<ShipmentDto?> GetShipmentByIdAsync(Guid id);
        Task<ShipmentDto?> GetShipmentByTrackingCodeAsync(string trackingCode);
        Task<ShipmentDto?> GetShipmentByOrderIdAsync(Guid orderId);
        
        // Lấy danh sách vận đơn
        Task<IEnumerable<ShipmentDto>> GetAllShipmentsAsync();
        Task<IEnumerable<ShipmentDto>> GetShipmentsByShipperIdAsync(Guid shipperId);
        Task<IEnumerable<ShipmentDto>> GetShipmentsByStatusAsync(string status);
        
        // Cập nhật trạng thái vận đơn
        Task<ShipmentDto> UpdateShipmentStatusAsync(Guid id, UpdateShipmentStatusDto dto);
        
        // Thêm điểm route
        Task<ShipmentDto> AddRoutePointAsync(Guid shipmentId, CreateRoutePointDto dto);
        
        // Gán shipper
        Task<ShipmentDto> AssignShipperAsync(Guid shipmentId, Guid shipperId);
        
        // Hủy vận đơn
        Task<bool> CancelShipmentAsync(Guid id, string reason);
        
        // Hoàn thành giao hàng
        Task<ShipmentDto> CompleteDeliveryAsync(Guid id, CompleteDeliveryDto dto);
        
        // Webhook từ đối tác giao vận
        Task<bool> HandleWebhookAsync(ShipmentWebhookDto dto);
    }
}
