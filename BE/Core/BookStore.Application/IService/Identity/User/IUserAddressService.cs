using BookStore.Application.Dtos.Identity.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Application.IService.Identity.User
{
    public interface IUserAddressService
    {
        Task<IEnumerable<UserAddressDto>> GetAddressesByUserIdAsync(Guid userId);
        Task<UserAddressDto?> GetAddressByIdAsync(Guid addressId);
        Task<UserAddressDto?> GetDefaultAddressAsync(Guid userId);
        Task<UserAddressDto> AddAddressAsync(Guid userId, CreateUserAddressDto dto);
        Task<UserAddressDto?> UpdateAddressAsync(Guid userId, Guid addressId, UpdateUserAddressDto dto);
        Task<bool> DeleteAddressAsync(Guid userId, Guid addressId);
        Task<bool> SetDefaultAddressAsync(Guid userId, Guid addressId);


    }
}
