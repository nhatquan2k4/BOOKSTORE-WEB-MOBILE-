using BookStore.Application.Dtos.Identity.User;
using BookStore.Domain.Entities.Identity;

namespace BookStore.Application.Mappers.Identity.User
{
    public static class UserAddressMapper
    {
        #region UserAddress -> UserAddressDto
        
        /// Chuyển từ UserAddress entity sang UserAddressDto
        public static UserAddressDto ToDto(this UserAddress address)
        {
            if (address == null) return null!;

            return new UserAddressDto
            {
                Id = address.Id,
                UserId = address.UserId,
                RecipientName = address.RecipientName,
                PhoneNumber = address.PhoneNumber,
                StreetAddress = address.StreetAddress,
                Ward = address.Ward,
                District = address.District,
                Province = address.Province,
                IsDefault = address.IsDefault
            };
        }

        /// Chuyển danh sách UserAddress sang danh sách UserAddressDto
        public static List<UserAddressDto> ToDtoList(this IEnumerable<UserAddress> addresses)
        {
            return addresses?.Select(a => a.ToDto()).ToList() ?? new List<UserAddressDto>();
        }

        #endregion

        #region CreateUserAddressDto -> UserAddress

        /// Chuyển từ CreateUserAddressDto sang UserAddress entity
        /// Dùng khi: Tạo địa chỉ mới cho user
        public static UserAddress ToEntity(this CreateUserAddressDto dto, Guid userId)
        {
            if (dto == null) return null!;

            return new UserAddress
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                RecipientName = dto.RecipientName,
                PhoneNumber = dto.PhoneNumber,
                StreetAddress = dto.StreetAddress,
                Ward = dto.Ward,
                District = dto.District,
                Province = dto.Province,
                IsDefault = dto.IsDefault
            };
        }

        #endregion

        #region UpdateUserAddressDto -> UserAddress

        /// Cập nhật UserAddress entity từ UpdateUserAddressDto
        /// Chỉ update các field không null/có giá trị
        public static void UpdateFromDto(this UserAddress address, UpdateUserAddressDto dto)
        {
            if (address == null || dto == null) return;

            // Chỉ update các field có giá trị mới
            if (!string.IsNullOrWhiteSpace(dto.RecipientName))
            {
                address.RecipientName = dto.RecipientName;
            }

            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber))
            {
                address.PhoneNumber = dto.PhoneNumber;
            }

            if (!string.IsNullOrWhiteSpace(dto.StreetAddress))
            {
                address.StreetAddress = dto.StreetAddress;
            }

            if (!string.IsNullOrWhiteSpace(dto.Ward))
            {
                address.Ward = dto.Ward;
            }

            if (!string.IsNullOrWhiteSpace(dto.District))
            {
                address.District = dto.District;
            }

            if (!string.IsNullOrWhiteSpace(dto.Province))
            {
                address.Province = dto.Province;
            }

            if (dto.IsDefault.HasValue)
            {
                address.IsDefault = dto.IsDefault.Value;
            }
        }

        #endregion
    }
}
