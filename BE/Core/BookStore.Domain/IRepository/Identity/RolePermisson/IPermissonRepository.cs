using BookStore.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.IRepository.Identity.RolePermisson
{
    public interface IPermissionRepository : IGenericRepository<Permission>
    {
        Task<Permission?> GetByNameAsync(string name);
        Task<IEnumerable<Permission>> GetPermissionsByRoleIdAsync(Guid roleId);
        Task<IEnumerable<Permission>> GetPermissionsByUserIdAsync(Guid userId);
        Task<bool> ExistsByNameAsync(string name);
    }
}
