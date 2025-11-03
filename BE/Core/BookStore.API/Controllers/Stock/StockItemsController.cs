using BookStore.Application.Dtos.Inventory;
using BookStore.Application.IService.Inventory;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StockItemsController : ControllerBase
    {
        private readonly IStockItemService _stockItemService;

        public StockItemsController(IStockItemService stockItemService)
        {
            _stockItemService = stockItemService;
        }

        /// <summary>
        /// Get stock by book ID and warehouse ID
        /// </summary>
        [HttpGet("book/{bookId}/warehouse/{warehouseId}")]
        public async Task<ActionResult<StockItemDto>> GetStock(Guid bookId, Guid warehouseId)
        {
            var stock = await _stockItemService.GetStockByBookAndWarehouseAsync(bookId, warehouseId);
            if (stock == null)
                return NotFound(new { message = "Stock not found" });

            return Ok(stock);
        }

        /// <summary>
        /// Get all stocks by book ID (across all warehouses)
        /// </summary>
        [HttpGet("book/{bookId}")]
        public async Task<ActionResult<IEnumerable<StockItemDto>>> GetStocksByBookId(Guid bookId)
        {
            var stocks = await _stockItemService.GetStocksByBookIdAsync(bookId);
            return Ok(stocks);
        }

        /// <summary>
        /// Get all stocks in a warehouse
        /// </summary>
        [HttpGet("warehouse/{warehouseId}")]
        public async Task<ActionResult<IEnumerable<StockItemDto>>> GetStocksByWarehouseId(Guid warehouseId)
        {
            var stocks = await _stockItemService.GetStocksByWarehouseIdAsync(warehouseId);
            return Ok(stocks);
        }

        /// <summary>
        /// Get low stock items (Admin only)
        /// </summary>
        [HttpGet("low-stock")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<StockItemDto>>> GetLowStockItems([FromQuery] int threshold = 10)
        {
            var stocks = await _stockItemService.GetLowStockItemsAsync(threshold);
            return Ok(stocks);
        }

        /// <summary>
        /// Get out of stock items (Admin only)
        /// </summary>
        [HttpGet("out-of-stock")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<StockItemDto>>> GetOutOfStockItems()
        {
            var stocks = await _stockItemService.GetOutOfStockItemsAsync();
            return Ok(stocks);
        }

        /// <summary>
        /// Create stock item (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<StockItemDto>> CreateStockItem([FromBody] CreateStockItemDto dto)
        {
            var stock = await _stockItemService.CreateStockItemAsync(dto);
            return Ok(stock);
        }

        /// <summary>
        /// Update stock quantity (Admin only)
        /// </summary>
        [HttpPut("book/{bookId}/warehouse/{warehouseId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<StockItemDto>> UpdateStockQuantity(
            Guid bookId, 
            Guid warehouseId, 
            [FromBody] UpdateStockQuantityDto dto)
        {
            var stock = await _stockItemService.UpdateStockQuantityAsync(bookId, warehouseId, dto);
            if (stock == null)
                return NotFound(new { message = "Stock not found" });

            return Ok(stock);
        }

        /// <summary>
        /// Reserve stock for an order (Admin only)
        /// </summary>
        [HttpPost("reserve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ReserveStock([FromBody] ReserveStockDto dto)
        {
            try
            {
                await _stockItemService.ReserveStockAsync(dto);
                return Ok(new { message = "Stock reserved successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Release reserved stock (Admin only)
        /// </summary>
        [HttpPost("release")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ReleaseReservedStock(
            [FromQuery] Guid bookId, 
            [FromQuery] Guid warehouseId, 
            [FromQuery] int quantity)
        {
            try
            {
                await _stockItemService.ReleaseReservedStockAsync(bookId, warehouseId, quantity);
                return Ok(new { message = "Reserved stock released successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Confirm sale (Admin only)
        /// </summary>
        [HttpPost("confirm-sale")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ConfirmSale(
            [FromQuery] Guid bookId, 
            [FromQuery] Guid warehouseId, 
            [FromQuery] int quantity)
        {
            try
            {
                await _stockItemService.ConfirmSaleAsync(bookId, warehouseId, quantity);
                return Ok(new { message = "Sale confirmed successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
