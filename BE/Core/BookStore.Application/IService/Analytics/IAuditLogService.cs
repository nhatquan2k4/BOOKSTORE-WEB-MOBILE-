namespace BookStore.Application.IService.Analytics
{

    public interface IAuditLogService
    {

        Task LogActionAsync(Guid adminId, string action, string entityName, string entityId, 
            string description, string? oldValues = null, string? newValues = null, 
            string? ipAddress = null, string? userAgent = null);

        Task<IEnumerable<object>> GetAdminLogsAsync(Guid adminId, int pageNumber = 1, int pageSize = 20);

        Task<IEnumerable<object>> GetEntityLogsAsync(string entityName, string entityId);

        Task<IEnumerable<object>> GetLogsByDateRangeAsync(DateTime from, DateTime to, int pageNumber = 1, int pageSize = 100);
    }
}
