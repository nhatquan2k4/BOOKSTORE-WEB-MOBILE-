using BookStore.Application.Dtos.Identity.Auth;
using BookStore.Application.IService.Identity.Auth;
using BookStore.Application.Mappers.Identity.Auth;
using BookStore.Application.Settings;
using BookStore.Domain.IRepository.Identity.User;
using BookStore.Domain.IRepository.Identity.RolePermisson;
using Microsoft.Extensions.Options;

namespace BookStore.Application.Services.Identity.Auth
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IPasswordService _passwordService;
        private readonly ITokenService _tokenService;
        private readonly JwtSettings _jwtSettings;

        public AuthService(
            IUserRepository userRepository,
            IRoleRepository roleRepository,
            IPasswordService passwordService,
            ITokenService tokenService,
            IOptions<JwtSettings> jwtSettings)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _passwordService = passwordService;
            _tokenService = tokenService;
            _jwtSettings = jwtSettings.Value;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _userRepository.GetUserWithRolesAndPermissionsAsync(loginDto.Email);

            if (user == null)
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng");

            if (!_passwordService.VerifyPassword(loginDto.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng");

            if (!user.IsActive)
                throw new UnauthorizedAccessException("Tài khoản đã bị khóa");

            var roles = user.UserRoles?
            .Select(ur => ur.Role?.Name ?? "")
            .Where(n => !string.IsNullOrEmpty(n)) ?? Enumerable.Empty<string>();

            var permissions = user.UserRoles?
                .SelectMany(ur => ur.Role?.RolePermissions ?? new List<Domain.Entities.Identity.RolePermission>())
                .Select(rp => rp.Permission?.Name ?? "")
                .Where(n => !string.IsNullOrEmpty(n))
                .Distinct() ?? Enumerable.Empty<string>();

            var accessToken = _tokenService.GenerateAccessToken(user.Id, user.Email, roles, permissions);
            var refreshToken = _tokenService.GenerateRefreshToken();

            var refreshTokenExpiryDays = loginDto.RememberMe ? 30 : 7;
            await _tokenService.CreateRefreshTokenAsync(user.Id, refreshToken, refreshTokenExpiryDays);

            var accessTokenExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);
            var refreshTokenExpiresAt = DateTime.UtcNow.AddDays(refreshTokenExpiryDays);

            return user.ToLoginResponseDto(accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt);
        }

        public async Task<LoginResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            if (registerDto.Password != registerDto.ConfirmPassword)
                throw new InvalidOperationException("Mật khẩu xác nhận không khớp");

            if (!_passwordService.ValidatePasswordStrength(registerDto.Password))
                throw new InvalidOperationException("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt");

            if (await _userRepository.ExistsByEmailAsync(registerDto.Email))
                throw new InvalidOperationException("Email đã được sử dụng");

            var user = registerDto.ToEntity();
            user.PasswordHash = _passwordService.HashPassword(registerDto.Password);

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            var roles = new List<string>();
            var permissions = new List<string>();

            var accessToken = _tokenService.GenerateAccessToken(user.Id, user.Email, roles, permissions);
            var refreshToken = _tokenService.GenerateRefreshToken();
            await _tokenService.CreateRefreshTokenAsync(user.Id, refreshToken);

            var accessTokenExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);
            var refreshTokenExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays);

            return user.ToLoginResponseDto(accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt);
        }

        public async Task<RefreshTokenResponseDto> RefreshTokenAsync(RefreshTokenDto refreshTokenDto)
        {
            if (!await _tokenService.ValidateRefreshTokenAsync(refreshTokenDto.RefreshToken))
                throw new UnauthorizedAccessException("Refresh token không hợp lệ hoặc đã hết hạn");

            var userId = await _tokenService.GetUserIdFromRefreshTokenAsync(refreshTokenDto.RefreshToken);
            if (userId == null)
                throw new UnauthorizedAccessException("Refresh token không hợp lệ");

            var user = await _userRepository.GetByIdWithAllDetailsAsync(userId.Value);
            if (user == null || !user.IsActive)
                throw new UnauthorizedAccessException("Người dùng không tồn tại hoặc đã bị khóa");

            await _tokenService.RevokeRefreshTokenAsync(refreshTokenDto.RefreshToken);

            var roles = user.UserRoles?.Select(ur => ur.Role?.Name ?? "").Where(n => !string.IsNullOrEmpty(n)) ?? Enumerable.Empty<string>();

            var permissions = user.UserRoles?
                .SelectMany(ur => ur.Role?.RolePermissions ?? new List<Domain.Entities.Identity.RolePermission>())
                .Select(rp => rp.Permission?.Name ?? "")
                .Where(n => !string.IsNullOrEmpty(n))
                .Distinct() ?? Enumerable.Empty<string>();

            var newAccessToken = _tokenService.GenerateAccessToken(user.Id, user.Email, roles, permissions);
            var newRefreshToken = _tokenService.GenerateRefreshToken();
            await _tokenService.CreateRefreshTokenAsync(user.Id, newRefreshToken);

            return new RefreshTokenResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
                RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays)
            };
        }

        public async Task<bool> LogoutAsync(Guid userId)
        {
            await _tokenService.RevokeAllUserRefreshTokensAsync(userId);
            return true;
        }

        public async Task<bool> LogoutAllDevicesAsync(Guid userId)
        {
            await _tokenService.RevokeAllUserRefreshTokensAsync(userId);
            return true;
        }

        public async Task<ChangePasswordResponseDto> ChangePasswordAsync(Guid userId, ChangePasswordDto changePasswordDto)
        {
            if (changePasswordDto.NewPassword != changePasswordDto.ConfirmNewPassword)
            {
                return new ChangePasswordResponseDto
                {
                    Success = false,
                    Message = "Mật khẩu mới không khớp",
                    Error = "PASSWORD_MISMATCH",
                    Username = ""
                };
            }

            if (!_passwordService.ValidatePasswordStrength(changePasswordDto.NewPassword))
            {
                return new ChangePasswordResponseDto
                {
                    Success = false,
                    Message = "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
                    Error = "WEAK_PASSWORD",
                    Username = ""
                };
            }

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return new ChangePasswordResponseDto
                {
                    Success = false,
                    Message = "Người dùng không tồn tại",
                    Error = "USER_NOT_FOUND",
                    Username = ""
                };
            }

            if (!_passwordService.VerifyPassword(changePasswordDto.CurrentPassword, user.PasswordHash))
            {
                return new ChangePasswordResponseDto
                {
                    Success = false,
                    Message = "Mật khẩu hiện tại không đúng",
                    Error = "INCORRECT_PASSWORD",
                    Username = user.Email
                };
            }

            var newPasswordHash = _passwordService.HashPassword(changePasswordDto.NewPassword);
            await _userRepository.UpdatePasswordAsync(userId, newPasswordHash);

            await _tokenService.RevokeAllUserRefreshTokensAsync(userId);

            return new ChangePasswordResponseDto
            {
                Success = true,
                Message = "Đổi mật khẩu thành công",
                Error = "",
                Username = user.Email
            };
        }

        public async Task<ForgotPasswordResponseDto> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto)
        {
            var user = await _userRepository.GetByEmailAsync(forgotPasswordDto.Email);

            if (user == null)
            {
                return new ForgotPasswordResponseDto
                {
                    Success = true,
                    Message = "Nếu email tồn tại, link reset password sẽ được gửi đến email"
                };
            }

            // TODO: Implement email sending logic with reset token
            // Generate reset token and save to database
            // Send email with reset link

            return new ForgotPasswordResponseDto
            {
                Success = true,
                Message = "Link reset password đã được gửi đến email của bạn"
            };
        }

        public async Task<ResetPasswordResponseDto> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
        {
            if (resetPasswordDto.NewPassword != resetPasswordDto.ConfirmNewPassword)
            {
                return new ResetPasswordResponseDto
                {
                    Success = false,
                    Message = "Mật khẩu mới không khớp"
                };
            }

            if (!_passwordService.ValidatePasswordStrength(resetPasswordDto.NewPassword))
            {
                return new ResetPasswordResponseDto
                {
                    Success = false,
                    Message = "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
                };
            }

            // TODO: Validate reset token
            // Find user by email and token
            // Update password
            // Revoke all refresh tokens

            var user = await _userRepository.GetByEmailAsync(resetPasswordDto.Email);
            if (user == null)
            {
                return new ResetPasswordResponseDto
                {
                    Success = false,
                    Message = "Token không hợp lệ hoặc đã hết hạn"
                };
            }

            var newPasswordHash = _passwordService.HashPassword(resetPasswordDto.NewPassword);
            await _userRepository.UpdatePasswordAsync(user.Id, newPasswordHash);
            await _tokenService.RevokeAllUserRefreshTokensAsync(user.Id);

            return new ResetPasswordResponseDto
            {
                Success = true,
                Message = "Reset mật khẩu thành công"
            };
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            return await _tokenService.ValidateRefreshTokenAsync(token);
        }

        public async Task<bool> RevokeTokenAsync(string refreshToken)
        {
            return await _tokenService.RevokeRefreshTokenAsync(refreshToken);
        }

        public async Task<UserInfoDto?> GetCurrentUserInfoAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdWithAllDetailsAsync(userId);
            return user?.ToUserInfoDto();
        }
    }
}
