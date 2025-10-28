using BookStore.Domain.Entities.Identity;
using BookStore.Domain.IRepository.Identity.Auth;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repository.Identity.Auth
{
    // ===================== REFRESH TOKEN REPOSITORY =====================

    public class RefreshTokenRepository : GenericRepository<RefreshToken>, IRefreshTokenRepository
    {
        public RefreshTokenRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<RefreshToken?> GetByTokenAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return null;

            return await _context.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.Token == token);
        }

        public async Task<RefreshToken?> GetActiveTokenByUserIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return null;

            return await _context.RefreshTokens
                .Where(rt => rt.UserId == userId 
                    && !rt.IsRevoked 
                    && rt.ExpiryDate > DateTime.UtcNow)
                .OrderByDescending(rt => rt.ExpiryDate)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<RefreshToken>> GetActiveTokensByUserIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return Enumerable.Empty<RefreshToken>();

            return await _context.RefreshTokens
                .Where(rt => rt.UserId == userId 
                    && !rt.IsRevoked 
                    && rt.ExpiryDate > DateTime.UtcNow)
                .OrderByDescending(rt => rt.ExpiryDate)
                .ToListAsync();
        }

        public async Task<bool> IsValidTokenAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return false;

            return await _context.RefreshTokens
                .AnyAsync(rt => rt.Token == token 
                    && !rt.IsRevoked 
                    && rt.ExpiryDate > DateTime.UtcNow);
        }

        public async Task RevokeTokenAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return;

            var refreshToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == token);

            if (refreshToken != null)
            {
                refreshToken.IsRevoked = true;
                await _context.SaveChangesAsync();
            }
        }

        public async Task RevokeAllUserTokensAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return;

            var tokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == userId && !rt.IsRevoked)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.IsRevoked = true;
            }

            await _context.SaveChangesAsync();
        }

        public async Task DeleteExpiredTokensAsync()
        {
            var expiredTokens = await _context.RefreshTokens
                .Where(rt => rt.ExpiryDate < DateTime.UtcNow)
                .ToListAsync();

            _context.RefreshTokens.RemoveRange(expiredTokens);
            await _context.SaveChangesAsync();
        }
    }

    // ===================== EMAIL VERIFICATION TOKEN REPOSITORY =====================

    public class EmailVerificationTokenRepository : GenericRepository<EmailVerificationToken>, IEmailVerificationTokenRepository
    {
        public EmailVerificationTokenRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<EmailVerificationToken?> GetByTokenAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return null;

            return await _context.EmailVerificationTokens
                .Include(evt => evt.User)
                .FirstOrDefaultAsync(evt => evt.Token == token);
        }

        public async Task<EmailVerificationToken?> GetActiveTokenByUserIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return null;

            return await _context.EmailVerificationTokens
                .Where(evt => evt.UserId == userId 
                    && !evt.IsUsed 
                    && evt.ExpiryDate > DateTime.UtcNow)
                .OrderByDescending(evt => evt.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> IsValidTokenAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return false;

            return await _context.EmailVerificationTokens
                .AnyAsync(evt => evt.Token == token 
                    && !evt.IsUsed 
                    && evt.ExpiryDate > DateTime.UtcNow);
        }

        public async Task MarkTokenAsUsedAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return;

            var verificationToken = await _context.EmailVerificationTokens
                .FirstOrDefaultAsync(evt => evt.Token == token);

            if (verificationToken != null)
            {
                verificationToken.IsUsed = true;
                await _context.SaveChangesAsync();
            }
        }

        public async Task InvalidateAllUserTokensAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return;

            var tokens = await _context.EmailVerificationTokens
                .Where(evt => evt.UserId == userId && !evt.IsUsed)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.IsUsed = true;
            }

            await _context.SaveChangesAsync();
        }

        public async Task DeleteExpiredTokensAsync()
        {
            var expiredTokens = await _context.EmailVerificationTokens
                .Where(evt => evt.ExpiryDate < DateTime.UtcNow)
                .ToListAsync();

            _context.EmailVerificationTokens.RemoveRange(expiredTokens);
            await _context.SaveChangesAsync();
        }
    }

    // ===================== PASSWORD RESET TOKEN REPOSITORY =====================

    public class PasswordResetTokenRepository : GenericRepository<PasswordResetToken>, IPasswordResetTokenRepository
    {
        public PasswordResetTokenRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<PasswordResetToken?> GetByTokenAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return null;

            return await _context.PasswordResetTokens
                .Include(prt => prt.User)
                .FirstOrDefaultAsync(prt => prt.Token == token);
        }

        public async Task<PasswordResetToken?> GetActiveTokenByUserIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return null;

            return await _context.PasswordResetTokens
                .Where(prt => prt.UserId == userId 
                    && !prt.IsUsed 
                    && prt.ExpiryDate > DateTime.UtcNow)
                .OrderByDescending(prt => prt.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> IsValidTokenAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return false;

            return await _context.PasswordResetTokens
                .AnyAsync(prt => prt.Token == token 
                    && !prt.IsUsed 
                    && prt.ExpiryDate > DateTime.UtcNow);
        }

        public async Task MarkTokenAsUsedAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return;

            var resetToken = await _context.PasswordResetTokens
                .FirstOrDefaultAsync(prt => prt.Token == token);

            if (resetToken != null)
            {
                resetToken.IsUsed = true;
                await _context.SaveChangesAsync();
            }
        }

        public async Task InvalidateAllUserTokensAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                return;

            var tokens = await _context.PasswordResetTokens
                .Where(prt => prt.UserId == userId && !prt.IsUsed)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.IsUsed = true;
            }

            await _context.SaveChangesAsync();
        }

        public async Task DeleteExpiredTokensAsync()
        {
            var expiredTokens = await _context.PasswordResetTokens
                .Where(prt => prt.ExpiryDate < DateTime.UtcNow)
                .ToListAsync();

            _context.PasswordResetTokens.RemoveRange(expiredTokens);
            await _context.SaveChangesAsync();
        }
    }
}
