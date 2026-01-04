using BookStore.Application.Dtos.Identity.User;
using BookStore.Domain.Entities.Identity;


namespace BookStore.Application.Mappers.Identity.User
{

    public static class UserMapper
    {
        #region User -> UserDto
        

        /// Dùng khi: Trả về thông tin user cho client
        public static UserDto ToDto(this Domain.Entities.Identity.User user)
        {
            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                IsActive = user.IsActive,
                CreateAt = user.CreateAt,
                UpdatedAt = user.UpdatedAt,
                
                // Map UserProfile nếu có
                Profiles = user.Profiles?.ToDto(),
                
                // Map danh sách UserAddresses nếu có
                Addresses = user.Addresses?.Select(a => a.ToDto()).ToList() ?? new List<UserAddressDto>(),
                
                // Map danh sách UserRoles nếu có (chỉ lấy tên role)
                Roles = user.UserRoles?.Select(ur => ur.Role?.Name).Where(n => n != null).ToList() ?? new List<string>(),
                
                // Map danh sách UserDevices nếu có
                Devices = user.Devices?.Select(d => d.ToDto()).ToList() ?? new List<UserDeviceDto>()
            };
        }

        /// Chuyển User sang UserDto (chỉ thông tin cơ bản, không load relationships)
        /// Dùng khi: Không cần thông tin chi tiết, tăng hiệu suất
        public static UserDto ToBasicDto(this Domain.Entities.Identity.User user)
        {
            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                IsActive = user.IsActive,
                CreateAt = user.CreateAt,
                UpdatedAt = user.UpdatedAt,
                Profiles = null,
                Addresses = new List<UserAddressDto>(),
                Roles = new List<string>(),
                Devices = new List<UserDeviceDto>()
            };
        }

        /// Chuyển danh sách User entities sang danh sách UserDto
        public static List<UserDto> ToDtoList(this IEnumerable<Domain.Entities.Identity.User> users)
        {
            return users?.Select(u => u.ToDto()).ToList() ?? new List<UserDto>();
        }

        #endregion

        #region CreateUserDto -> User

        /// Chuyển từ CreateUserDto sang User entity
        /// Dùng khi: Tạo user mới từ request
        /// Lưu ý: Password cần được hash trước khi lưu (xử lý ở service layer)
        public static Domain.Entities.Identity.User ToEntity(this CreateUserDto dto)
        {
            if (dto == null) return null;

            var user = new Domain.Entities.Identity.User
            {
                Id = Guid.NewGuid(),
                Email = dto.Email,
                IsActive = dto.IsActive,
                CreateAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                //PasswordHash sẽ được set ở service layer sau khi hash

            };

            // Map UserProfile nếu có trong CreateDto
            if (dto.Profile != null)
            {
                user.Profiles = new UserProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    FullName = dto.Profile.FullName,
                    DateOfBirth = dto.Profile.DateOfBirth,
                    Gender = dto.Profile.Gender,
                    PhoneNumber = dto.Profile.PhoneNumber,
                    Bio = dto.Profile.Bio
                };
            }

            return user;
        }

        #endregion

        #region UpdateUserDto -> User

        /// Cập nhật User entity từ UpdateUserDto
        /// Dùng khi: Update thông tin user
        /// Chỉ update các field không null/có giá trị
        public static void UpdateFromDto(this Domain.Entities.Identity.User user, UpdateUserDto dto)
        {
            if (user == null || dto == null) return;

            // Chỉ update các field có giá trị mới
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                user.Email = dto.Email;
            }

            if (dto.IsActive.HasValue)
            {
                user.IsActive = dto.IsActive.Value;
            }

            // Cập nhật UserProfile nếu có
            if (dto.Profile != null && user.Profiles != null)
            {
                user.Profiles.UpdateFromDto(dto.Profile);
            }

            // Cập nhật timestamp
            user.UpdatedAt = DateTime.UtcNow;
        }

        #endregion

        #region User -> UserSummaryDto


        public static UserSummaryDto ToSummaryDto(this Domain.Entities.Identity.User user)
        {
            if (user == null) return null;

            return new UserSummaryDto
            {
                Id = user.Id,
                Email = user.Email,
                IsActive = user.IsActive,
                CreateAt = user.CreateAt,
                
                // Thêm thông tin cơ bản từ Profile nếu cần
                FullName = user.Profiles?.FullName ?? user.Email,
                AvatarUrl = user.Profiles?.AvatarUrl,
                
                // Lấy danh sách tên roles
                Roles = user.UserRoles?.Select(ur => ur.Role?.Name).Where(n => n != null).ToList() ?? new List<string>()
            };
        }


        public static List<UserSummaryDto> ToSummaryDtoList(this IEnumerable<Domain.Entities.Identity.User> users)
        {
            return users?.Select(u => u.ToSummaryDto()).ToList() ?? new List<UserSummaryDto>();
        }

        #endregion
    }
}
