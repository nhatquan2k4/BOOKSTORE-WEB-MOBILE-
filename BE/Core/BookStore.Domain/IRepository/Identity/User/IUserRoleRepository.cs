using BookStore.Domain.Entities.Identity;

namespace BookStore.Domain.IRepository.Identity.User
{
    public interface IUserRoleRepository : IManyToManyRepository<UserRole>
    {
        Task<IEnumerable<UserRole>> GetByUserIdAsync(Guid userId);

        Task<IEnumerable<UserRole>> GetByRoleIdAsync(Guid roleId);

        Task RemoveAllByUserIdAsync(Guid userId);
        
        // ExistsAsync và AddRangeAsync đã có trong IManyToManyRepository
        // Không cần khai báo lại
    }
}
