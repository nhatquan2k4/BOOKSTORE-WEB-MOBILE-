using BookStore.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Interfaces.Identity.User
{
    public interface IUserDeviceRepository : IGenericRepository<UserDevice>
    {
        Task<IEnumerable<UserDevice>> GetByUserIdAsync(Guid userId);
        Task<UserDevice?> GetByDeviceNameAsync(Guid userId, string deviceName);
        Task UpdateLastLoginAsync(Guid deviceId, string ipAddress);
    }
}
