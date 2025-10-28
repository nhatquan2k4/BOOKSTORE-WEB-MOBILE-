using BookStore.Application.IService.Identity.Auth;
using BookStore.Domain.IRepository.Identity.Auth;
using BookStore.Domain.IRepository.Identity.User;
using BookStore.Domain.Entities.Identity;
using System.Security.Cryptography;

namespace BookStore.Application.Services.Identity.Auth
{
    public class PasswordResetService : IPasswordResetService
    {
        private readonly IPasswordResetTokenRepository _passwordResetTokenRepository;
        private readonly IUserRepository _userRepository;
        private readonly IPasswordService _passwordService;

        public PasswordResetService(
            IPasswordResetTokenRepository passwordResetTokenRepository,
            IUserRepository userRepository,
            IPasswordService passwordService)
        {
            _passwordResetTokenRepository = passwordResetTokenRepository;
            _userRepository = userRepository;
            _passwordService = passwordService;
        }

        public async Task<string> GeneratePasswordResetTokenAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
                throw new InvalidOperationException("Email không tồn tại");

            await _passwordResetTokenRepository.InvalidateAllUserTokensAsync(user.Id);

            var token = GenerateSecureToken();
            var resetToken = new PasswordResetToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Token = token,
                ExpiryDate = DateTime.UtcNow.AddHours(1),
                CreatedAt = DateTime.UtcNow,
                IsUsed = false
            };

            await _passwordResetTokenRepository.AddAsync(resetToken);
            await _passwordResetTokenRepository.SaveChangesAsync();

            // TODO: Send password reset email
            return token;
        }

        public async Task<bool> ValidatePasswordResetTokenAsync(string email, string token)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
                return false;

            var resetToken = await _passwordResetTokenRepository.GetByTokenAsync(token);
            if (resetToken == null || resetToken.UserId != user.Id)
                return false;

            return await _passwordResetTokenRepository.IsValidTokenAsync(token);
        }

        public async Task<bool> ResetPasswordWithTokenAsync(string email, string token, string newPassword)
        {
            if (!await ValidatePasswordResetTokenAsync(email, token))
                return false;

            if (!_passwordService.ValidatePasswordStrength(newPassword))
                throw new InvalidOperationException("Mật khẩu không đủ mạnh");

            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
                return false;

            var newPasswordHash = _passwordService.HashPassword(newPassword);
            await _userRepository.UpdatePasswordAsync(user.Id, newPasswordHash);
            await _passwordResetTokenRepository.MarkTokenAsUsedAsync(token);

            return true;
        }

        public async Task InvalidateAllPasswordResetTokensAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
                return;

            await _passwordResetTokenRepository.InvalidateAllUserTokensAsync(user.Id);
        }

        private string GenerateSecureToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}
