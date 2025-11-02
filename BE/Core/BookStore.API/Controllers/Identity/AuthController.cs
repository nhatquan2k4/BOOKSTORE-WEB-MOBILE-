using BookStore.Application.Dtos.Identity.Auth;
using BookStore.Application.IService.Identity.Auth;
using Microsoft.AspNetCore.Authorization;
using BookStore.API.Base;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ApiControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ITokenService _tokenService;
        private readonly IPasswordService _passwordService;

        public AuthController(
            IAuthService authService,
            ITokenService tokenService,
            IPasswordService passwordService)
        {
            _authService = authService;
            _tokenService = tokenService;
            _passwordService = passwordService;
        }

        /// <summary>
        /// Đăng nhập
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                var result = await _authService.LoginAsync(loginDto);
                return Ok(new
                {
                    Success = true,
                    Message = "Đăng nhập thành công",
                    Data = result
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi đăng nhập",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Đăng ký tài khoản mới
        /// </summary>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                var result = await _authService.RegisterAsync(registerDto);
                return Ok(new
                {
                    Success = true,
                    Message = "Đăng ký thành công",
                    Data = result
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi đăng ký",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Làm mới token
        /// </summary>
        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
        {
            try
            {
                var result = await _authService.RefreshTokenAsync(refreshTokenDto);
                return Ok(new
                {
                    Success = true,
                    Message = "Làm mới token thành công",
                    Data = result
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi làm mới token",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Đăng xuất
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var userIdClaim = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new
                    {
                        Success = false,
                        Message = "Token không hợp lệ"
                    });
                }

                await _authService.LogoutAsync(userId);
                return Ok(new
                {
                    Success = true,
                    Message = "Đăng xuất thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi đăng xuất",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Đăng xuất tất cả thiết bị
        /// </summary>
        [HttpPost("logout-all")]
        [Authorize]
        public async Task<IActionResult> LogoutAllDevices()
        {
            try
            {
                var userIdClaim = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new
                    {
                        Success = false,
                        Message = "Token không hợp lệ"
                    });
                }

                await _authService.LogoutAllDevicesAsync(userId);
                return Ok(new
                {
                    Success = true,
                    Message = "Đăng xuất tất cả thiết bị thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi đăng xuất",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Đổi mật khẩu
        /// </summary>
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            try
            {
                var userIdClaim = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new
                    {
                        Success = false,
                        Message = "Token không hợp lệ"
                    });
                }

                var result = await _authService.ChangePasswordAsync(userId, changePasswordDto);
                
                if (result.Success)
                {
                    return Ok(new
                    {
                        Success = true,
                        Message = result.Message,
                        Data = new { Username = result.Username }
                    });
                }
                
                return BadRequest(new
                {
                    Success = false,
                    Message = result.Message,
                    Error = result.Error
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi đổi mật khẩu",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Quên mật khẩu - Gửi email reset
        /// </summary>
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            try
            {
                var result = await _authService.ForgotPasswordAsync(forgotPasswordDto);
                return Ok(new
                {
                    Success = result.Success,
                    Message = result.Message
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Reset mật khẩu với token
        /// </summary>
        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            try
            {
                var result = await _authService.ResetPasswordAsync(resetPasswordDto);
                
                if (result.Success)
                {
                    return Ok(new
                    {
                        Success = true,
                        Message = result.Message
                    });
                }
                
                return BadRequest(new
                {
                    Success = false,
                    Message = result.Message
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Lấy thông tin user hiện tại
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new
                    {
                        Success = false,
                        Message = "Token không hợp lệ"
                    });
                }

                var userInfo = await _authService.GetCurrentUserInfoAsync(userId);
                
                if (userInfo == null)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Không tìm thấy thông tin người dùng"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Data = userInfo
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Test endpoint - Kiểm tra JWT protected route
        /// </summary>
        [HttpGet("test-protected")]
        [Authorize]
        public IActionResult TestProtectedRoute()
        {
            var userId = User.FindFirst("userId")?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value);
            var permissions = User.FindAll("permission").Select(c => c.Value);

            return Ok(new
            {
                Message = "You are authenticated!",
                UserId = userId,
                Email = email,
                Roles = roles,
                Permissions = permissions
            });
        }

        /// <summary>
        /// Test endpoint - Tạo JWT token
        /// </summary>
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
    }
}
