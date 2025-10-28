using BookStore.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
