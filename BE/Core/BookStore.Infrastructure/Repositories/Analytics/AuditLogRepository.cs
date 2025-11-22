using BookStore.Domain.Entities.Analytics___Activity;
using BookStore.Domain.IRepository.Analytics;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.Analytics
{
    public class AuditLogRepository : GenericRepository<AuditLog>, IAuditLogRepository
    {
        public AuditLogRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<AuditLog>> GetByAdminIdAsync(Guid adminId, int pageNumber = 1, int pageSize = 20)
        {
            return await _context.AuditLogs
                .Where(a => a.AdminId == adminId)
                .OrderByDescending(a => a.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetByEntityAsync(string entityName, string entityId)
        {
            return await _context.AuditLogs
                .Where(a => a.EntityName == entityName && a.EntityId == entityId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetByDateRangeAsync(DateTime from, DateTime to, int pageNumber = 1, int pageSize = 100)
        {
            return await _context.AuditLogs
                .Where(a => a.CreatedAt >= from && a.CreatedAt <= to)
                .OrderByDescending(a => a.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetByActionAsync(string action, int pageNumber = 1, int pageSize = 20)
        {
            return await _context.AuditLogs
                .Where(a => a.Action == action)
                .OrderByDescending(a => a.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }
    }
}
