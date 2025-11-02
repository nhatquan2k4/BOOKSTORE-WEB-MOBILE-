using BookStore.Application.Dtos.Identity.Permission;
using BookStore.Domain.Entities.Identity;

namespace BookStore.Application.Mappers.Identity.RolePermission
{
    
    /// Mapper thủ công cho Permission entity và các Permission DTOs
    
    public static class PermissionMapper
    {
        #region Permission -> PermissionDto

        
        /// Chuyển từ Permission entity sang PermissionDto
        
        public static PermissionDto ToDto(this Permission permission)
        {
            if (permission == null) return null!;

            return new PermissionDto
            {
                Id = permission.Id,
                Name = permission.Name,
                Description = permission.Description,
                
                
                // Lấy danh sách tên roles có permission này
                Roles = permission.RolePermissions?
                    .Select(rp => rp.Role?.Name)
                    .Where(name => name != null)
                    .ToList() ?? new List<string>()
            };
        }

        
        /// Chuyển danh sách Permission sang danh sách PermissionDto
        
        public static List<PermissionDto> ToDtoList(this IEnumerable<Permission> permissions)
        {
            return permissions?.Select(p => p.ToDto()).ToList() ?? new List<PermissionDto>();
        }

        #endregion

        #region Permission -> PermissionSummaryDto

        
        /// Chuyển Permission entity sang PermissionSummaryDto (thông tin tóm tắt)
        
        public static PermissionSummaryDto ToSummaryDto(this Permission permission)
        {
            if (permission == null) return null!;

            return new PermissionSummaryDto
            {
                Id = permission.Id,
                Name = permission.Name,
                Description = permission.Description,
                
                // Đếm số role có permission này
                RoleCount = permission.RolePermissions?.Count ?? 0
            };
        }

        
        /// Chuyển danh sách Permission sang danh sách PermissionSummaryDto
        
        public static List<PermissionSummaryDto> ToSummaryDtoList(this IEnumerable<Permission> permissions)
        {
            return permissions?.Select(p => p.ToSummaryDto()).ToList() ?? new List<PermissionSummaryDto>();
        }

        #endregion

        #region CreatePermissionDto -> Permission

        
        /// Chuyển từ CreatePermissionDto sang Permission entity
        /// Lưu ý: Entity chỉ có Id, Name, Description
        
        public static Permission ToEntity(this CreatePermissionDto dto)
        {
            if (dto == null) return null!;

            return new Permission
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description ?? string.Empty
                
            };
        }

        #endregion

        #region UpdatePermissionDto -> Permission

        
        /// Cập nhật Permission entity từ UpdatePermissionDto
        /// Chỉ update các field có trong Entity
        
        public static void UpdateFromDto(this Permission permission, UpdatePermissionDto dto)
        {
            if (permission == null || dto == null) return;

            // Update các field có trong Entity
            if (!string.IsNullOrWhiteSpace(dto.Name))
            {
                permission.Name = dto.Name;
            }

            if (dto.Description != null)
            {
                permission.Description = dto.Description;
            }

            
        }

        #endregion
    }
}
