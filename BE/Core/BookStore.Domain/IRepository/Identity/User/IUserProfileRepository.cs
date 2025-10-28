using BookStore.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.IRepository.Identity.User
{
    public interface IUserProfileRepository : IGenericRepository<UserProfile>
    {
        Task<UserProfile?> GetByUserIdAsync(Guid userId);

        Task<bool> ExistsByUserIdAsync(Guid userId);
    }
}
