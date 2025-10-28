using BookStore.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.IRepository.Identity.RolePermisson
{
    public interface IRoleRepository : IGenericRepository<Role>
    {
        Task<Role?> GetByNameAsync(string name);
        Task<Role?> GetByIdWithPermissionsAsync(Guid id);
        Task<IEnumerable<Role>> GetRolesByUserIdAsync(Guid userId);
        Task<bool> ExistsByNameAsync(string name);
        Task<(IEnumerable<Role>, int)> GetPagedAsync(int page, int size, string? search);
    }
}
