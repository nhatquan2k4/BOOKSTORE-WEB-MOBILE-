
using BookStore.Shared.Constants;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.API.Base
{
    [Route("api/[controller]")]
    [ApiController]
    public class ApiControllerBase : ControllerBase
    {
        /// <summary>
        /// Get current authenticated user's ID from JWT token
        /// </summary>
        protected Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("User ID not found in token");
            }

            return userId;
        }

        /// <summary>
        /// Xử lý Result<T> và trả về IActionResult tương ứng
        /// Sử dụng cho pattern Result<T> trong tương lai
        /// </summary>
        protected IActionResult HandleResult<T>(Result<T> result)
        {
            if (result.IsSuccess)
                return Ok(result.Value);

            return BadRequest(new { error = result.Error });
        }
    }
}
