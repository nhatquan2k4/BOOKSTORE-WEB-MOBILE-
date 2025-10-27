using BookStore.Domain.Entities.Identity;
using BookStore.Domain.IRepository.Identity.Auth;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repository.Identity.Auth
{
    public class RefreshTokenRepository : GenericRepository<RefreshToken>, IRefreshTokenRepository
    {
        public RefreshTokenRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<RefreshToken?> GetByTokenAsync(string token)
        {
            return await _dbSet
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.Token == token);
        }

        public async Task<RefreshToken?> GetActiveTokenByUserIdAsync(Guid userId)
        {
            return await _dbSet
                .Where(rt => rt.UserId == userId 
                    && !rt.IsRevoked 
                    && rt.ExpiryDate > DateTime.UtcNow)
                .OrderByDescending(rt => rt.ExpiryDate)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<RefreshToken>> GetActiveTokensByUserIdAsync(Guid userId)
        {
            return await _dbSet
                .Where(rt => rt.UserId == userId 
                    && !rt.IsRevoked 
                    && rt.ExpiryDate > DateTime.UtcNow)
                .OrderByDescending(rt => rt.ExpiryDate)
                .ToListAsync();
        }

        public async Task<bool> IsValidTokenAsync(string token)
        {
            return await _dbSet
                .AnyAsync(rt => rt.Token == token 
                    && !rt.IsRevoked 
                    && rt.ExpiryDate > DateTime.UtcNow);
        }

        public async Task RevokeTokenAsync(string token)
        {
            var refreshToken = await _dbSet
                .FirstOrDefaultAsync(rt => rt.Token == token);

            if (refreshToken != null)
            {
                refreshToken.IsRevoked = true;
                _dbSet.Update(refreshToken);
                await SaveChangesAsync();
            }
        }

        public async Task RevokeAllByUserIdAsync(Guid userId)
        {
            var tokens = await _dbSet
                .Where(rt => rt.UserId == userId && !rt.IsRevoked)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.IsRevoked = true;
            }

            if (tokens.Any())
            {
                _dbSet.UpdateRange(tokens);
                await SaveChangesAsync();
            }
        }

        public async Task DeleteExpiredTokensAsync()
        {
            var expiredTokens = await _dbSet
                .Where(rt => rt.ExpiryDate < DateTime.UtcNow)
                .ToListAsync();

            if (expiredTokens.Any())
            {
                _dbSet.RemoveRange(expiredTokens);
                await SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<RefreshToken>> GetAllTokensByUserIdAsync(Guid userId)
        {
            return await _dbSet
                .Where(rt => rt.UserId == userId)
                .OrderByDescending(rt => rt.ExpiryDate)
                .ToListAsync();
        }

        public async Task<bool> HasActiveTokenAsync(Guid userId)
        {
            return await _dbSet
                .AnyAsync(rt => rt.UserId == userId 
                    && !rt.IsRevoked 
                    && rt.ExpiryDate > DateTime.UtcNow);
        }
    }
}
