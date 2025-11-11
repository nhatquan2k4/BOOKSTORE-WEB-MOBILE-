using BookStore.Application.Dtos.Shipping;
using BookStore.Application.IService.Shipping;
using BookStore.Application.Mappers.Shipping;
using BookStore.Domain.Entities.Shipping;
using BookStore.Domain.IRepository.Shipping;
using BookStore.Shared.Exceptions;
using Microsoft.Extensions.Logging;

namespace BookStore.Application.Services.Shipping
{
    public class ShipmentService : IShipmentService
    {
        private readonly IShipmentRepository _shipmentRepository;
        private readonly IShipperRepository _shipperRepository;
        private readonly ILogger<ShipmentService> _logger;

        public ShipmentService(
            IShipmentRepository shipmentRepository,
            IShipperRepository shipperRepository,
            ILogger<ShipmentService> logger)
        {
            _shipmentRepository = shipmentRepository;
            _shipperRepository = shipperRepository;
            _logger = logger;
        }

        public async Task<ShipmentDto> CreateShipmentAsync(CreateShipmentDto dto)
        {
            // Kiểm tra shipper tồn tại và active
            var shipper = await _shipperRepository.GetByIdAsync(dto.ShipperId);
            if (shipper == null)
                throw new UserFriendlyException("Không tìm thấy shipper");

            if (!shipper.IsActive)
                throw new UserFriendlyException("Shipper hiện không hoạt động");

            // Kiểm tra order đã có vận đơn chưa
            var existingShipment = await _shipmentRepository.GetByOrderIdAsync(dto.OrderId);
            if (existingShipment != null)
                throw new UserFriendlyException("Đơn hàng này đã có vận đơn");

            // Generate tracking code
            var trackingCode = await _shipmentRepository.GenerateTrackingCodeAsync();

            // Tạo shipment
            var shipment = dto.ToEntity(trackingCode);
            await _shipmentRepository.AddAsync(shipment);
            await _shipmentRepository.SaveChangesAsync();

            // Thêm status history ban đầu
            var initialStatus = new ShipmentStatus
            {
                Id = Guid.NewGuid(),
                ShipmentId = shipment.Id,
                Status = "Preparing",
                Description = "Vận đơn được tạo",
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = "System"
            };
            shipment.StatusHistory.Add(initialStatus);
            await _shipmentRepository.SaveChangesAsync();

            _logger.LogInformation($"Đã tạo vận đơn {trackingCode} cho đơn hàng {dto.OrderId}");

            return (await _shipmentRepository.GetWithDetailsAsync(shipment.Id))!.ToDto();
        }

        public async Task<ShipmentDto?> GetShipmentByIdAsync(Guid id)
        {
            var shipment = await _shipmentRepository.GetWithDetailsAsync(id);
            return shipment?.ToDto();
        }

        public async Task<ShipmentDto?> GetShipmentByTrackingCodeAsync(string trackingCode)
        {
            var shipment = await _shipmentRepository.GetByTrackingCodeAsync(trackingCode);
            return shipment?.ToDto();
        }

        public async Task<ShipmentDto?> GetShipmentByOrderIdAsync(Guid orderId)
        {
            var shipment = await _shipmentRepository.GetByOrderIdAsync(orderId);
            return shipment?.ToDto();
        }

        public async Task<IEnumerable<ShipmentDto>> GetAllShipmentsAsync()
        {
            var shipments = await _shipmentRepository.GetAllAsync();
            return shipments.Select(s => s.ToDto());
        }

        public async Task<IEnumerable<ShipmentDto>> GetShipmentsByShipperIdAsync(Guid shipperId)
        {
            var shipments = await _shipmentRepository.GetByShipperIdAsync(shipperId);
            return shipments.Select(s => s.ToDto());
        }

        public async Task<IEnumerable<ShipmentDto>> GetShipmentsByStatusAsync(string status)
        {
            var shipments = await _shipmentRepository.GetByStatusAsync(status);
            return shipments.Select(s => s.ToDto());
        }

        public async Task<ShipmentDto> UpdateShipmentStatusAsync(Guid id, UpdateShipmentStatusDto dto)
        {
            var shipment = await _shipmentRepository.GetWithDetailsAsync(id);
            if (shipment == null)
                throw new UserFriendlyException("Không tìm thấy vận đơn");

            // Cập nhật status chính
            shipment.Status = dto.Status;

            // Nếu delivered thì set thời gian
            if (dto.Status == "Delivered")
            {
                shipment.DeliveredAt = DateTime.UtcNow;
            }

            // Thêm vào status history
            var statusHistory = dto.ToStatusEntity(shipment.Id);
            shipment.StatusHistory.Add(statusHistory);

            _shipmentRepository.Update(shipment);
            await _shipmentRepository.SaveChangesAsync();

            _logger.LogInformation($"Đã cập nhật trạng thái vận đơn {shipment.TrackingCode} thành {dto.Status}");

            return (await _shipmentRepository.GetWithDetailsAsync(id))!.ToDto();
        }

        public async Task<ShipmentDto> AddRoutePointAsync(Guid shipmentId, CreateRoutePointDto dto)
        {
            var shipment = await _shipmentRepository.GetWithDetailsAsync(shipmentId);
            if (shipment == null)
                throw new UserFriendlyException("Không tìm thấy vận đơn");

            var routePoint = dto.ToRouteEntity(shipmentId);
            shipment.RoutePoints.Add(routePoint);

            await _shipmentRepository.SaveChangesAsync();

            _logger.LogInformation($"Đã thêm điểm route {dto.Location} cho vận đơn {shipment.TrackingCode}");

            return (await _shipmentRepository.GetWithDetailsAsync(shipmentId))!.ToDto();
        }

