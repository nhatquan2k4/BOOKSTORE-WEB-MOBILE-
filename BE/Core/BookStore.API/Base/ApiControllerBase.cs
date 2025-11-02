
using BookStore.Shared.Constants;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Base
{
    [Route("api/[controller]")]
    [ApiController]
    public class ApiControllerBase : ControllerBase
    {
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
