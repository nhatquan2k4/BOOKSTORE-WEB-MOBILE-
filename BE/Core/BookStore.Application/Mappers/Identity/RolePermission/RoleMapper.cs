using BookStore.Application.Dtos.Identity.Role;
using BookStore.Domain.Entities.Identity;

namespace BookStore.Application.Mappers.Identity.RolePermission
{
    /// <summary>
    /// Mapper thủ công cho Role entity và các Role DTOs
    /// </summary>
    public static class RoleMapper
    {
        #region Role -> RoleDto

        /// Chuyển từ Role entity sang RoleDto
        public static RoleDto ToDto(this Role role)
        {
            if (role == null) return null!;

            return new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                
                // Map permissions từ RolePermissions
                PermissionDtos = role.RolePermissions?
                    .Select(rp => new PermissionDto
                    {
                        Id = rp.Permission.Id,
                        Name = rp.Permission.Name,
                        Description = rp.Permission.Description,
                    })
                    .ToList() ?? new List<PermissionDto>(),
                
                // Đếm số user có role này
                UserCount = role.UserRoles?.Count ?? 0
            };
        }

        /// Chuyển danh sách Role sang danh sách RoleDto
        public static List<RoleDto> ToDtoList(this IEnumerable<Role> roles)
        {
            return roles?.Select(r => r.ToDto()).ToList() ?? new List<RoleDto>();
        }

        #endregion

        #region Role -> RoleSummaryDto

        /// Chuyển Role entity sang RoleSummaryDto (thông tin tóm tắt)
        public static RoleSummaryDto ToSummaryDto(this Role role)
        {
            if (role == null) return null!;

            return new RoleSummaryDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                UserCount = role.UserRoles?.Count ?? 0,
                PermissionCount = role.RolePermissions?.Count ?? 0
            };
        }

        /// Chuyển danh sách Role sang danh sách RoleSummaryDto
        public static List<RoleSummaryDto> ToSummaryDtoList(this IEnumerable<Role> roles)
        {
            return roles?.Select(r => r.ToSummaryDto()).ToList() ?? new List<RoleSummaryDto>();
        }

        #endregion

        #region Role -> RoleWithPermissionsDto

        /// Chuyển Role entity sang RoleWithPermissionsDto (bao gồm chi tiết permissions)
        public static RoleWithPermissionsDto ToRoleWithPermissionsDto(this Role role)
        {
            if (role == null) return null!;

            return new RoleWithPermissionsDto
            {
                RoleId = role.Id,
                Name = role.Name,
                Description = role.Description,
                
                // Map permissions với thông tin chi tiết
                Permissions = role.RolePermissions?
                    .Select(rp => new BookStore.Application.Dtos.Identity.Role.PermissionSummaryDto
                    {
                        Id = rp.Permission.Id,
                        Name = rp.Permission.Name,
                        Description = rp.Permission.Description
                    })
                    .ToList() ?? new List<BookStore.Application.Dtos.Identity.Role.PermissionSummaryDto>()
            };
        }

        #endregion

        #region CreateRoleDto -> Role

        /// Chuyển từ CreateRoleDto sang Role entity
        /// Lưu ý: PermissionIds sẽ được xử lý riêng ở service layer
        public static Role ToEntity(this CreateRoleDto dto)
        {
            if (dto == null) return null!;

            return new Role
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description ?? string.Empty
                
                
            };
        }

        #endregion

        #region UpdateRoleDto -> Role

        /// Cập nhật Role entity từ UpdateRoleDto
        /// Chỉ update các field có trong Entity
        public static void UpdateFromDto(this Role role, UpdateRoleDto dto)
        {
            if (role == null || dto == null) return;

            // Update các field có trong Entity
            if (!string.IsNullOrWhiteSpace(dto.Name))
            {
                role.Name = dto.Name;
            }

            if (dto.Description != null)
            {
                role.Description = dto.Description;
            }

            
        }

        #endregion
    }
}
