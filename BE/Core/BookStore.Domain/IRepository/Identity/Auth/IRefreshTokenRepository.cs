using BookStore.Domain.Entities.Identity;

namespace BookStore.Domain.IRepository.Identity.Auth
{
    public interface IRefreshTokenRepository : IGenericRepository<RefreshToken>
    {
        Task<RefreshToken?> GetByTokenAsync(string token);
        Task<RefreshToken?> GetActiveTokenByUserIdAsync(Guid userId);
        Task<IEnumerable<RefreshToken>> GetActiveTokensByUserIdAsync(Guid userId);
        Task<bool> IsValidTokenAsync(string token);
        Task RevokeTokenAsync(string token);
        Task RevokeAllByUserIdAsync(Guid userId);
        Task DeleteExpiredTokensAsync();
        Task<IEnumerable<RefreshToken>> GetAllTokensByUserIdAsync(Guid userId);
        Task<bool> HasActiveTokenAsync(Guid userId);
    }
}
