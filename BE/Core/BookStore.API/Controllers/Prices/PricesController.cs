using BookStore.Application.Dtos.Inventory;
using BookStore.Application.IService.Inventory;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PricesController : ControllerBase
    {
        private readonly IPriceService _priceService;

        public PricesController(IPriceService priceService)
        {
            _priceService = priceService;
        }

        /// <summary>
        /// Get all current prices
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PriceDto>>> GetAllCurrentPrices()
        {
            var prices = await _priceService.GetAllCurrentPricesAsync();
            return Ok(prices);
        }

        /// <summary>
        /// Get current price by book ID
        /// </summary>
        [HttpGet("book/{bookId}")]
        public async Task<ActionResult<PriceDto>> GetCurrentPriceByBookId(Guid bookId)
        {
            var price = await _priceService.GetCurrentPriceByBookIdAsync(bookId);
            if (price == null)
                return NotFound(new { message = "Không tìm thấy giá hiện tại cho sách này" });

            return Ok(price);
        }

        /// <summary>
        /// Get price history by book ID
        /// </summary>
        [HttpGet("book/{bookId}/history")]
        public async Task<ActionResult<IEnumerable<PriceDto>>> GetPriceHistory(Guid bookId)
        {
            var prices = await _priceService.GetPriceHistoryByBookIdAsync(bookId);
            return Ok(prices);
        }

        /// <summary>
        /// Create/Update price for a book (Admin only)
        /// </summary>
        [HttpPost]
        // [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PriceDto>> CreatePrice([FromBody] CreatePriceDto dto)
        {
            var price = await _priceService.CreatePriceAsync(dto);
            return Ok(price);
        }

        /// <summary>
        /// Update price for a book (Admin only)
        /// </summary>
        [HttpPut("book/{bookId}")]
        // [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PriceDto>> UpdatePrice(Guid bookId, [FromBody] UpdatePriceDto dto)
        {
            var price = await _priceService.UpdatePriceAsync(bookId, dto);
            if (price == null)
                return NotFound(new { message = "Không tìm thấy sách này" });

            return Ok(price);
        }

        /// <summary>
        /// Bulk update prices (Admin only)
        /// </summary>
        [HttpPost("bulk-update")]
        // [Authorize(Roles = "Admin")]
        public async Task<IActionResult> BulkUpdatePrices([FromBody] BulkUpdatePriceDto dto)
        {
            await _priceService.BulkUpdatePricesAsync(dto);
            return Ok(new { message = "Đã cập nhật giá thành công" });
        }
    }
}
