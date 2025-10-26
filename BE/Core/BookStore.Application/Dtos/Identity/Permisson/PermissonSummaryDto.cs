namespace BookStore.Application.Dtos.Identity.Permission
{
    public class PermissionSummaryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int RoleCount { get; set; }
    }
}