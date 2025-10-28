namespace BookStore.Application.IService.Identity.Auth
{
    public interface ITokenService
    {
        string GenerateAccessToken(Guid userId, string email, IEnumerable<string> roles, IEnumerable<string> permissions);
        string GenerateRefreshToken();
        Task<string> CreateRefreshTokenAsync(Guid userId, string refreshToken, int expiryDays = 30);
        Task<bool> ValidateRefreshTokenAsync(string refreshToken);
        Task<Guid?> GetUserIdFromRefreshTokenAsync(string refreshToken);
        Task<bool> RevokeRefreshTokenAsync(string refreshToken);
        Task<bool> RevokeAllUserRefreshTokensAsync(Guid userId);
        Task CleanupExpiredTokensAsync();
    }
}
