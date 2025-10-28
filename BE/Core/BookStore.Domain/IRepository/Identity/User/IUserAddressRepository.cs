using BookStore.Domain.Entities.Identity;

namespace BookStore.Domain.IRepository.Identity.User
{
    public interface IUserAddressRepository : IGenericRepository<UserAddress>
    {
        Task<IEnumerable<UserAddress>> GetByUserIdAsync(Guid userId);

        Task<UserAddress?> GetDefaultAddressByUserIdAsync(Guid userId);

        Task SetDefaultAddressAsync(Guid addressId, Guid userId);
    }
}
