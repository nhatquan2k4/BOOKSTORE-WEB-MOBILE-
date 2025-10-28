using BookStore.Application.IService.Identity.Auth;
using BookStore.Domain.IRepository.Identity.Auth;
using BookStore.Domain.IRepository.Identity.User;
using BookStore.Domain.Entities.Identity;
using System.Security.Cryptography;

namespace BookStore.Application.Services.Identity.Auth
{
    public class EmailVerificationService : IEmailVerificationService
    {
        private readonly IEmailVerificationTokenRepository _emailVerificationTokenRepository;
        private readonly IUserRepository _userRepository;

        public EmailVerificationService(
            IEmailVerificationTokenRepository emailVerificationTokenRepository,
            IUserRepository userRepository)
        {
            _emailVerificationTokenRepository = emailVerificationTokenRepository;
            _userRepository = userRepository;
        }

        public async Task<string> GenerateEmailVerificationTokenAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new InvalidOperationException("Người dùng không tồn tại");

            await _emailVerificationTokenRepository.InvalidateAllUserTokensAsync(userId);

            var token = GenerateSecureToken();
            var verificationToken = new EmailVerificationToken
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Token = token,
                ExpiryDate = DateTime.UtcNow.AddHours(24),
                CreatedAt = DateTime.UtcNow,
                IsUsed = false
            };

            await _emailVerificationTokenRepository.AddAsync(verificationToken);
            await _emailVerificationTokenRepository.SaveChangesAsync();

            // TODO: Send verification email
            return token;
        }

        public async Task<bool> VerifyEmailAsync(string token)
        {
            if (!await _emailVerificationTokenRepository.IsValidTokenAsync(token))
                return false;

            var verificationToken = await _emailVerificationTokenRepository.GetByTokenAsync(token);
            if (verificationToken == null)
                return false;

            await _emailVerificationTokenRepository.MarkTokenAsUsedAsync(token);
            await _userRepository.VerifyEmailAsync(verificationToken.UserId);

            return true;
        }

        public async Task<bool> ResendVerificationEmailAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
                return false;

            await GenerateEmailVerificationTokenAsync(user.Id);
            return true;
        }

        public async Task<bool> IsEmailVerifiedAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            // Since User entity doesn't have IsEmailVerified, we check if user is active
            // You may need to add IsEmailVerified property to User entity or use another approach
            return user.IsActive;
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
