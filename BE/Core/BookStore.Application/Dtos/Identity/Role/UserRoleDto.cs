namespace BookStore.Application.Dtos.Identity.Role
{
    public class UserRoleDto
    {
        public Guid UserId { get; set; }
        public string UserEmail { get; set; } = null!;
        public string UserFullName { get; set; } = null!;
        public Guid RoleId { get; set; }
        public string RoleName { get; set; } = null!;
    }

    public class UserWithRolesDto
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public List<RoleSummaryDto> Roles { get; set; } = new();
    }

    public class RoleWithUsersDto
    {
        public Guid RoleId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public List<UserSummaryForRoleDto> Users { get; set; } = new();
    }

    public class UserSummaryForRoleDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = null!;
        public string FullName { get; set; } = null!;
    }
}