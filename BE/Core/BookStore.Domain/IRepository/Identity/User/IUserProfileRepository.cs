using BookStore.Domain.Entities.Identity;

namespace BookStore.Domain.IRepository.Identity.User
{
    public interface IUserProfileRepository : IGenericRepository<UserProfile>
    {
        Task<UserProfile?> GetByUserIdAsync(Guid userId);

        Task<bool> ExistsByUserIdAsync(Guid userId);
    }
}
