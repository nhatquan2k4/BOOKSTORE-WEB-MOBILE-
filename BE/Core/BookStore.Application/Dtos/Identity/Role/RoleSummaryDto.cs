namespace BookStore.Application.Dtos.Identity.Role
{
    public class RoleSummaryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int UserCount { get; set; }
        public int PermissionCount { get; set; }
    }
}