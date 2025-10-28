namespace BookStore.Application.Dtos.Identity.Permission
{
    public class AssignPermissionDto
    {
        public Guid RoleId { get; set; }
        public List<Guid> PermissionIds { get; set; } = new();
    }

    public class AssignPermissionResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = null!;
        public List<string> AssignedPermissions { get; set; } = new();
        public List<string> FailedPermissions { get; set; } = new();
    }

    public class RemovePermissionDto
    {
        public Guid RoleId { get; set; }
        public List<Guid> PermissionIds { get; set; } = new();
    }
}