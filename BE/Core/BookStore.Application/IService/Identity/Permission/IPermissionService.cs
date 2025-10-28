using BookStore.Application.Dtos.Identity.Permission;
using BookStore.Application.IService;

namespace BookStore.Application.IService.Identity.Permission
{
    public interface IPermissionService : IGenericService<PermissionDto, CreatePermissionDto, UpdatePermissionDto>
    {
        Task<PermissionDto?> GetPermissionByNameAsync(string name);
        Task<IEnumerable<PermissionDto>> GetPermissionsByRoleIdAsync(Guid roleId);
        Task<IEnumerable<PermissionDto>> GetPermissionsByUserIdAsync(Guid userId);
        Task<bool> PermissionNameExistsAsync(string name);
    }
}
