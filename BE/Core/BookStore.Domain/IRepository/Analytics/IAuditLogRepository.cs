using BookStore.Domain.Entities.Analytics___Activity;

namespace BookStore.Domain.IRepository.Analytics
{
    public interface IAuditLogRepository : IGenericRepository<AuditLog>
    {
        Task<IEnumerable<AuditLog>> GetByAdminIdAsync(Guid adminId, int pageNumber = 1, int pageSize = 20);
        Task<IEnumerable<AuditLog>> GetByEntityAsync(string entityName, string entityId);
        Task<IEnumerable<AuditLog>> GetByDateRangeAsync(DateTime from, DateTime to, int pageNumber = 1, int pageSize = 100);
        Task<IEnumerable<AuditLog>> GetByActionAsync(string action, int pageNumber = 1, int pageSize = 20);
    }
}
