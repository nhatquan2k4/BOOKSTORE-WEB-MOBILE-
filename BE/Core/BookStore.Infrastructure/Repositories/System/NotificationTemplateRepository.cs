using BookStore.Domain.Entities.System;
using BookStore.Domain.IRepository.System;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.System
{
    public class NotificationTemplateRepository : GenericRepository<NotificationTemplate>, INotificationTemplateRepository
    {
        public NotificationTemplateRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<NotificationTemplate?> GetByCodeAsync(string code)
        {
            return await _context.Set<NotificationTemplate>()
                .FirstOrDefaultAsync(t => t.Code == code);
        }

        public async Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null)
        {
            var query = _context.Set<NotificationTemplate>()
                .Where(t => t.Code == code);

            if (excludeId.HasValue)
            {
                query = query.Where(t => t.Id != excludeId.Value);
            }

            return !await query.AnyAsync();
        }

        public async Task<(IEnumerable<NotificationTemplate> Templates, int TotalCount)> GetTemplatesAsync(
            int page, 
            int pageSize, 
            string? code = null, 
            bool? isActive = null, 
            string? searchTerm = null)
        {
            var query = _context.Set<NotificationTemplate>().AsQueryable();

            // Filter by code
            if (!string.IsNullOrWhiteSpace(code))
            {
                query = query.Where(t => t.Code.Contains(code));
            }

            // Filter by active status
            if (isActive.HasValue)
            {
                query = query.Where(t => t.IsActive == isActive.Value);
            }

            // Search in code, subject, description
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var search = searchTerm.ToLower();
                query = query.Where(t => 
                    t.Code.ToLower().Contains(search) ||
                    t.Subject.ToLower().Contains(search) ||
                    (t.Description != null && t.Description.ToLower().Contains(search)));
            }

            var totalCount = await query.CountAsync();

            var templates = await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (templates, totalCount);
        }

        public async Task<IEnumerable<NotificationTemplate>> GetActiveTemplatesAsync()
        {
            return await _context.Set<NotificationTemplate>()
                .Where(t => t.IsActive)
                .OrderBy(t => t.Code)
                .ToListAsync();
        }
    }
}
