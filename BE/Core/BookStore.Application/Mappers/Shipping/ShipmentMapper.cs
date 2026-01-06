using BookStore.Application.Dtos.Shipping;
using BookStore.Domain.Entities.Shipping;
using BookStore.Domain.Entities.Ordering;
using BookStore.Domain.Entities.Ordering___Payment;

namespace BookStore.Application.Mappers.Shipping
{
    public static class ShipmentMapper
    {
        public static ShipmentDto ToDto(this Shipment entity)
        {
            return new ShipmentDto
            {
                Id = entity.Id,
                OrderId = entity.OrderId,
                ShipperId = entity.ShipperId,
                ShipperName = entity.Shipper?.Name ?? "N/A",
                TrackingCode = entity.TrackingCode,
                Status = entity.Status,
                CreatedAt = entity.CreatedAt,
                DeliveredAt = entity.DeliveredAt,
                Notes = entity.Notes,
                Shipper = entity.Shipper?.ToDto(),
                Order = entity.Order?.ToShipmentOrderDto(),
                StatusHistory = entity.StatusHistory?.Select(s => s.ToDto()).ToList(),
                RoutePoints = entity.RoutePoints?.Select(r => r.ToDto()).ToList()
            };
        }

        public static ShipmentStatusDto ToDto(this ShipmentStatus entity)
        {
            return new ShipmentStatusDto
            {
                Id = entity.Id,
                Status = entity.Status,
                Notes = entity.Description,
                Location = null, // Entity không có Location
                CreatedAt = entity.UpdatedAt
            };
        }

        public static ShipmentRoutePointDto ToDto(this ShipmentRoutePoint entity)
        {
            return new ShipmentRoutePointDto
            {
                Id = entity.Id,
                Location = entity.Location,
                Latitude = null, // Entity không có Latitude
                Longitude = null, // Entity không có Longitude
                Notes = entity.Note,
                ArrivedAt = entity.Timestamp
            };
        }

        public static Shipment ToEntity(this CreateShipmentDto dto, string trackingCode)
        {
            return new Shipment
            {
                Id = Guid.NewGuid(),
                OrderId = dto.OrderId,
                ShipperId = dto.ShipperId,
                TrackingCode = trackingCode,
                Status = "Preparing",
                CreatedAt = DateTime.UtcNow,
                Notes = dto.Notes
            };
        }

        public static ShipmentStatus ToStatusEntity(this UpdateShipmentStatusDto dto, Guid shipmentId)
        {
            return new ShipmentStatus
            {
                Id = Guid.NewGuid(),
                ShipmentId = shipmentId,
                Status = dto.Status,
                Description = $"{dto.Notes} - Location: {dto.Location}",
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = "System"
            };
        }

        public static ShipmentRoutePoint ToRouteEntity(this CreateRoutePointDto dto, Guid shipmentId)
        {
            return new ShipmentRoutePoint
            {
                Id = Guid.NewGuid(),
                ShipmentId = shipmentId,
                Location = dto.Location,
                Status = "Arrived",
                Note = dto.Notes,
                Timestamp = DateTime.UtcNow
            };
        }

        // Mapper cho Order và các thành phần liên quan
        public static ShipmentOrderDto? ToShipmentOrderDto(this Order? entity)
        {
            if (entity == null) return null;

            return new ShipmentOrderDto
            {
                Id = entity.Id,
                OrderNumber = entity.OrderNumber,
                Status = entity.Status,
                TotalAmount = entity.TotalAmount,
                DiscountAmount = entity.DiscountAmount,
                FinalAmount = entity.FinalAmount,
                CreatedAt = entity.CreatedAt,
                PaidAt = entity.PaidAt,
                Address = entity.Address?.ToShipmentOrderAddressDto(),
                Items = entity.Items?.Select(i => i.ToShipmentOrderItemDto()).ToList()
            };
        }

        public static ShipmentOrderAddressDto? ToShipmentOrderAddressDto(this OrderAddress? entity)
        {
            if (entity == null) return null;

            return new ShipmentOrderAddressDto
            {
                Id = entity.Id,
                RecipientName = entity.RecipientName,
                PhoneNumber = entity.PhoneNumber,
                Province = entity.Province,
                District = entity.District,
                Ward = entity.Ward,
                Street = entity.Street,
                Note = entity.Note
            };
        }

        public static ShipmentOrderItemDto ToShipmentOrderItemDto(this OrderItem entity)
        {
            return new ShipmentOrderItemDto
            {
                Id = entity.Id,
                BookId = entity.BookId,
                BookTitle = entity.Book?.Title ?? "N/A",
                Quantity = entity.Quantity,
                UnitPrice = entity.UnitPrice,
                Subtotal = entity.Subtotal
            };
        }
    }
}