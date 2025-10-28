using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookStore.Domain.Entities.Identity;



namespace BookStore.Domain.IRepository.Identity.User
{
    public interface IUserRepository : IGenericRepository<Domain.Entities.Identity.User>
    {
        Task<Domain.Entities.Identity.User?> GetByEmailAsync(string email);
        Task<Domain.Entities.Identity.User?> GetByIdWithAllDetailsAsync(Guid id);

        Task<(IEnumerable<Domain.Entities.Identity.User> Users, int TotalCount)> GetPagedAsync(
            int pageNumber,
            int pageSize,
            string? searchTerm = null);

        Task<bool> ExistsByEmailAsync(string email);

        Task<Domain.Entities.Identity.User?> GetUserForAuthenticationAsync(string email);

        Task<IEnumerable<string>> GetUserPermissionNamesAsync(Guid userId);
    }


}
