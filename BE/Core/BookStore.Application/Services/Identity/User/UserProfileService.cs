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
    public class UserProfileService : IUserProfileService
    {
        private readonly IUserProfileRepository _userProfileRepository;
        private readonly IUserRepository _userRepository;

        public UserProfileService(
            IUserProfileRepository userProfileRepository, 
            IUserRepository userRepository)
        {
            _userProfileRepository = userProfileRepository;
            _userRepository = userRepository;
        }

        /// <summary>
        /// Lấy thông tin profile của user theo userId
        /// </summary>
        public async Task<UserProfileDto?> GetUserProfileByUserIdAsync(Guid userId)
        {
            // Kiểm tra user có tồn tại không
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User không tồn tại");
            }

            // Lấy profile
            var userProfile = await _userProfileRepository.GetByUserIdAsync(userId);
            
            return userProfile?.ToDto();
        }

        /// <summary>
        /// Tạo mới profile cho user (được gọi khi đăng ký user)
        /// </summary>
        public async Task<UserProfileDto> CreateUserProfileAsync(Guid userId, CreateUserProfileDto dto)
        {
            // Kiểm tra user có tồn tại không
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User không tồn tại");
            }

            // Kiểm tra profile đã tồn tại chưa
            var existingProfile = await _userProfileRepository.GetByUserIdAsync(userId);
            if (existingProfile != null)
            {
                throw new InvalidOperationException("User đã có profile");
            }

            // Tạo profile mới
            var userProfile = dto.ToEntity(userId);
            await _userProfileRepository.AddAsync(userProfile);
            await _userProfileRepository.SaveChangesAsync();

            return userProfile.ToDto();
        }

        /// <summary>
        /// Cập nhật thông tin profile của user
        /// Nếu chưa có profile thì tạo mới
        /// </summary>
        public async Task<UserProfileDto?> UpdateUserProfileAsync(Guid userId, UpdateUserProfileDto dto)
        {
            // Kiểm tra user có tồn tại không
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User không tồn tại");
            }

            // Lấy profile hiện tại
            var userProfile = await _userProfileRepository.GetByUserIdAsync(userId);

            if (userProfile == null)
            {
                // Nếu chưa có profile thì tạo mới từ UpdateDto
                userProfile = dto.ToEntity(userId);
                await _userProfileRepository.AddAsync(userProfile);
            }
            else
            {
                // Nếu đã có profile thì cập nhật
                userProfile.UpdateFromDto(dto);
                _userProfileRepository.Update(userProfile);
            }

            await _userProfileRepository.SaveChangesAsync();
            return userProfile.ToDto();
        }
    }
}
