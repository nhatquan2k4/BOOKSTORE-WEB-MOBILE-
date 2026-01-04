using BookStore.Application.Dtos.Identity.User;
using BookStore.Domain.Entities.Identity;

namespace BookStore.Application.Mappers.Identity.User
{

    public static class UserProfileMapper
    {
        #region UserProfile -> UserProfileDto
        

        public static UserProfileDto? ToDto(this UserProfile? profile)
        {
            if (profile == null) return null;

            return new UserProfileDto
            {
                Id = profile.Id,
                UserId = profile.UserId,
                FullName = profile.FullName,
                DateOfBirth = profile.DateOfBirth,
                Gender = profile.Gender,
                AvatarUrl = profile.AvatarUrl,
                PhoneNumber = profile.PhoneNumber,
                Bio = profile.Bio
            };
        }


        public static List<UserProfileDto> ToDtoList(this IEnumerable<UserProfile> profiles)
        {
            return profiles?.Select(p => p.ToDto()).Where(p => p != null).ToList() ?? new List<UserProfileDto>();
        }

        #endregion

        #region CreateUserProfileDto -> UserProfile

        public static UserProfile ToEntity(this CreateUserProfileDto dto, Guid userId)
        {
            if (dto == null) return null!;

            return new UserProfile
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                FullName = dto.FullName,
                DateOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,
                PhoneNumber = dto.PhoneNumber,
                Bio = dto.Bio
            };
        }

        #endregion

        #region UpdateUserProfileDto -> UserProfile

        public static void UpdateFromDto(this UserProfile profile, UpdateUserProfileDto dto)
        {
            if (profile == null || dto == null) return;

            // Chỉ update các field có giá trị mới
            if (!string.IsNullOrWhiteSpace(dto.FullName))
            {
                profile.FullName = dto.FullName;
            }

            if (dto.DateOfBirth.HasValue)
            {
                profile.DateOfBirth = dto.DateOfBirth;
            }

            if (!string.IsNullOrWhiteSpace(dto.Gender))
            {
                profile.Gender = dto.Gender;
            }

            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber))
            {
                profile.PhoneNumber = dto.PhoneNumber;
            }

            if (!string.IsNullOrWhiteSpace(dto.Bio))
            {
                profile.Bio = dto.Bio;
            }

            if (!string.IsNullOrWhiteSpace(dto.AvatarUrl))
            {
                profile.AvatarUrl = dto.AvatarUrl;
            }
        }

        public static UserProfile ToEntity(this UpdateUserProfileDto dto, Guid userId)
        {
            if (dto == null) return null!;

            return new UserProfile
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                FullName = dto.FullName ?? string.Empty,
                DateOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,
                PhoneNumber = dto.PhoneNumber,
                Bio = dto.Bio,
                AvatarUrl = dto.AvatarUrl
            };
        }

        #endregion
    }
}
