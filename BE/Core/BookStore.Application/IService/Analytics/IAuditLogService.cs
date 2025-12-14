namespace BookStore.Application.IService.Analytics
{
    /// <summary>
    /// Service for managing audit logs to track admin actions
    /// </summary>
    public interface IAuditLogService
    {
        /// <summary>
        /// Log an admin action with full details
        /// </summary>
        /// <param name="adminId">Admin user ID performing the action</param>
        /// <param name="action">Action type (e.g., "CREATE", "UPDATE", "DELETE")</param>
        /// <param name="entityName">Name of the entity affected (e.g., "Book", "Order")</param>
        /// <param name="entityId">ID of the affected entity</param>
        /// <param name="description">Human-readable description of the action</param>
        /// <param name="oldValues">JSON string of old values (for UPDATE/DELETE)</param>
        /// <param name="newValues">JSON string of new values (for CREATE/UPDATE)</param>
        /// <param name="ipAddress">IP address of the admin</param>
        /// <param name="userAgent">Browser/client user agent</param>
        Task LogActionAsync(Guid adminId, string action, string entityName, string entityId, 
            string description, string? oldValues = null, string? newValues = null, 
            string? ipAddress = null, string? userAgent = null);

        /// <summary>
        /// Get audit logs for a specific admin
        /// </summary>
        Task<IEnumerable<object>> GetAdminLogsAsync(Guid adminId, int pageNumber = 1, int pageSize = 20);

        /// <summary>
        /// Get audit logs for a specific entity
        /// </summary>
        Task<IEnumerable<object>> GetEntityLogsAsync(string entityName, string entityId);

        /// <summary>
        /// Get audit logs within a date range
        /// </summary>
        Task<IEnumerable<object>> GetLogsByDateRangeAsync(DateTime from, DateTime to, int pageNumber = 1, int pageSize = 100);
    }
}
