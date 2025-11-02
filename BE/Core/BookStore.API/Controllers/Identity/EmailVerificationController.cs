using BookStore.Application.IService.Identity;
using Microsoft.AspNetCore.Authorization;
using BookStore.API.Base;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailVerificationController : ApiControllerBase
    {
        private readonly IEmailVerificationService _emailVerificationService;

        public EmailVerificationController(IEmailVerificationService emailVerificationService)
        {
            _emailVerificationService = emailVerificationService;
        }

        /// <summary>
        /// Verify email with token
        /// </summary>
        [HttpPost("verify")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Token))
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Token không được để trống"
                    });
                }

                var result = await _emailVerificationService.VerifyEmailAsync(request.Token);

                if (!result)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Token không hợp lệ hoặc đã hết hạn"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Xác minh email thành công! Tài khoản của bạn đã được kích hoạt."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi xác minh email",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Resend verification email
        /// </summary>
        [HttpPost("resend")]
        public async Task<IActionResult> ResendVerificationEmail([FromBody] ResendVerificationRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Email))
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Email không được để trống"
                    });
                }

                var result = await _emailVerificationService.ResendVerificationEmailAsync(request.Email);

                if (!result)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Email không tồn tại hoặc đã được xác minh"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Email xác minh đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Đã xảy ra lỗi khi gửi email",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Check if email is verified
        /// </summary>
        [HttpGet("status/{userId}")]
        [Authorize]
        public async Task<IActionResult> CheckVerificationStatus(Guid userId)
        {
            try
            {
                var isVerified = await _emailVerificationService.IsEmailVerifiedAsync(userId);

                return Ok(new
                {
                    Success = true,
                    Data = new
                    {
                        IsVerified = isVerified
                    }
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
    }

    public class VerifyEmailRequest
    {
        public string Token { get; set; } = null!;
    }

    public class ResendVerificationRequest
    {
        public string Email { get; set; } = null!;
    }
}
