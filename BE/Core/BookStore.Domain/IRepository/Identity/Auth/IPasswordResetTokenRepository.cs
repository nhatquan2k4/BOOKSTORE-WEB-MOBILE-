using BookStore.Domain.Entities.Identity;

namespace BookStore.Domain.IRepository.Identity.Auth
{
    public interface IPasswordResetTokenRepository : IGenericRepository<PasswordResetToken>
    {
        Task<PasswordResetToken?> GetByTokenAsync(string token);
        Task<bool> IsValidTokenAsync(string token);
        Task MarkTokenAsUsedAsync(string token);
        Task<PasswordResetToken?> GetActiveTokenByUserIdAsync(Guid userId);
        Task InvalidateAllUserTokensAsync(Guid userId);
        Task DeleteExpiredTokensAsync();
    }
}
