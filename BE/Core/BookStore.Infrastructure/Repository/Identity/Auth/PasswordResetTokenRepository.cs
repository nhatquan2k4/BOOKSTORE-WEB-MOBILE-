using BookStore.Domain.Entities.Identity;
using BookStore.Domain.IRepository.Identity.Auth;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repository.Identity.Auth
{
    public class PasswordResetTokenRepository : GenericRepository<PasswordResetToken>, IPasswordResetTokenRepository
    {
        public PasswordResetTokenRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<PasswordResetToken?> GetByTokenAsync(string token)
        {
            return await _dbSet
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == token);
        }

        public async Task<bool> IsValidTokenAsync(string token)
        {
            return await _dbSet
                .AnyAsync(t => t.Token == token 
                    && !t.IsUsed 
                    && t.ExpiryDate > DateTime.UtcNow);
        }

        public async Task MarkTokenAsUsedAsync(string token)
        {
            var resetToken = await _dbSet
                .FirstOrDefaultAsync(t => t.Token == token);

            if (resetToken != null)
            {
                resetToken.IsUsed = true;
                _dbSet.Update(resetToken);
                await SaveChangesAsync();
            }
        }

        public async Task<PasswordResetToken?> GetActiveTokenByUserIdAsync(Guid userId)
        {
            return await _dbSet
                .Where(t => t.UserId == userId 
                    && !t.IsUsed 
                    && t.ExpiryDate > DateTime.UtcNow)
                .OrderByDescending(t => t.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task InvalidateAllUserTokensAsync(Guid userId)
        {
            var tokens = await _dbSet
                .Where(t => t.UserId == userId && !t.IsUsed)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.IsUsed = true;
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
                .Where(t => t.ExpiryDate < DateTime.UtcNow || t.IsUsed)
                .ToListAsync();

            if (expiredTokens.Any())
            {
                _dbSet.RemoveRange(expiredTokens);
                await SaveChangesAsync();
            }
        }
    }
}
