using BookStore.Application.Dtos.Identity.User;
using BookStore.Application.IService.Identity.User;
using BookStore.Application.Mappers.Identity.User;
using BookStore.Domain.Entities.Identity;
using BookStore.Domain.IRepository.Identity.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Application.Services.Identity.User
{
    public class UserAddressService : IUserAddressService
    {
        private readonly IUserAddressRepository _userAddressRepository;
        private readonly IUserRepository _userRepository;

        public UserAddressService(
            IUserAddressRepository userAddressRepository,
            IUserRepository userRepository)
        {
            _userAddressRepository = userAddressRepository;
            _userRepository = userRepository;
        }

        /// <summary>
        /// Lấy tất cả địa chỉ của user
        /// </summary>
        public async Task<IEnumerable<UserAddressDto>> GetAddressesByUserIdAsync(Guid userId)
        {
            // Kiểm tra user có tồn tại không
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User không tồn tại");
            }

            var addresses = await _userAddressRepository.GetByUserIdAsync(userId);
            return addresses.ToDtoList();
        }

        /// <summary>
        /// Lấy địa chỉ theo ID
        /// </summary>
        public async Task<UserAddressDto?> GetAddressByIdAsync(Guid addressId)
        {
            var address = await _userAddressRepository.GetByIdAsync(addressId);
            return address?.ToDto();
        }

        /// <summary>
        /// Lấy địa chỉ mặc định của user
        /// </summary>
        public async Task<UserAddressDto?> GetDefaultAddressAsync(Guid userId)
        {
            // Kiểm tra user có tồn tại không
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User không tồn tại");
            }

            var defaultAddress = await _userAddressRepository.GetDefaultAddressByUserIdAsync(userId);
            return defaultAddress?.ToDto();
        }

        /// <summary>
        /// Thêm địa chỉ mới cho user
        /// </summary>
        public async Task<UserAddressDto> AddAddressAsync(Guid userId, CreateUserAddressDto dto)
        {
            // Kiểm tra user có tồn tại không
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User không tồn tại");
            }

            // Nếu đặt làm địa chỉ mặc định
            if (dto.IsDefault)
            {
                // Kiểm tra xem user đã có địa chỉ mặc định chưa
                var existingDefaultAddress = await _userAddressRepository.GetDefaultAddressByUserIdAsync(userId);
                if (existingDefaultAddress != null)
                {
                    // Bỏ default của địa chỉ cũ
                    existingDefaultAddress.IsDefault = false;
                    _userAddressRepository.Update(existingDefaultAddress);
                }
            }
            else
            {
                // Nếu chưa có địa chỉ nào, tự động đặt địa chỉ đầu tiên làm mặc định
                var userAddresses = await _userAddressRepository.GetByUserIdAsync(userId);
                if (!userAddresses.Any())
                {
                    dto.IsDefault = true;
                }
            }

            // Tạo địa chỉ mới
            var newAddress = dto.ToEntity(userId);
            await _userAddressRepository.AddAsync(newAddress);
            await _userAddressRepository.SaveChangesAsync();

            return newAddress.ToDto();
        }

        /// <summary>
        /// Cập nhật địa chỉ
        /// </summary>
        public async Task<UserAddressDto?> UpdateAddressAsync(Guid userId, Guid addressId, UpdateUserAddressDto dto)
        {
            // Kiểm tra user có tồn tại không
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User không tồn tại");
            }

            // Lấy địa chỉ cần update
            var address = await _userAddressRepository.GetByIdAsync(addressId);
            if (address == null || address.UserId != userId)
            {
                return null; // Không tìm thấy hoặc không thuộc user này
            }

            // Nếu muốn đặt làm địa chỉ mặc định
            if (dto.IsDefault.HasValue && dto.IsDefault.Value)
            {
                // Bỏ default của các địa chỉ khác
                var existingDefaultAddress = await _userAddressRepository.GetDefaultAddressByUserIdAsync(userId);
                if (existingDefaultAddress != null && existingDefaultAddress.Id != addressId)
                {
                    existingDefaultAddress.IsDefault = false;
                    _userAddressRepository.Update(existingDefaultAddress);
                }
            }

            // Cập nhật thông tin địa chỉ
            address.UpdateFromDto(dto);
            _userAddressRepository.Update(address);
            await _userAddressRepository.SaveChangesAsync();

            return address.ToDto();
        }

        /// <summary>
        /// Xóa địa chỉ
        /// </summary>
        public async Task<bool> DeleteAddressAsync(Guid userId, Guid addressId)
        {
            // Kiểm tra user có tồn tại không
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User không tồn tại");
            }

            // Lấy địa chỉ cần xóa
            var address = await _userAddressRepository.GetByIdAsync(addressId);
            if (address == null || address.UserId != userId)
            {
                return false; // Không tìm thấy hoặc không thuộc user này
            }

            bool wasDefault = address.IsDefault;

            // Xóa địa chỉ
            _userAddressRepository.Delete(address);
            await _userAddressRepository.SaveChangesAsync();

            // Nếu xóa địa chỉ mặc định, tự động đặt địa chỉ đầu tiên còn lại làm mặc định
            if (wasDefault)
            {
                var remainingAddresses = await _userAddressRepository.GetByUserIdAsync(userId);
                var firstAddress = remainingAddresses.FirstOrDefault();
                if (firstAddress != null)
                {
                    firstAddress.IsDefault = true;
                    _userAddressRepository.Update(firstAddress);
                    await _userAddressRepository.SaveChangesAsync();
                }
            }

            return true;
        }

        /// <summary>
        /// Đặt địa chỉ làm mặc định
        /// </summary>
        public async Task<bool> SetDefaultAddressAsync(Guid userId, Guid addressId)
        {
            // Kiểm tra user có tồn tại không
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User không tồn tại");
            }

            // Lấy địa chỉ cần đặt làm mặc định
            var address = await _userAddressRepository.GetByIdAsync(addressId);
            if (address == null || address.UserId != userId)
            {
                return false; // Không tìm thấy hoặc không thuộc user này
            }

            // Nếu đã là địa chỉ mặc định rồi thì không cần làm gì
            if (address.IsDefault)
            {
                return true;
            }

            // Bỏ default của địa chỉ cũ
            var existingDefaultAddress = await _userAddressRepository.GetDefaultAddressByUserIdAsync(userId);
            if (existingDefaultAddress != null)
            {
                existingDefaultAddress.IsDefault = false;
                _userAddressRepository.Update(existingDefaultAddress);
            }

            // Đặt địa chỉ mới làm mặc định
            address.IsDefault = true;
            _userAddressRepository.Update(address);
            await _userAddressRepository.SaveChangesAsync();

            return true;
        }
    }
}