        public async Task<ShipmentDto> AssignShipperAsync(Guid shipmentId, Guid shipperId)
        {
            var shipment = await _shipmentRepository.GetByIdAsync(shipmentId);
            if (shipment == null)
                throw new UserFriendlyException("Không tìm thấy vận đơn");

            var shipper = await _shipperRepository.GetByIdAsync(shipperId);
            if (shipper == null)
                throw new UserFriendlyException("Không tìm thấy shipper");

            if (!shipper.IsActive)
                throw new UserFriendlyException("Shipper hiện không hoạt động");

            shipment.ShipperId = shipperId;
            _shipmentRepository.Update(shipment);
            await _shipmentRepository.SaveChangesAsync();

            _logger.LogInformation($"Đã gán shipper {shipper.Name} cho vận đơn {shipment.TrackingCode}");

            return (await _shipmentRepository.GetWithDetailsAsync(shipmentId))!.ToDto();
        }

        public async Task<bool> CancelShipmentAsync(Guid id, string reason)
        {
            var shipment = await _shipmentRepository.GetWithDetailsAsync(id);
            if (shipment == null)
                return false;

            if (shipment.Status == "Delivered")
                throw new UserFriendlyException("Không thể hủy vận đơn đã giao thành công");

            shipment.Status = "Cancelled";

            // Thêm status history
            var statusHistory = new ShipmentStatus
            {
                Id = Guid.NewGuid(),
                ShipmentId = shipment.Id,
                Status = "Cancelled",
                Description = $"Đã hủy: {reason}",
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = "System"
            };
            shipment.StatusHistory.Add(statusHistory);

            _shipmentRepository.Update(shipment);
            await _shipmentRepository.SaveChangesAsync();

            _logger.LogInformation($"Đã hủy vận đơn {shipment.TrackingCode}. Lý do: {reason}");

            return true;
        }

        public async Task<ShipmentDto> CompleteDeliveryAsync(Guid id, CompleteDeliveryDto dto)
        {
            var shipment = await _shipmentRepository.GetWithDetailsAsync(id);
            if (shipment == null)
                throw new UserFriendlyException("Không tìm thấy vận đơn");

            shipment.Status = "Delivered";
            shipment.DeliveredAt = DateTime.UtcNow;
            shipment.Notes = $"Người nhận: {dto.ReceiverName} - {dto.ReceiverPhone}. {dto.Notes}";

            // Thêm status history
            var statusHistory = new ShipmentStatus
            {
                Id = Guid.NewGuid(),
                ShipmentId = shipment.Id,
                Status = "Delivered",
                Description = $"Giao thành công. {dto.Notes}",
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = "Shipper"
            };
            shipment.StatusHistory.Add(statusHistory);

            _shipmentRepository.Update(shipment);
            await _shipmentRepository.SaveChangesAsync();

            _logger.LogInformation($"Đã hoàn thành giao hàng cho vận đơn {shipment.TrackingCode}");

            return (await _shipmentRepository.GetWithDetailsAsync(id))!.ToDto();
        }

        public async Task<bool> HandleWebhookAsync(ShipmentWebhookDto dto)
        {
            try
            {
                // TODO: Verify signature để đảm bảo webhook đến từ nguồn tin cậy
                // if (!VerifyWebhookSignature(dto.Signature, dto))
                // {
                //     _logger.LogWarning($"Webhook signature không hợp lệ cho tracking code {dto.TrackingCode}");
                //     return false;
                // }

                var shipment = await _shipmentRepository.GetByTrackingCodeAsync(dto.TrackingCode);
                if (shipment == null)
                {
                    _logger.LogWarning($"Không tìm thấy vận đơn với tracking code {dto.TrackingCode}");
                    return false;
                }

                // Cập nhật status
                shipment.Status = dto.Status;

                // Nếu delivered thì set thời gian
                if (dto.Status == "Delivered")
                {
                    shipment.DeliveredAt = dto.Timestamp ?? DateTime.UtcNow;
                }

                // Thêm vào status history
                var statusHistory = new ShipmentStatus
                {
                    Id = Guid.NewGuid(),
                    ShipmentId = shipment.Id,
                    Status = dto.Status,
                    Description = $"Cập nhật từ đối tác: {dto.Notes} - Location: {dto.Location}",
                    UpdatedAt = dto.Timestamp ?? DateTime.UtcNow,
                    UpdatedBy = "Webhook"
                };
                shipment.StatusHistory.Add(statusHistory);

                // Nếu có location thì thêm route point
                if (!string.IsNullOrEmpty(dto.Location))
                {
                    var routePoint = new ShipmentRoutePoint
                    {
                        Id = Guid.NewGuid(),
                        ShipmentId = shipment.Id,
                        Location = dto.Location,
                        Status = dto.Status,
                        Note = dto.Notes,
                        Timestamp = dto.Timestamp ?? DateTime.UtcNow
                    };
                    shipment.RoutePoints.Add(routePoint);
                }

                _shipmentRepository.Update(shipment);
                await _shipmentRepository.SaveChangesAsync();

                _logger.LogInformation($"Đã xử lý webhook cho vận đơn {dto.TrackingCode}. Status: {dto.Status}");

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xử lý webhook cho tracking code {dto.TrackingCode}");
                return false;
            }
        }

        // TODO: Implement signature verification
        // private bool VerifyWebhookSignature(string signature, ShipmentWebhookDto dto)
        // {
        //     // Implement HMAC-SHA256 verification with secret key
        //     return true;
        // }
    }
}
