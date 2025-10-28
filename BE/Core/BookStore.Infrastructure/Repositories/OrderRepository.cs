using BookStore.Domain.Entities.Ordering;
using BookStore.Domain.Interfaces.RepositoryOrdering;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories
{
    /// <summary>
    /// Implementation của IOrderRepository - thao tác với database thông qua EF Core
    /// </summary>
    public class OrderRepository : IOrderRepository
    {
        private readonly AppDbContext _context;

        public OrderRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            return await _context.Orders
                .Include(o => o.Items)
                .Include(o => o.PaymentTransaction)
                .Include(o => o.Address)
                .FirstOrDefaultAsync(o => o.Id == id, ct);
        }

        public async Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken ct = default)
        {
            return await _context.Orders
                .Include(o => o.Items)
                .Include(o => o.PaymentTransaction)
                .Include(o => o.Address)
                .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber, ct);
        }

        public async Task<IEnumerable<Order>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        {
            return await _context.Orders
                .Include(o => o.Items)
                .Include(o => o.PaymentTransaction)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync(ct);
        }

        public async Task AddAsync(Order order, CancellationToken ct = default)
        {
            await _context.Orders.AddAsync(order, ct);
            await _context.SaveChangesAsync(ct);
        }

        public async Task UpdateAsync(Order order, CancellationToken ct = default)
        {
            _context.Orders.Update(order);
            await _context.SaveChangesAsync(ct);
        }

        public async Task DeleteAsync(Guid id, CancellationToken ct = default)
        {
            var order = await GetByIdAsync(id, ct);
            if (order != null)
            {
                _context.Orders.Remove(order);
                await _context.SaveChangesAsync(ct);
            }
        }

        public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        {
            return await _context.Orders.AnyAsync(o => o.Id == id, ct);
        }

        public async Task<int> CountByUserIdAsync(Guid userId, CancellationToken ct = default)
        {
            return await _context.Orders.CountAsync(o => o.UserId == userId, ct);
        }
    }
}
