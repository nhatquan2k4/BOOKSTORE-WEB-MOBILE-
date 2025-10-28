using BookStore.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.IRepository.Identity.User
{
    public interface IUserAddressRepository : IGenericRepository<UserAddress>
    {
        Task<IEnumerable<UserAddress>> GetByUserIdAsync(Guid userId);
        Task<UserAddress?> GetDefaultAddressByUserIdAsync(Guid userId);
        Task SetDefaultAddressAsync(Guid addressId, Guid userId);
    }
}
