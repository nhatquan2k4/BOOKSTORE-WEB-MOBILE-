using BookStore.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.IRepository.Identity.RolePermisson
{
    public interface IRolePermissionRepository
    {
        Task<IEnumerable<RolePermission>> GetByRoleIdAsync(Guid roleId);
        Task<IEnumerable<RolePermission>> GetByPermissionIdAsync(Guid permissionId);
        Task AddAsync(RolePermission rolePermission);
        Task AddRangeAsync(IEnumerable<RolePermission> rolePermissions);
        Task RemoveAsync(Guid roleId, Guid permissionId);
        Task RemoveAllByRoleIdAsync(Guid roleId);
        Task<bool> ExistsAsync(Guid roleId, Guid permissionId);
        Task SaveChangesAsync();
    }
}
