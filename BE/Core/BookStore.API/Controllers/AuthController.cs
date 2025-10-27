using BookStore.Application.Dtos.Identity.Auth;
using BookStore.Application.IService.Identity.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ITokenService _tokenService;
        private readonly IPasswordService _passwordService;

        public AuthController(
            ITokenService tokenService,
            IPasswordService passwordService)
        {
            _tokenService = tokenService;
            _passwordService = passwordService;
        }

        [HttpPost("test-generate-token")]
        [AllowAnonymous]
        public IActionResult TestGenerateToken()
        {
            var userId = Guid.NewGuid();
            var email = "test@example.com";
            var roles = new[] { "Admin", "User" };
            var permissions = new[] { "Read", "Write", "Delete" };

            var accessToken = _tokenService.GenerateAccessToken(userId, email, roles, permissions);
            var refreshToken = _tokenService.GenerateRefreshToken();

            return Ok(new
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                Message = "JWT Token generated successfully!"
            });
        }

        [HttpGet("test-protected")]
        [Authorize]
        public IActionResult TestProtectedRoute()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var roles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value);

            return Ok(new
            {
                Message = "You are authenticated!",
                UserId = userId,
                Email = email,
                Roles = roles
            });
        }

        [HttpPost("test-hash-password")]
        [AllowAnonymous]
        public IActionResult TestHashPassword([FromBody] string password)
        {
            var hash = _passwordService.HashPassword(password);
            var isValid = _passwordService.VerifyPassword(password, hash);
            var isStrong = _passwordService.ValidatePasswordStrength(password);

            return Ok(new
            {
                OriginalPassword = password,
                HashedPassword = hash,
                IsValid = isValid,
                IsStrong = isStrong
            });
        }
    }
}
