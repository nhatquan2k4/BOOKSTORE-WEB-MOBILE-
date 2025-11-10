using BookStore.Application.IService.Identity.Email;
using BookStore.Application.Settings;
using BookStore.Domain.Entities.Identity;
using BookStore.Domain.IRepository.Identity.Auth;
using BookStore.Domain.IRepository.Identity.User;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;

namespace BookStore.Application.Services.Identity.Email
{
    public class EmailVerificationService : IEmailVerificationService
    {
        private readonly IEmailVerificationTokenRepository _tokenRepository;
        private readonly IUserRepository _userRepository;
        private readonly IEmailService _emailService;
        private readonly EmailSettings _emailSettings;
        private readonly string _frontendUrl;

        public EmailVerificationService(
            IEmailVerificationTokenRepository tokenRepository,
            IUserRepository userRepository,
            IEmailService emailService,
            IOptions<EmailSettings> emailSettings)
        {
            _tokenRepository = tokenRepository;
            _userRepository = userRepository;
            _emailService = emailService;
            _emailSettings = emailSettings.Value;
            _frontendUrl = _emailSettings.FrontendUrl;
        }

        public async Task<string> GenerateVerificationTokenAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new InvalidOperationException("User not found");

            // Invalidate any existing tokens for this user
            await _tokenRepository.InvalidateAllUserTokensAsync(userId);

            // Generate a secure random token
            var token = GenerateSecureToken();

            // Create new verification token
            var verificationToken = new EmailVerificationToken
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Token = token,
                ExpiryDate = DateTime.UtcNow.AddHours(_emailSettings.TokenExpirationHours),
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            await _tokenRepository.AddAsync(verificationToken);
            await _tokenRepository.SaveChangesAsync();

            // Get frontend URL
            var verificationUrl = $"{_frontendUrl}/verify-email?token={token}";

            // Send verification email
            var userName = user.Profiles?.FullName ?? user.Email.Split('@')[0];
            await _emailService.SendEmailVerificationAsync(user.Email, userName, token, verificationUrl);

            return token;
        }

        public async Task<bool> VerifyEmailAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return false;

            var verificationToken = await _tokenRepository.GetByTokenAsync(token);
            
            if (verificationToken == null)
                return false;

            // Check if token is already used
            if (verificationToken.IsUsed)
                return false;

            // Check if token is expired
            if (verificationToken.ExpiryDate < DateTime.UtcNow)
                return false;

            var user = await _userRepository.GetByIdAsync(verificationToken.UserId);
            if (user == null)
                return false;

            // Mark token as used
            verificationToken.IsUsed = true;
            _tokenRepository.Update(verificationToken);

            // Activate user account
            user.IsActive = true;
            _userRepository.Update(user);

            await _tokenRepository.SaveChangesAsync();

            // Send welcome email
            var userName = user.Profiles?.FullName ?? user.Email.Split('@')[0];
            try
            {
                await _emailService.SendWelcomeEmailAsync(user.Email, userName);
            }
            catch
            {
                // Don't fail verification if welcome email fails
            }

            return true;
        }

        public async Task<bool> ResendVerificationEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
                return false;

            // Check if user is already verified
            if (user.IsActive)
                return false;

            // Generate and send new verification token
            await GenerateVerificationTokenAsync(user.Id);
            return true;
        }

        public async Task<bool> IsEmailVerifiedAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            return user?.IsActive ?? false;
        }

        private string GenerateSecureToken()
        {
            // Generate a cryptographically secure random token
            var randomBytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
            }
            return Convert.ToBase64String(randomBytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");
        }
    }
}
