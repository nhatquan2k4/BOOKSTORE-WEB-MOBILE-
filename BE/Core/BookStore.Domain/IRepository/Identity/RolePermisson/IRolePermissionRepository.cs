using BookStore.Domain.Entities.Identity;

namespace BookStore.Domain.IRepository.Identity.RolePermisson
{
    public interface IRolePermissionRepository : IManyToManyRepository<RolePermission>
    {
        Task<IEnumerable<RolePermission>> GetByRoleIdAsync(Guid roleId);

        Task<IEnumerable<RolePermission>> GetByPermissionIdAsync(Guid permissionId);

        Task RemoveAllByRoleIdAsync(Guid roleId);

        // AddAsync, AddRangeAsync, RemoveAsync, ExistsAsync, SaveChangesAsync 
        // đã có trong IManyToManyRepository - không cần khai báo lại
    }
}
