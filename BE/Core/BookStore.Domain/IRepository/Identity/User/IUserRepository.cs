using BookStore.Domain.Entities.Identity;

namespace BookStore.Domain.IRepository.Identity.User
{
    public interface IUserRepository : IGenericRepository<Domain.Entities.Identity.User>
    {
        // ============= Query Operations =============
        
        Task<Domain.Entities.Identity.User?> GetByEmailAsync(string email);

        Task<Domain.Entities.Identity.User?> GetByIdWithAllDetailsAsync(Guid id);

        Task<Domain.Entities.Identity.User?> GetUserWithRolesAndPermissionsAsync(string email);

        Task<(IEnumerable<Domain.Entities.Identity.User> Users, int TotalCount)> GetPagedAsync(
            int pageNumber,
            int pageSize,
            string? searchTerm = null);

        Task<IEnumerable<string>> GetUserPermissionNamesAsync(Guid userId);

        // ============= Check Existence =============
        
        Task<bool> ExistsByEmailAsync(string email);

        // ============= Authentication Operations =============
        
        Task<Domain.Entities.Identity.User?> AuthenticateAsync(string email, string passwordHash);

        Task<bool> VerifyEmailAsync(Guid userId);

        // ============= Password Management =============
        
        Task<bool> UpdatePasswordAsync(Guid userId, string newPasswordHash);

        // ============= Account Management =============
        
        Task<bool> LockUserAccountAsync(Guid userId);

        Task<bool> UnlockUserAccountAsync(Guid userId);
    }
}
