namespace BookStore.Application.Dtos.Identity.Permission
{
    public class CheckPermissionDto
    {
        public Guid UserId { get; set; }
        public string PermissionName { get; set; } = null!;
        public string? Resource { get; set; }
    }

    public class CheckPermissionResponseDto
    {
        public bool HasPermission { get; set; }
        public string Message { get; set; } = null!;
        public List<string> UserRoles { get; set; } = new();
        public List<string> UserPermissions { get; set; } = new();
    }

    public class UserPermissionDto
    {
        public Guid UserId { get; set; }
        public string UserEmail { get; set; } = null!;
        public List<PermissionSummaryDto> Permissions { get; set; } = new();
        public Dictionary<string, List<string>> PermissionsByModule { get; set; } = new();
    }
}