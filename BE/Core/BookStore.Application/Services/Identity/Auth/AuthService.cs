using BookStore.Application.Dtos.Identity.Auth;
using BookStore.Application.IService.Identity.Auth;
using BookStore.Application.Mappers.Identity.Auth;
using BookStore.Application.Settings;
using BookStore.Domain.IRepository.Identity.User;
using BookStore.Domain.IRepository.Identity.RolePermisson;
using Microsoft.Extensions.Options;
using BookStore.Application.IService.Identity.Email;

namespace BookStore.Application.Services.Identity.Auth
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IPasswordService _passwordService;
        private readonly ITokenService _tokenService;
        private readonly IEmailVerificationService _emailVerificationService;
        private readonly IPasswordResetService _passwordResetService;
        private readonly IEmailService _emailService;
        private readonly JwtSettings _jwtSettings;
        private readonly EmailSettings _emailSettings;

        public AuthService(
            IUserRepository userRepository,
            IRoleRepository roleRepository,
            IPasswordService passwordService,
            ITokenService tokenService,
            IEmailVerificationService emailVerificationService,
            IPasswordResetService passwordResetService,
            IEmailService emailService,
            IOptions<JwtSettings> jwtSettings,
            IOptions<EmailSettings> emailSettings)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _passwordService = passwordService;
            _tokenService = tokenService;
            _emailVerificationService = emailVerificationService;
            _passwordResetService = passwordResetService;
            _emailService = emailService;
            _jwtSettings = jwtSettings.Value;
            _emailSettings = emailSettings.Value;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _userRepository.GetUserWithRolesAndPermissionsAsync(loginDto.Email);

            if (user == null)
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng");

            if (!_passwordService.VerifyPassword(loginDto.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng");

            // Allow login even if account is not active (email not verified)
            // if (!user.IsActive)
            //     throw new UnauthorizedAccessException("Tài khoản đã bị khóa");

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
            user.IsActive = false; // User chưa active cho đến khi verify email

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            // Tự động gán role "User" cho user mới đăng ký
            var userRole_entity = await _roleRepository.GetByNameAsync("User");
            if (userRole_entity != null)
            {
                var userRole = new Domain.Entities.Identity.UserRole
                {
                    UserId = user.Id,
                    RoleId = userRole_entity.Id
                };
                user.UserRoles.Add(userRole);
                await _userRepository.SaveChangesAsync();
            }

            // Generate and send email verification token
            await _emailVerificationService.GenerateVerificationTokenAsync(user.Id);

            var roles = userRole_entity != null ? new List<string> { "User" } : new List<string>();
            var permissions = userRole_entity?.RolePermissions?
                .Select(rp => rp.Permission?.Name ?? "")
                .Where(n => !string.IsNullOrEmpty(n))
                .ToList() ?? new List<string>();

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
            if (user == null)
                throw new UnauthorizedAccessException("Người dùng không tồn tại");

            // Allow refresh token even if account is not active (email not verified)
            // if (!user.IsActive)
            //     throw new UnauthorizedAccessException("Tài khoản đã bị khóa");

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
            try
            {
                var user = await _userRepository.GetByEmailAsync(forgotPasswordDto.Email);

                if (user == null)
                {
                    // Don't reveal if email exists for security
                    return new ForgotPasswordResponseDto
                    {
                        Success = true,
                        Message = "Nếu email tồn tại trong hệ thống, link đặt lại mật khẩu đã được gửi đến email của bạn."
                    };
                }

                // Generate reset token
                var resetToken = await _passwordResetService.GeneratePasswordResetTokenAsync(forgotPasswordDto.Email);

                // Build reset URL
                var resetUrl = $"{_emailSettings.FrontendUrl}/reset-password?token={resetToken}&email={Uri.EscapeDataString(forgotPasswordDto.Email)}";

                // Send email
                var userName = user.Profiles?.FullName ?? user.Email.Split('@')[0];
                await _emailService.SendPasswordResetEmailAsync(
                    user.Email,
                    userName,
                    resetToken,
                    resetUrl
                );

                return new ForgotPasswordResponseDto
                {
                    Success = true,
                    Message = "Link đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư."
                };
            }
            catch (Exception)
            {
                // Log the error but don't expose details
                return new ForgotPasswordResponseDto
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi gửi email. Vui lòng thử lại sau."
                };
            }
        }

        public async Task<ResetPasswordResponseDto> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
        {
            try
            {
                // Validate password match
                if (resetPasswordDto.NewPassword != resetPasswordDto.ConfirmNewPassword)
                {
                    return new ResetPasswordResponseDto
                    {
                        Success = false,
                        Message = "Mật khẩu mới không khớp"
                    };
                }

                // Validate password strength
                if (!_passwordService.ValidatePasswordStrength(resetPasswordDto.NewPassword))
                {
                    return new ResetPasswordResponseDto
                    {
                        Success = false,
                        Message = "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số"
                    };
                }

                // Validate reset token and reset password
                var success = await _passwordResetService.ResetPasswordWithTokenAsync(
                    resetPasswordDto.Email,
                    resetPasswordDto.Token,
                    resetPasswordDto.NewPassword
                );

                if (!success)
                {
                    return new ResetPasswordResponseDto
                    {
                        Success = false,
                        Message = "Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link đặt lại mật khẩu mới."
                    };
                }

                // Get user to revoke refresh tokens
                var user = await _userRepository.GetByEmailAsync(resetPasswordDto.Email);
                if (user != null)
                {
                    // Revoke all refresh tokens for security
                    await _tokenService.RevokeAllUserRefreshTokensAsync(user.Id);
                }

                return new ResetPasswordResponseDto
                {
                    Success = true,
                    Message = "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới."
                };
            }
            catch (Exception)
            {
                return new ResetPasswordResponseDto
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại sau."
                };
            }
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
