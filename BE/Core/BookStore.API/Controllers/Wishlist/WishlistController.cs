using BookStore.Application.Dtos.Catalog.Wishlist;
using BookStore.Application.IService.Catalog;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.API.Controllers.Wishlist
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;
        private readonly ILogger<WishlistController> _logger;

        public WishlistController(
            IWishlistService wishlistService,
            ILogger<WishlistController> logger)
        {
            _wishlistService = wishlistService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyWishlist()
        {
            var userId = GetCurrentUserId();
            var wishlist = await _wishlistService.GetUserWishlistAsync(userId);
            return Ok(wishlist);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetWishlistCount()
        {
            var userId = GetCurrentUserId();
            var count = await _wishlistService.GetWishlistCountAsync(userId);
            return Ok(new { Count = count });
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetWishlistSummary()
        {
            var userId = GetCurrentUserId();
            var summary = await _wishlistService.GetWishlistSummaryAsync(userId);
            return Ok(summary);
        }

        [HttpGet("{bookId:guid}/exists")]
        public async Task<IActionResult> CheckBookInWishlist(Guid bookId)
        {
            var userId = GetCurrentUserId();
            var exists = await _wishlistService.IsBookInWishlistAsync(userId, bookId);
            return Ok(new { Exists = exists });
        }

        [HttpPost("{bookId:guid}")]
        public async Task<IActionResult> AddToWishlist(Guid bookId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var wishlistItem = await _wishlistService.AddToWishlistAsync(userId, bookId);
                return Ok(new
                {
                    Message = "Đã thêm vào danh sách yêu thích",
                    Data = wishlistItem
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding book {BookId} to wishlist", bookId);
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("{bookId:guid}")]
        public async Task<IActionResult> RemoveFromWishlist(Guid bookId)
        {
            var userId = GetCurrentUserId();
            var result = await _wishlistService.RemoveFromWishlistAsync(userId, bookId);

            if (!result)
                return NotFound(new { Message = "Sách không có trong danh sách yêu thích" });

            return Ok(new { Message = "Đã xóa khỏi danh sách yêu thích" });
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearWishlist()
        {
            var userId = GetCurrentUserId();
            await _wishlistService.ClearWishlistAsync(userId);
            return Ok(new { Message = "Đã xóa toàn bộ danh sách yêu thích" });
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("User not authenticated");
            }
            return userId;
        }
    }
}
