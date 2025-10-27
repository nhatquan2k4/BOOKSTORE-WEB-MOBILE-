using BookStore.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.IRepository.Identity.User
{
    public interface IUserRoleRepository : IGenericRepository<UserRole>
    {
        Task<IEnumerable<UserRole>> GetByUserIdAsync(Guid userId);
        Task<IEnumerable<UserRole>> GetByRoleIdAsync(Guid roleId);
        Task AddRangeAsync(IEnumerable<UserRole> userRoles);
        Task RemoveAllByUserIdAsync(Guid userId);
        Task<bool> ExistsAsync(Guid userId, Guid roleId);
    }
}
