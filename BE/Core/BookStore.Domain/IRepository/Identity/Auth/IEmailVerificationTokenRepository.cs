using BookStore.Domain.Entities.Identity;

namespace BookStore.Domain.IRepository.Identity.Auth
{
    public interface IEmailVerificationTokenRepository : IGenericRepository<EmailVerificationToken>
    {
        Task<EmailVerificationToken?> GetByTokenAsync(string token);
        Task<bool> IsValidTokenAsync(string token);
        Task MarkTokenAsUsedAsync(string token);
        Task<EmailVerificationToken?> GetActiveTokenByUserIdAsync(Guid userId);
        Task InvalidateAllUserTokensAsync(Guid userId);
        Task DeleteExpiredTokensAsync();
    }
}
