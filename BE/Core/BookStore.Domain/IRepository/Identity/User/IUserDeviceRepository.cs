using BookStore.Domain.Entities.Identity;

namespace BookStore.Domain.IRepository.Identity.User
{
    public interface IUserDeviceRepository : IGenericRepository<UserDevice>
    {
        Task<IEnumerable<UserDevice>> GetByUserIdAsync(Guid userId);

        Task<UserDevice?> GetByDeviceNameAsync(Guid userId, string deviceName);

        Task UpdateLastLoginAsync(Guid deviceId, string ipAddress);
    }
}
