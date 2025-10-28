using BookStore.Application.IService.Identity.Auth;
using BookStore.Application.Settings;
using BookStore.Domain.IRepository.Identity.Auth;
using BookStore.Domain.Entities.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace BookStore.Application.Services.Identity.Auth
{
    public class TokenService : ITokenService
    {
        private readonly JwtSettings _jwtSettings;
        private readonly IRefreshTokenRepository _refreshTokenRepository;

        public TokenService(
            IOptions<JwtSettings> jwtSettings,
            IRefreshTokenRepository refreshTokenRepository)
        {
            _jwtSettings = jwtSettings.Value;
            _refreshTokenRepository = refreshTokenRepository;
        }

        public string GenerateAccessToken(Guid userId, string email, IEnumerable<string> roles, IEnumerable<string> permissions)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("userId", userId.ToString())
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            foreach (var permission in permissions)
            {
                claims.Add(new Claim("permission", permission));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public async Task<string> CreateRefreshTokenAsync(Guid userId, string refreshToken, int expiryDays = 30)
        {
            var token = new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Token = refreshToken,
                ExpiryDate = DateTime.UtcNow.AddDays(expiryDays),
                IsRevoked = false
            };

            await _refreshTokenRepository.AddAsync(token);
            await _refreshTokenRepository.SaveChangesAsync();

            return refreshToken;
        }

        public async Task<bool> ValidateRefreshTokenAsync(string refreshToken)
        {
            return await _refreshTokenRepository.IsValidTokenAsync(refreshToken);
        }

        public async Task<Guid?> GetUserIdFromRefreshTokenAsync(string refreshToken)
        {
            var token = await _refreshTokenRepository.GetByTokenAsync(refreshToken);
            return token?.UserId;
        }

        public async Task<bool> RevokeRefreshTokenAsync(string refreshToken)
        {
            var token = await _refreshTokenRepository.GetByTokenAsync(refreshToken);
            if (token == null) return false;

            await _refreshTokenRepository.RevokeTokenAsync(refreshToken);
            return true;
        }

        public async Task<bool> RevokeAllUserRefreshTokensAsync(Guid userId)
        {
            await _refreshTokenRepository.RevokeAllUserTokensAsync(userId);
            return true;
        }

        public async Task CleanupExpiredTokensAsync()
        {
            await _refreshTokenRepository.DeleteExpiredTokensAsync();
        }
    }
}
