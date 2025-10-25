namespace BookStore.Application.Dtos.Identity.Permission
{
    public class PermissionSummaryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string Module { get; set; } = null!;
        public string Action { get; set; } = null!;
        public string Resource { get; set; } = null!;
        public bool IsActive { get; set; }
        public int RoleCount { get; set; }
    }
}