using BookStore.Application.IService.Analytics;
using BookStore.Domain.Entities.Analytics___Activity;
using BookStore.Domain.IRepository.Analytics;

namespace BookStore.Application.Service.Analytics
{
    public class AuditLogService : IAuditLogService
    {
        private readonly IAuditLogRepository _auditLogRepository;

        public AuditLogService(IAuditLogRepository auditLogRepository)
        {
            _auditLogRepository = auditLogRepository;
        }

        public async Task LogActionAsync(Guid adminId, string action, string entityName, string entityId, 
            string description, string? oldValues = null, string? newValues = null, 
            string? ipAddress = null, string? userAgent = null)
        {
            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                AdminId = adminId,
                Action = action,
                EntityName = entityName,
                EntityId = entityId,
                Description = description,
                OldValues = oldValues,
                NewValues = newValues,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                CreatedAt = DateTime.UtcNow
            };

            await _auditLogRepository.AddAsync(auditLog);
            await _auditLogRepository.SaveChangesAsync();
        }

        public async Task<IEnumerable<object>> GetAdminLogsAsync(Guid adminId, int pageNumber = 1, int pageSize = 20)
        {
            var logs = await _auditLogRepository.GetByAdminIdAsync(adminId, pageNumber, pageSize);
            return logs.Select(l => new
            {
                l.Id,
                l.Action,
                l.EntityName,
                l.EntityId,
                l.Description,
                l.CreatedAt,
                l.IpAddress
            });
        }

        public async Task<IEnumerable<object>> GetEntityLogsAsync(string entityName, string entityId)
        {
            var logs = await _auditLogRepository.GetByEntityAsync(entityName, entityId);
            return logs.Select(l => new
            {
                l.Id,
                l.AdminId,
                l.Action,
                l.Description,
                l.OldValues,
                l.NewValues,
                l.CreatedAt,
                l.IpAddress
            });
        }

        public async Task<IEnumerable<object>> GetLogsByDateRangeAsync(DateTime from, DateTime to, int pageNumber = 1, int pageSize = 100)
        {
            var logs = await _auditLogRepository.GetByDateRangeAsync(from, to, pageNumber, pageSize);
            return logs.Select(l => new
            {
                l.Id,
                l.AdminId,
                l.Action,
                l.EntityName,
                l.EntityId,
                l.Description,
                l.CreatedAt
            });
        }
    }
}
