using BookStore.Application.DTO.Analytics;
using BookStore.Domain.Entities.Analytics___Activity;

namespace BookStore.Application.Mappers.Analytics
{
    public static class AuditLogMapper
    {
        public static AuditLogDto ToDto(this AuditLog auditLog)
        {
            return new AuditLogDto
            {
                Id = auditLog.Id,
                AdminId = auditLog.AdminId,
                Action = auditLog.Action,
                EntityName = auditLog.EntityName,
                EntityId = auditLog.EntityId,
                Description = auditLog.Description,
                OldValues = auditLog.OldValues,
                NewValues = auditLog.NewValues,
                CreatedAt = auditLog.CreatedAt,
                IpAddress = auditLog.IpAddress
            };
        }

        public static IEnumerable<AuditLogDto> ToDtoList(this IEnumerable<AuditLog> auditLogs)
        {
            return auditLogs.Select(auditLog => auditLog.ToDto());
        }
    }
}
