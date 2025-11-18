using BookStore.API.Base;
using BookStore.Application.Dtos.Inventory;
using BookStore.Application.IService.Inventory;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers.Stock
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryTransactionsController : ApiControllerBase
    {
        private readonly IInventoryTransactionService _transactionService;
        private readonly ILogger<InventoryTransactionsController> _logger;

        public InventoryTransactionsController(
            IInventoryTransactionService transactionService,
            ILogger<InventoryTransactionsController> logger)
        {
            _transactionService = transactionService;
            _logger = logger;
        }

        /// <summary>
        /// Get inventory transaction history with filters
        /// </summary>
        /// <remarks>
        /// Example request:
        /// 
        ///     GET /api/inventorytransactions?warehouseId=xxx&bookId=xxx&type=Inbound&fromDate=2024-01-01&toDate=2024-12-31&pageNumber=1&pageSize=20
        ///     
        /// Type values: Inbound (nhập kho), Outbound (xuất kho), Adjustment (điều chỉnh)
        /// </remarks>
        [HttpGet]
        public async Task<IActionResult> GetTransactionHistory([FromQuery] InventoryTransactionFilterDto filter)
        {
            try
            {
                var result = await _transactionService.GetFilteredTransactionsAsync(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inventory transaction history");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get transaction history by warehouse
        /// </summary>
        [HttpGet("warehouse/{warehouseId}")]
        public async Task<IActionResult> GetByWarehouse(
            Guid warehouseId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var transactions = await _transactionService.GetByWarehouseIdAsync(warehouseId, pageNumber, pageSize);
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions for warehouse {WarehouseId}", warehouseId);
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get transaction history by book
        /// </summary>
        [HttpGet("book/{bookId}")]
        public async Task<IActionResult> GetByBook(
            Guid bookId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var transactions = await _transactionService.GetByBookIdAsync(bookId, pageNumber, pageSize);
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions for book {BookId}", bookId);
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get transaction history by warehouse and book
        /// </summary>
        [HttpGet("warehouse/{warehouseId}/book/{bookId}")]
        public async Task<IActionResult> GetByWarehouseAndBook(
            Guid warehouseId,
            Guid bookId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var transactions = await _transactionService.GetByWarehouseAndBookAsync(warehouseId, bookId, pageNumber, pageSize);
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions for warehouse {WarehouseId} and book {BookId}", warehouseId, bookId);
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Create inventory transaction manually (Admin only)
        /// </summary>
        /// <remarks>
        /// Example request:
        /// 
        ///     POST /api/inventorytransactions
        ///     {
        ///       "warehouseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        ///       "bookId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        ///       "type": "Inbound",
        ///       "quantityChange": 100,
        ///       "referenceId": "PO-12345",
        ///       "note": "Nhập kho từ nhà cung cấp"
        ///     }
        ///     
        /// Type values: 
        /// - Inbound: Nhập kho (quantityChange phải > 0)
        /// - Outbound: Xuất kho (quantityChange phải &lt; 0)
        /// - Adjustment: Điều chỉnh tồn
        /// </remarks>
        [HttpPost]
        // [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateTransaction([FromBody] CreateInventoryTransactionDto dto)
        {
            try
            {
                var transaction = await _transactionService.CreateTransactionAsync(dto);
                return Ok(transaction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating inventory transaction");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
