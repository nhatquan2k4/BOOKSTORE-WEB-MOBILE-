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


        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PriceDto>>> GetAllCurrentPrices()
        {
            var prices = await _priceService.GetAllCurrentPricesAsync();
            return Ok(prices);
        }

        [AllowAnonymous]
        [HttpGet("book/{bookId}")]
        public async Task<ActionResult<PriceDto>> GetCurrentPriceByBookId(Guid bookId)
        {
            var price = await _priceService.GetCurrentPriceByBookIdAsync(bookId);
            if (price == null)
                return NotFound(new { message = "Không tìm thấy giá hiện tại cho sách này" });

            return Ok(price);
        }

        [AllowAnonymous]
        [HttpGet("book/{bookId}/amount")]
        public async Task<ActionResult> GetCurrentPriceAmountByBookId(Guid bookId)
        {
            var price = await _priceService.GetCurrentPriceByBookIdAsync(bookId);
            if (price == null)
                return NotFound(new { message = "Không tìm thấy giá hiện tại cho sách này" });

            return Ok(new { price = price.Amount, currency = price.Currency ?? "VND" });
        }


        [HttpGet("book/{bookId}/history")]
        public async Task<ActionResult<IEnumerable<PriceDto>>> GetPriceHistory(Guid bookId)
        {
            var prices = await _priceService.GetPriceHistoryByBookIdAsync(bookId);
            return Ok(prices);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<PriceDto>> CreatePrice([FromBody] CreatePriceDto dto)
        {
            var price = await _priceService.CreatePriceAsync(dto);
            return Ok(price);
        }


        [Authorize]
        [HttpPut("book/{bookId}")]
        public async Task<ActionResult<PriceDto>> UpdatePrice(Guid bookId, [FromBody] UpdatePriceDto dto)
        {
            var price = await _priceService.UpdatePriceAsync(bookId, dto);
            if (price == null)
                return NotFound(new { message = "Không tìm thấy sách này" });

            return Ok(price);
        }


        [Authorize]
        [HttpPost("bulk-update")]
        public async Task<IActionResult> BulkUpdatePrices([FromBody] BulkUpdatePriceDto dto)
        {
            await _priceService.BulkUpdatePricesAsync(dto);
            return Ok(new { message = "Đã cập nhật giá thành công" });
        }
    }
}
