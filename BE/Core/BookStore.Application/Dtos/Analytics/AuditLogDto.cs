namespace BookStore.Application.DTO.Analytics
{
    public class AuditLogDto
    {
        public Guid Id { get; set; }
        public Guid? AdminId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string? EntityName { get; set; }
        public string? EntityId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? IpAddress { get; set; }
    }
}
