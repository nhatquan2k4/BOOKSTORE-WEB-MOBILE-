using BookStore.Domain.Entities.Identity;

namespace BookStore.Domain.IRepository.Identity.Auth
{
    // ===================== REFRESH TOKEN REPOSITORY =====================
    
    public interface IRefreshTokenRepository : IGenericRepository<RefreshToken>
    {
        Task<RefreshToken?> GetByTokenAsync(string token);
        Task<RefreshToken?> GetActiveTokenByUserIdAsync(Guid userId);

        Task<IEnumerable<RefreshToken>> GetActiveTokensByUserIdAsync(Guid userId);

        Task<bool> IsValidTokenAsync(string token);

        Task RevokeTokenAsync(string token);

        Task RevokeAllUserTokensAsync(Guid userId);

        Task DeleteExpiredTokensAsync();
    }

    // ===================== EMAIL VERIFICATION TOKEN REPOSITORY =====================
    
    public interface IEmailVerificationTokenRepository : IGenericRepository<EmailVerificationToken>
    {
        Task<EmailVerificationToken?> GetByTokenAsync(string token);

        Task<EmailVerificationToken?> GetActiveTokenByUserIdAsync(Guid userId);

        Task<bool> IsValidTokenAsync(string token);

        Task MarkTokenAsUsedAsync(string token);

        Task InvalidateAllUserTokensAsync(Guid userId);

        Task DeleteExpiredTokensAsync();
    }

    // ===================== PASSWORD RESET TOKEN REPOSITORY =====================
    
    public interface IPasswordResetTokenRepository : IGenericRepository<PasswordResetToken>
    {
        Task<PasswordResetToken?> GetByTokenAsync(string token);

        Task<PasswordResetToken?> GetActiveTokenByUserIdAsync(Guid userId);

        Task<bool> IsValidTokenAsync(string token);

        Task MarkTokenAsUsedAsync(string token);

        Task InvalidateAllUserTokensAsync(Guid userId);

        Task DeleteExpiredTokensAsync();
    }
}
