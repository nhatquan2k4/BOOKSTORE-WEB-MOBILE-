using BookStore.Application.Dtos.Identity.Auth;
using BookStore.Domain.Entities.Identity;

namespace BookStore.Application.Mappers.Identity.Auth
{

    /// Mapper thủ công cho Authentication (Login, Register, RefreshToken)

    public static class AuthMapper
    {
        #region User -> LoginResponseDto


        /// Chuyển User entity sang LoginResponseDto (sau khi login thành công)
        /// Dùng khi: User đăng nhập thành công, trả về token và thông tin user
        /// Lưu ý: AccessToken và RefreshToken được tạo ở service layer
        public static LoginResponseDto ToLoginResponseDto(
            this Domain.Entities.Identity.User user, 
            string accessToken, 
            string refreshToken,
            DateTime accessTokenExpiresAt,
            DateTime refreshTokenExpiresAt)
        {
            if (user == null) return null!;

            return new LoginResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                AccessTokenExpiresAt = accessTokenExpiresAt,
                RefreshTokenExpiresAt = refreshTokenExpiresAt,
                User = user.ToUserInfoDto()
            };
        }

        /// Chuyển User entity sang UserInfoDto (thông tin user trong LoginResponse)
        public static UserInfoDto ToUserInfoDto(this Domain.Entities.Identity.User user)
        {
            if (user == null) return null!;

            return new UserInfoDto
            {
                Id = user.Id.ToString(),
                UserName = user.Profiles?.FullName ?? user.Email,
                Email = user.Email,
                IsActive = user.IsActive,
                
                // Lấy danh sách roles
                Roles = user.GetRoleNames().ToList(),
                
                // Lấy danh sách permissions từ roles
                Permissions = user.GetPermissionNames().ToList()
            };
        }

        public static IEnumerable<string> GetRoleNames(this Domain.Entities.Identity.User user)
        {
            return user.UserRoles?
                .Select(userRole => userRole.Role?.Name ?? string.Empty)
                .Where(name => !string.IsNullOrEmpty(name)) ?? Enumerable.Empty<string>();
        }

        public static IEnumerable<string> GetPermissionNames(this Domain.Entities.Identity.User user)
        {
            return user.UserRoles?
                .SelectMany(userRole => userRole.Role?.RolePermissions ?? new List<RolePermission>())
                .Select(rolePermission => rolePermission.Permission?.Name ?? string.Empty)
                .Where(name => !string.IsNullOrEmpty(name))
                .Distinct() ?? Enumerable.Empty<string>();
        }

        public static IEnumerable<string> GetPermissionNames(this Role role)
        {
            return role.RolePermissions?
                .Select(rolePermission => rolePermission.Permission?.Name ?? string.Empty)
                .Where(name => !string.IsNullOrEmpty(name))
                .Distinct() ?? Enumerable.Empty<string>();
        }

        #endregion

        #region RegisterDto -> User

        
        /// Chuyển từ RegisterDto sang User entity
        /// Dùng khi: User đăng ký tài khoản mới
        /// Lưu ý: Password cần được hash trước khi lưu (xử lý ở service layer)
        
        public static Domain.Entities.Identity.User ToEntity(this RegisterDto dto)
        {
            if (dto == null) return null!;

            var user = new Domain.Entities.Identity.User
            {
                Id = Guid.NewGuid(),
                Email = dto.Email,
                IsActive = true,
                CreateAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                
                // Password sẽ được hash trong service/handler
                // KHÔNG map PasswordHash ở đây
            };

            // Tạo UserProfile từ RegisterDto
            if (!string.IsNullOrWhiteSpace(dto.FullName))
            {
                user.Profiles = new UserProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    FullName = dto.FullName,
                    PhoneNumber = dto.PhoneNumber,
                    
                };
            }

            return user;
        }

        #endregion

        #region RefreshToken <-> RefreshTokenDto

        
        /// Chuyển từ RefreshToken entity sang RefreshTokenDto
        
        public static RefreshTokenDto ToDto(this RefreshToken refreshToken)
        {
            if (refreshToken == null) return null!;

            return new RefreshTokenDto
            {
                RefreshToken = refreshToken.Token
            };
        }

        
        /// Chuyển từ string token sang RefreshToken entity
        /// Dùng khi: Tạo RefreshToken mới
        
        public static RefreshToken ToEntity(string token, Guid userId, DateTime expiryDate)
        {
            return new RefreshToken
            {
                Id = Guid.NewGuid(),
                Token = token,
                UserId = userId,
                ExpiryDate = expiryDate,
                IsRevoked = false
            };
        }

        
        /// Tạo RefreshTokenResponseDto sau khi refresh token thành công
        
        public static RefreshTokenResponseDto ToRefreshTokenResponseDto(
            string accessToken,
            string refreshToken,
            DateTime accessTokenExpiresAt,
            DateTime refreshTokenExpiresAt)
        {
            return new RefreshTokenResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                AccessTokenExpiresAt = accessTokenExpiresAt,
                RefreshTokenExpiresAt = refreshTokenExpiresAt
            };
        }

        #endregion

        #region Helper Methods

        
        /// Kiểm tra RefreshToken có hợp lệ không
        
        public static bool IsValid(this RefreshToken refreshToken)
        {
            if (refreshToken == null) return false;
            
            return !refreshToken.IsRevoked && 
                   refreshToken.ExpiryDate > DateTime.UtcNow;
        }

        
        /// Thu hồi RefreshToken
        
        public static void Revoke(this RefreshToken refreshToken)
        {
            if (refreshToken != null)
            {
                refreshToken.IsRevoked = true;
            }
        }

        #endregion
    }
}
