using BookStore.Application.Dtos.Identity.Permission;
using BookStore.Application.Dtos.Identity.Role;
using BookStore.Domain.Entities.Identity;

namespace BookStore.Application.Mappers.Identity.RolePermission
{
    /// Mapper thủ công cho RolePermission entity và RolePermissionDto
    public static class RolePermissionMapper
    {
        #region RolePermission -> RolePermissionDto

        /// Chuyển từ RolePermission entity sang RolePermissionDto
        public static RolePermissionDto ToDto(this Domain.Entities.Identity.RolePermission rolePermission)
        {
            if (rolePermission == null) return null!;

            return new RolePermissionDto
            {
                RoleId = rolePermission.RoleId,
                RoleName = rolePermission.Role?.Name ?? string.Empty,
                PermissionId = rolePermission.PermissionId,
                PermissionName = rolePermission.Permission?.Name ?? string.Empty
            };
        }

        /// Chuyển danh sách RolePermission sang danh sách RolePermissionDto
        public static List<RolePermissionDto> ToDtoList(this IEnumerable<Domain.Entities.Identity.RolePermission> rolePermissions)
        {
            return rolePermissions?.Select(rp => rp.ToDto()).ToList() ?? new List<RolePermissionDto>();
        }

        #endregion

        #region AssignPermissionDto -> RolePermission


        /// Chuyển từ AssignPermissionDto sang danh sách RolePermission entities
        /// Dùng khi: Gán nhiều permissions cho một role
        public static List<Domain.Entities.Identity.RolePermission> ToEntities(this AssignPermissionDto dto)
        {
            if (dto == null || dto.PermissionIds == null || !dto.PermissionIds.Any())
                return new List<Domain.Entities.Identity.RolePermission>();

            return dto.PermissionIds.Select(permissionId => new Domain.Entities.Identity.RolePermission
            {
                RoleId = dto.RoleId,
                PermissionId = permissionId
            }).ToList();
        }

        /// Tạo một RolePermission entity từ RoleId và PermissionId
        /// Dùng khi: Gán một permission cho một role
        public static Domain.Entities.Identity.RolePermission ToEntity(Guid roleId, Guid permissionId)
        {
            return new Domain.Entities.Identity.RolePermission
            {
                RoleId = roleId,
                PermissionId = permissionId
            };
        }

        #endregion

        #region Helper Methods

        /// Kiểm tra xem Role có Permission cụ thể không
        public static bool HasPermission(this Role role, Guid permissionId)
        {
            return role?.RolePermissions?.Any(rp => rp.PermissionId == permissionId) ?? false;
        }

        /// Lấy danh sách PermissionIds của một Role
        public static List<Guid> GetPermissionIds(this Role role)
        {
            return role?.RolePermissions?.Select(rp => rp.PermissionId).ToList() ?? new List<Guid>();
        }

        #endregion
    }
}
