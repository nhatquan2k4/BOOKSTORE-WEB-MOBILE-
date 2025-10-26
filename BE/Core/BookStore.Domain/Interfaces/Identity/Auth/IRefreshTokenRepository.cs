using BookStore.Domain.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Interfaces.Identity.Auth
{
    public interface IRefreshTokenRepository : IGenericRepository<RefreshToken>
    {
        Task<RefreshToken?> GetByTokenAsync(string token);
        Task<RefreshToken?> GetActiveTokenByUserIdAsync(Guid userId);
        Task<bool> IsValidTokenAsync(string token);
        Task RevokeTokenAsync(string token);
        Task RevokeAllByUserIdAsync(Guid userId);
    }
}
