namespace BookStore.Application.Dtos.Identity.Role
{
    public class RolePermissionDto
    {
        public Guid RoleId { get; set; }
        public string RoleName { get; set; } = null!;
        public Guid PermissionId { get; set; }
        public string PermissionName { get; set; } = null!;
    }

    public class AssignPermissionToRoleDto
    {
        public Guid RoleId { get; set; }
        public List<Guid> PermissionIds { get; set; } = new();
    }

    public class RemovePermissionFromRoleDto
    {
        public Guid RoleId { get; set; }
        public List<Guid> PermissionIds { get; set; } = new();
    }

    public class RoleWithPermissionsDto
    {
        public Guid RoleId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public List<PermissionSummaryDto> Permissions { get; set; } = new();
    }

    public class PermissionSummaryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
    }
}