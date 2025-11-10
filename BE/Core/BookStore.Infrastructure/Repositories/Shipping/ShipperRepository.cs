using BookStore.Domain.Entities.Shipping;
using BookStore.Domain.IRepository.Shipping;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Shipping
{
    public class ShipperRepository : GenericRepository<Shipper>, IShipperRepository
    {
        public ShipperRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Shipper?> GetByPhoneNumberAsync(string phoneNumber)
        {
            return await _dbSet
                .FirstOrDefaultAsync(s => s.PhoneNumber == phoneNumber);
        }

        public async Task<Shipper?> GetByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return null;

            return await _dbSet
                .FirstOrDefaultAsync(s => s.Email == email);
        }

        public async Task<IEnumerable<Shipper>> GetActiveShippersAsync()
        {
            return await _dbSet
                .Where(s => s.IsActive)
                .OrderBy(s => s.Name)
                .ToListAsync();
        }

        public async Task<Shipper?> GetShipperWithShipmentsAsync(Guid shipperId)
        {
            return await _dbSet
                .Include(s => s.Shipments)
                    .ThenInclude(sh => sh.Order)
                .FirstOrDefaultAsync(s => s.Id == shipperId);
        }

        public async Task<bool> IsPhoneNumberExistsAsync(string phoneNumber, Guid? excludeShipperId = null)
        {
            var query = _dbSet.Where(s => s.PhoneNumber == phoneNumber);

            if (excludeShipperId.HasValue)
            {
                query = query.Where(s => s.Id != excludeShipperId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<bool> IsEmailExistsAsync(string email, Guid? excludeShipperId = null)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            var query = _dbSet.Where(s => s.Email == email);

            if (excludeShipperId.HasValue)
            {
                query = query.Where(s => s.Id != excludeShipperId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<(IEnumerable<Shipper> Items, int TotalCount)> GetPagedShippersAsync(
            int pageNumber,
            int pageSize,
            bool? isActive = null,
            string? searchTerm = null)
        {
            var query = _dbSet.AsQueryable();

            // Filter by status
            if (isActive.HasValue)
            {
                query = query.Where(s => s.IsActive == isActive.Value);
            }

            // Search by name, phone, email
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var lowerSearchTerm = searchTerm.ToLower();
                query = query.Where(s =>
                    s.Name.ToLower().Contains(lowerSearchTerm) ||
                    s.PhoneNumber.Contains(lowerSearchTerm) ||
                    (s.Email != null && s.Email.ToLower().Contains(lowerSearchTerm)) ||
                    (s.VehicleNumber != null && s.VehicleNumber.ToLower().Contains(lowerSearchTerm))
                );
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(s => s.Name)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<int> GetShipmentCountAsync(Guid shipperId)
        {
            var shipper = await _dbSet
                .Include(s => s.Shipments)
                .FirstOrDefaultAsync(s => s.Id == shipperId);

            return shipper?.Shipments.Count ?? 0;
        }

        public async Task SetShipperStatusAsync(Guid shipperId, bool isActive)
        {
            var shipper = await GetByIdAsync(shipperId);
            if (shipper != null)
            {
                shipper.IsActive = isActive;
                // SaveChanges will be called in service layer
            }
        }
    }
}
