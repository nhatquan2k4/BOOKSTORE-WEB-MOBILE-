using BookStore.Application.Dtos.Shipping;
using BookStore.Domain.Entities.Shipping;

namespace BookStore.Application.Mappers.Shipping
{
    public static class ShipperMapper
    {
        // Shipper Entity -> ShipperDto
        public static ShipperDto ToDto(this Shipper shipper)
        {
            return new ShipperDto
            {
                Id = shipper.Id,
                Name = shipper.Name,
                PhoneNumber = shipper.PhoneNumber,
                Email = shipper.Email,
                VehicleNumber = shipper.VehicleNumber,
                IsActive = shipper.IsActive,
                TotalShipments = shipper.Shipments?.Count ?? 0
            };
        }

        // Shipper Entity -> ShipperDetailDto
        public static ShipperDetailDto ToDetailDto(this Shipper shipper)
        {
            return new ShipperDetailDto
            {
                Id = shipper.Id,
                Name = shipper.Name,
                PhoneNumber = shipper.PhoneNumber,
                Email = shipper.Email,
                VehicleNumber = shipper.VehicleNumber,
                IsActive = shipper.IsActive,
                TotalShipments = shipper.Shipments?.Count ?? 0,
                RecentShipments = shipper.Shipments?
                    .OrderByDescending(s => s.CreatedAt)
                    .Take(10)
                    .Select(s => new ShipmentSummaryDto
                    {
                        Id = s.Id,
                        OrderId = s.OrderId,
                        TrackingCode = s.TrackingCode,
                        Status = s.Status,
                        CreatedAt = s.CreatedAt,
                        DeliveredAt = s.DeliveredAt
                    })
                    .ToList()
            };
        }

        // CreateShipperDto -> Shipper Entity
        public static Shipper ToEntity(this CreateShipperDto dto)
        {
            return new Shipper
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                PhoneNumber = dto.PhoneNumber,
                Email = dto.Email,
                VehicleNumber = dto.VehicleNumber,
                IsActive = dto.IsActive
            };
        }

        // UpdateShipperDto -> Update Shipper Entity
        public static void UpdateFromDto(this Shipper shipper, UpdateShipperDto dto)
        {
            shipper.Name = dto.Name;
            shipper.PhoneNumber = dto.PhoneNumber;
            shipper.Email = dto.Email;
            shipper.VehicleNumber = dto.VehicleNumber;
            shipper.IsActive = dto.IsActive;
        }

        // List<Shipper> -> PagedShipperDto
        public static PagedShipperDto ToPagedDto(
            this IEnumerable<Shipper> shippers,
            int pageNumber,
            int pageSize,
            int totalCount)
        {
            return new PagedShipperDto
            {
                Items = shippers.Select(s => s.ToDto()),
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }
    }
}
