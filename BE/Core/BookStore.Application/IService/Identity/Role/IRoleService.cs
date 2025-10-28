using BookStore.Application.Dtos.Identity.Role;
using BookStore.Application.IService;

namespace BookStore.Application.IService.Identity.Role
{
    public interface IRoleService : IGenericService<RoleDto, CreateRoleDto, UpdateRoleDto>
    {
        Task<RoleDto?> GetRoleByNameAsync(string name);
        Task<RoleDto?> GetRoleWithPermissionsAsync(Guid roleId);
        Task<(IEnumerable<RoleSummaryDto> Roles, int TotalCount)> GetPagedRolesAsync(int page, int size, string? search = null);
        Task<bool> AssignPermissionsToRoleAsync(Guid roleId, List<Guid> permissionIds);
        Task<bool> RemovePermissionFromRoleAsync(Guid roleId, Guid permissionId);
        Task<IEnumerable<PermissionDto>> GetRolePermissionsAsync(Guid roleId);
        Task<bool> RoleNameExistsAsync(string name);
    }
}
