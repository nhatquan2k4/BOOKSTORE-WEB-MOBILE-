using BookStore.Domain.Entities.Shipping;
using BookStore.Domain.IRepository.Shipping;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Shipping
{
    public class ShipmentRepository : GenericRepository<Shipment>, IShipmentRepository
    {
        public ShipmentRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Shipment?> GetByTrackingCodeAsync(string trackingCode)
        {
            return await _dbSet
                .Include(s => s.Shipper)
                .Include(s => s.Order)
                .Include(s => s.StatusHistory.OrderByDescending(sh => sh.UpdatedAt))
                .Include(s => s.RoutePoints.OrderByDescending(rp => rp.Timestamp))
                .FirstOrDefaultAsync(s => s.TrackingCode == trackingCode);
        }

        public async Task<Shipment?> GetByOrderIdAsync(Guid orderId)
        {
            return await _dbSet
                .Include(s => s.Shipper)
                .Include(s => s.Order)
                .Include(s => s.StatusHistory.OrderByDescending(sh => sh.UpdatedAt))
                .Include(s => s.RoutePoints.OrderByDescending(rp => rp.Timestamp))
                .FirstOrDefaultAsync(s => s.OrderId == orderId);
        }

        public async Task<IEnumerable<Shipment>> GetByShipperIdAsync(Guid shipperId)
        {
            return await _dbSet
                .Include(s => s.Order)
                .Include(s => s.StatusHistory.OrderByDescending(sh => sh.UpdatedAt))
                .Where(s => s.ShipperId == shipperId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Shipment>> GetByStatusAsync(string status)
        {
            return await _dbSet
                .Include(s => s.Shipper)
                .Include(s => s.Order)
                .Where(s => s.Status == status)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<Shipment?> GetWithDetailsAsync(Guid id)
        {
            return await _dbSet
                .Include(s => s.Shipper)
                .Include(s => s.Order)
                    .ThenInclude(o => o.Items)
                .Include(s => s.StatusHistory.OrderByDescending(sh => sh.UpdatedAt))
                .Include(s => s.RoutePoints.OrderByDescending(rp => rp.Timestamp))
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<string> GenerateTrackingCodeAsync()
        {
            // Generate unique tracking code: SHIP-YYYYMMDD-XXXXX
            var date = DateTime.Now.ToString("yyyyMMdd");
            var random = new Random();
            string trackingCode;

            do
            {
                var randomNumber = random.Next(10000, 99999);
                trackingCode = $"SHIP-{date}-{randomNumber}";
            }
            while (await _dbSet.AnyAsync(s => s.TrackingCode == trackingCode));

            return trackingCode;
        }
    }
}