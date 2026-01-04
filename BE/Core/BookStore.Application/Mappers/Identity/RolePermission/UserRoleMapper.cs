using BookStore.Application.Dtos.Identity.Role;
using BookStore.Domain.Entities.Identity;

namespace BookStore.Application.Mappers.Identity.RolePermission
{

    public static class UserRoleMapper
    {
        #region UserRole -> UserRoleDto

        /// Chuyển từ UserRole entity sang UserRoleDto
        public static UserRoleDto ToDto(this UserRole userRole)
        {
            if (userRole == null) return null!;

            return new UserRoleDto
            {
                UserId = userRole.UserId,
                UserEmail = userRole.User?.Email ?? string.Empty,
                UserFullName = userRole.User?.Profiles?.FullName ?? userRole.User?.Email ?? string.Empty,
                RoleId = userRole.RoleId,
                RoleName = userRole.Role?.Name ?? string.Empty
            };
        }

        /// Chuyển danh sách UserRole sang danh sách UserRoleDto
        public static List<UserRoleDto> ToDtoList(this IEnumerable<UserRole> userRoles)
        {
            return userRoles?.Select(ur => ur.ToDto()).ToList() ?? new List<UserRoleDto>();
        }

        #endregion

        #region User -> UserWithRolesDto

        /// Chuyển User entity sang UserWithRolesDto (user với danh sách roles)
        public static UserWithRolesDto ToUserWithRolesDto(this Domain.Entities.Identity.User user)
        {
            if (user == null) return null!;

            return new UserWithRolesDto
            {
                UserId = user.Id,
                Email = user.Email,
                FullName = user.Profiles?.FullName ?? user.Email,
                
                // Map roles từ UserRoles
                Roles = user.UserRoles?
                    .Select(ur => new RoleSummaryDto
                    {
                        Id = ur.Role.Id,
                        Name = ur.Role.Name,
                        Description = ur.Role.Description,
                        UserCount = ur.Role.UserRoles?.Count ?? 0,
                        PermissionCount = ur.Role.RolePermissions?.Count ?? 0
                    })
                    .ToList() ?? new List<RoleSummaryDto>()
            };
        }

        #endregion

        #region Role -> RoleWithUsersDto

        /// Chuyển Role entity sang RoleWithUsersDto (role với danh sách users)
        public static RoleWithUsersDto ToRoleWithUsersDto(this Role role)
        {
            if (role == null) return null!;

            return new RoleWithUsersDto
            {
                RoleId = role.Id,
                Name = role.Name,
                Description = role.Description,
                
                // Map users từ UserRoles
                Users = role.UserRoles?
                    .Select(ur => new UserSummaryForRoleDto
                    {
                        Id = ur.User.Id,
                        Email = ur.User.Email,
                        FullName = ur.User.Profiles?.FullName ?? ur.User.Email
                    })
                    .ToList() ?? new List<UserSummaryForRoleDto>()
            };
        }

        #endregion

        #region AssignRoleDto -> UserRole

        /// Chuyển từ AssignRoleDto sang danh sách UserRole entities
        /// Dùng khi: Gán nhiều roles cho một user
        public static List<UserRole> ToEntities(this AssignRoleDto dto)
        {
            if (dto == null || dto.RoleIds == null || !dto.RoleIds.Any())
                return new List<UserRole>();

            return dto.RoleIds.Select(roleId => new UserRole
            {
                UserId = dto.Id,
                RoleId = roleId
            }).ToList();
        }

        /// Tạo một UserRole entity từ UserId và RoleId
        /// Dùng khi: Gán một role cho một user
        public static UserRole ToEntity(Guid userId, Guid roleId)
        {
            return new UserRole
            {
                UserId = userId,
                RoleId = roleId
            };
        }

        #endregion

        #region Helper Methods

        /// Kiểm tra xem User có Role cụ thể không
        public static bool HasRole(this Domain.Entities.Identity.User user, Guid roleId)
        {
            return user?.UserRoles?.Any(ur => ur.RoleId == roleId) ?? false;
        }

        /// Kiểm tra xem User có Role với tên cụ thể không
        public static bool HasRole(this Domain.Entities.Identity.User user, string roleName)
        {
            return user?.UserRoles?.Any(ur => ur.Role?.Name == roleName) ?? false;
        }

        /// Lấy danh sách RoleIds của một User
        public static List<Guid> GetRoleIds(this Domain.Entities.Identity.User user)
        {
            return user?.UserRoles?.Select(ur => ur.RoleId).ToList() ?? new List<Guid>();
        }


        /// Lấy danh sách tên Roles của một User

        public static List<string> GetRoleNames(this Domain.Entities.Identity.User user)
        {
            return user?.UserRoles?
                .Select(ur => ur.Role?.Name)
                .Where(name => name != null)
                .ToList() ?? new List<string>();
        }

        #endregion
    }
}
