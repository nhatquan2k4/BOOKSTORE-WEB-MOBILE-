using BookStore.Application.Dtos.Cart;
using BookStore.Application.IService.Cart;
using BookStore.Shared.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.API.Controllers.Cart
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        // GET: api/cart
        [HttpGet]
        public async Task<IActionResult> GetMyCart()
        {
            var userId = GetCurrentUserId();
            var cart = await _cartService.GetActiveCartByUserIdAsync(userId);

            if (cart == null)
                return Ok(new { Message = "Giỏ hàng trống", Cart = (CartDto?)null });

            return Ok(cart);
        }

        // GET: api/cart/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetCartById(Guid id)
        {
            var userId = GetCurrentUserId();
            var cart = await _cartService.GetCartByIdAsync(id);

            if (cart == null)
                return NotFound(new { Message = "Không tìm thấy giỏ hàng" });

            // Check authorization: user can only see their own cart
            if (cart.UserId != userId && !User.IsInRole("Admin"))
                return Forbid();

            return Ok(cart);
        }

        // GET: api/cart/count
        [HttpGet("count")]
        public async Task<IActionResult> GetCartItemCount()
        {
            var userId = GetCurrentUserId();
            var count = await _cartService.GetCartItemCountAsync(userId);
            return Ok(new { ItemCount = count });
        }

        // GET: api/cart/total
        [HttpGet("total")]
        public async Task<IActionResult> GetCartTotal()
        {
            var userId = GetCurrentUserId();
            var total = await _cartService.GetCartTotalAsync(userId);
            return Ok(new { TotalAmount = total });
        }

        // POST: api/cart/add
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                dto.UserId = userId; // Ensure user can only add to their own cart

                var cart = await _cartService.AddToCartAsync(dto);
                return Ok(cart);
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng", details = ex.Message });
            }
        }

        // PUT: api/cart/update-quantity
        [HttpPut("update-quantity")]
        public async Task<IActionResult> UpdateCartItemQuantity([FromBody] UpdateCartItemDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                dto.UserId = userId; // Ensure user can only update their own cart

                var cart = await _cartService.UpdateCartItemQuantityAsync(dto);
                return Ok(cart);
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi cập nhật số lượng", details = ex.Message });
            }
        }

        // DELETE: api/cart/remove
        [HttpDelete("remove")]
        public async Task<IActionResult> RemoveFromCart([FromBody] RemoveFromCartDto dto)
        {
            var userId = GetCurrentUserId();
            dto.UserId = userId; // Ensure user can only remove from their own cart

            var cart = await _cartService.RemoveFromCartAsync(dto);
            return Ok(cart);
        }

        // DELETE: api/cart/clear
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetCurrentUserId();
            var dto = new ClearCartDto { UserId = userId };

            var cart = await _cartService.ClearCartAsync(dto);
            return Ok(new { Message = "Đã xóa giỏ hàng thành công", Cart = cart });
        }

        // GET: api/cart/validate-checkout
        [HttpGet("validate-checkout")]
        public async Task<IActionResult> ValidateCheckout()
        {
            var userId = GetCurrentUserId();
            var isValid = await _cartService.ValidateCartForCheckoutAsync(userId);

            return Ok(new
            {
                IsValid = isValid,
                Message = isValid
                    ? "Giỏ hàng đã sẵn sàng để thanh toán"
                    : "Giỏ hàng không hợp lệ để thanh toán. Vui lòng kiểm tra các mặt hàng trong giỏ."
            });
        }

        // POST: api/cart/cleanup-stale
        [HttpPost("cleanup-stale")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CleanupStaleCarts([FromQuery] int daysThreshold = 30)
        {
            await _cartService.CleanupStaleCartsAsync(daysThreshold);
            return Ok(new { Message = $"Đã xóa giỏ hàng cũ hơn {daysThreshold} ngày" });
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException("Người dùng chưa đăng nhập"));
        }
    }
}


