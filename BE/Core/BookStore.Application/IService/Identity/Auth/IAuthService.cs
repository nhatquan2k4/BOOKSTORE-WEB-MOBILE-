using BookStore.Application.Dtos.Identity.Auth;

namespace BookStore.Application.IService.Identity.Auth
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginDto loginDto);
        Task<LoginResponseDto> RegisterAsync(RegisterDto registerDto);
        Task<RefreshTokenResponseDto> RefreshTokenAsync(RefreshTokenDto refreshTokenDto);
        Task<bool> LogoutAsync(Guid userId);
        Task<bool> LogoutAllDevicesAsync(Guid userId);
        Task<ChangePasswordResponseDto> ChangePasswordAsync(Guid userId, ChangePasswordDto changePasswordDto);
        Task<ForgotPasswordResponseDto> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto);
        Task<ResetPasswordResponseDto> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
        Task<bool> ValidateTokenAsync(string token);
        Task<bool> RevokeTokenAsync(string refreshToken);
        Task<UserInfoDto?> GetCurrentUserInfoAsync(Guid userId);

        // Create user account with custom role (for admin operations)
        Task<Guid> CreateUserAccountAsync(string email, string password, string fullName, string? phoneNumber, string roleName);
    }
}
