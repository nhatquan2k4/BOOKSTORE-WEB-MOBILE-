using BookStore.Application.Dtos.Ordering;
using BookStore.Application.IService.Ordering;
using BookStore.Application.IService.Checkout;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.API.Controllers.Order
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ICheckoutService _checkoutService;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(
            IOrderService orderService,
            ICheckoutService checkoutService,
            ILogger<OrdersController> logger)
        {
            _orderService = orderService;
            _checkoutService = checkoutService;
            _logger = logger;
        }

        #region Query Methods

        // GET: api/orders
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllOrders(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? status = null)
        {
            var result = await _orderService.GetAllOrdersAsync(pageNumber, pageSize, status);
            return Ok(new
            {
                Items = result.Items,
                TotalCount = result.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)result.TotalCount / pageSize)
            });
        }

        // GET: api/orders/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetOrderById(Guid id)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var order = await _orderService.GetOrderByIdAsync(id);
            if (order == null)
                return NotFound(new { Message = "Đơn hàng không tồn tại" });

            if (!isAdmin && order.UserId != userId)
                return Forbid();

            return Ok(order);
        }

        // GET: api/orders/order-number/{orderNumber}
        [HttpGet("order-number/{orderNumber}")]
        public async Task<IActionResult> GetOrderByOrderNumber(string orderNumber)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var order = await _orderService.GetOrderByOrderNumberAsync(orderNumber);
            if (order == null)
                return NotFound(new { Message = "Không tìm thấy đơn hàng" });

            if (!isAdmin && order.UserId != userId)
                return Forbid();

            return Ok(order);
        }

        // GET: api/orders/my-orders
        [HttpGet("my-orders")]
        public async Task<IActionResult> GetMyOrders(
            [FromQuery] string? status = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var userId = GetCurrentUserId();
            var result = await _orderService.GetOrdersByUserIdAsync(userId, status, pageNumber, pageSize);

            return Ok(new
            {
                Items = result.Items,
                TotalCount = result.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)result.TotalCount / pageSize)
            });
        }

        // GET: api/orders/user/{userId}
        [HttpGet("user/{userId:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetOrdersByUserId(
            Guid userId,
            [FromQuery] string? status = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _orderService.GetOrdersByUserIdAsync(userId, status, pageNumber, pageSize);

            return Ok(new
            {
                Items = result.Items,
                TotalCount = result.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)result.TotalCount / pageSize)
            });
        }

        // GET: api/orders/{id:guid}/status-history
        [HttpGet("{id:guid}/status-history")]
        public async Task<IActionResult> GetOrderStatusHistory(Guid id)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");
            var order = await _orderService.GetOrderByIdAsync(id);

            if (order == null) return NotFound(new { Message = "Không tìm thấy đơn hàng" });
            if (!isAdmin && order.UserId != userId) return Forbid();

            var history = await _orderService.GetOrderStatusHistoryAsync(id);
            return Ok(history);
        }

        // GET: api/orders/available-for-shipping - Shipper lấy danh sách đơn đã xác nhận
        [HttpGet("available-for-shipping")]
        [Authorize(Roles = "Shipper,Admin")]
        public async Task<IActionResult> GetAvailableOrdersForShipping(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100)
        {
            try
            {
                // Lấy tất cả đơn có status = "Confirmed" (sẵn sàng giao)
                var result = await _orderService.GetAllOrdersAsync(pageNumber, pageSize, "Confirmed");

                return Ok(new
                {
                    Items = result.Items,
                    TotalCount = result.TotalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)result.TotalCount / pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available orders for shipping");
                return StatusCode(500, new { Message = "Lỗi khi lấy danh sách đơn hàng" });
            }
        }

        // GET: api/orders/my-shipping-orders - Shipper lấy danh sách đơn đang giao của mình
        [HttpGet("my-shipping-orders")]
        [Authorize(Roles = "Shipper,Admin")]
        public async Task<IActionResult> GetMyShippingOrders(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100)
        {
            try
            {
                // TODO: Sau này có thể thêm logic filter theo ShipperId nếu cần
                // Hiện tại lấy tất cả đơn đang giao (status = "Shipping")
                var result = await _orderService.GetAllOrdersAsync(pageNumber, pageSize, "Shipping");

                return Ok(new
                {
                    Items = result.Items,
                    TotalCount = result.TotalCount,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)result.TotalCount / pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting my shipping orders");
                return StatusCode(500, new { Message = "Lỗi khi lấy danh sách đơn hàng" });
            }
        }

        #endregion

        #region Create Operations

        // POST: api/orders
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            try
            {
                _logger.LogInformation("[OrdersController] ===== BẮT ĐẦU TẠO ĐƠN HÀNG =====");
                _logger.LogInformation($"[OrdersController] User from token: {User?.Identity?.Name}");
                _logger.LogInformation($"[OrdersController] UserId from dto: {dto.UserId}");
                _logger.LogInformation($"[OrdersController] Number of items: {dto.Items?.Count ?? 0}");

                if (dto.Items != null)
                {
                    foreach (var item in dto.Items)
                    {
                        _logger.LogInformation($"[OrdersController] Item: BookId={item.BookId}, Qty={item.Quantity}, Price={item.UnitPrice}");
                    }
                }

                var userId = GetCurrentUserId();
                _logger.LogInformation($"[OrdersController] Current UserId from JWT: {userId}");

                // Override UserId with JWT token user ID for security
                dto.UserId = userId;
                _logger.LogInformation($"[OrdersController] UserId overridden with JWT token userId: {userId}");

                var order = await _orderService.CreateOrderAsync(dto);

                _logger.LogInformation($"[OrdersController] ✅ Order created successfully: {order.OrderNumber}");

                return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[OrdersController] ❌ Error creating order");
                _logger.LogError($"[OrdersController] Error message: {ex.Message}");
                _logger.LogError($"[OrdersController] Stack trace: {ex.StackTrace}");

                if (ex.InnerException != null)
                {
                    _logger.LogError($"[OrdersController] Inner exception: {ex.InnerException.Message}");
                }

                return StatusCode(500, new
                {
                    message = ex.Message,
                    error = "Internal server error",
                    details = ex.InnerException?.Message
                });
            }
        }

        // POST: api/orders/from-cart
        [HttpPost("from-cart")]
        public async Task<IActionResult> CreateOrderFromCart([FromBody] CreateOrderFromCartDto dto)
        {
            var userId = GetCurrentUserId();
            var order = await _orderService.CreateOrderFromCartAsync(userId, dto.Address, dto.CouponId);
            return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, order);
        }

        // --- NEW: POST: api/orders/rental ---
        [HttpPost("rental")]
        public async Task<IActionResult> CreateRentalOrder([FromBody] CreateRentalOrderDto dto)
        {
            try
            {
                _logger.LogInformation(" [CreateRentalOrder] Request received - BookId: {BookId}, RentalPlanId: {RentalPlanId}, Days: {Days}",
                    dto.BookId, dto.RentalPlanId, dto.Days);

                var userId = GetCurrentUserId();
                _logger.LogInformation(" [CreateRentalOrder] UserId: {UserId}", userId);

                // Ưu tiên dùng RentalPlanId nếu có, fallback sang Days
                var order = dto.RentalPlanId.HasValue
                    ? await _orderService.CreateRentalOrderByPlanIdAsync(userId, dto.BookId, dto.RentalPlanId.Value)
                    : await _orderService.CreateRentalOrderAsync(userId, dto.BookId, dto.Days);

                _logger.LogInformation(" [CreateRentalOrder] Order created successfully - OrderId: {OrderId}, Amount: {Amount}", order.Id, order.FinalAmount);

                return Ok(new
                {
                    Success = true,
                    OrderId = order.Id,
                    OrderNumber = order.OrderNumber,
                    Amount = order.FinalAmount,
                    Message = "Tạo đơn thuê thành công, vui lòng thanh toán"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, " [CreateRentalOrder] Error creating rental order - BookId: {BookId}, Days: {Days}", dto.BookId, dto.Days);
                return StatusCode(500, new { Message = "Lỗi tạo đơn thuê: " + ex.Message });
            }
        }

        #endregion

        #region Update Operations

        // ... Các phương thức PUT (Status, Cancel, Payment...) giữ nguyên ...
        [HttpPut("status")]
        public async Task<IActionResult> UpdateOrderStatus([FromBody] UpdateOrderStatusDto dto)
        {
            var order = await _orderService.UpdateOrderStatusAsync(dto);
            return Ok(order);
        }

        [HttpPut("{id:guid}/cancel")]
        public async Task<IActionResult> CancelOrder(Guid id, [FromBody] CancelOrderDto dto)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");
            var order = await _orderService.GetOrderByIdAsync(id);

            if (order == null) return NotFound(new { Message = "Không tìm thấy đơn hàng" });
            if (!isAdmin && order.UserId != userId) return Forbid();

            // Sử dụng CheckoutService để hủy order (bao gồm cả logic release stock)
            var success = await _checkoutService.CancelCheckoutAsync(id, userId);

            if (!success)
            {
                return BadRequest(new { Message = "Không thể hủy đơn hàng (đã thanh toán hoặc đang giao)" });
            }

            // Lấy lại order đã được cập nhật
            var cancelledOrder = await _orderService.GetOrderByIdAsync(id);
            return Ok(cancelledOrder);
        }

        [HttpPut("{id:guid}/confirm-payment")]
        // Allow Admin and Shipper to confirm payment (shipper may confirm COD collection)
        [Authorize(Roles = "Admin,Shipper")]
        public async Task<IActionResult> ConfirmPayment(Guid id)
        {
            var order = await _orderService.ConfirmOrderPaymentAsync(id);
            return Ok(order);
        }

        // New endpoint for users to confirm their own payment (for testing/development)
        [HttpPut("my-order/{orderNumber}/confirm-payment")]
        public async Task<IActionResult> ConfirmMyPayment(string orderNumber)
        {
            var userId = GetCurrentUserId();

            // Get order by order number
            var order = await _orderService.GetOrderByOrderNumberAsync(orderNumber);
            if (order == null)
                return NotFound(new { Message = "Không tìm thấy đơn hàng" });

            // Check if user owns this order
            if (order.UserId != userId)
                return Forbid();

            // Confirm payment
            var confirmedOrder = await _orderService.ConfirmOrderPaymentAsync(order.Id);
            return Ok(confirmedOrder);
        }

        [HttpPut("{id:guid}/ship")]
        [Authorize(Roles = "Admin,Shipper")]
        public async Task<IActionResult> ShipOrder(Guid id, [FromBody] ShipOrderDto? dto = null)
        {
            var order = await _orderService.ShipOrderAsync(id, dto?.Note);
            return Ok(order);
        }

        [HttpPut("{id:guid}/complete")]
        [Authorize(Roles = "Admin,Shipper")]
        public async Task<IActionResult> CompleteOrder(Guid id, [FromBody] CompleteOrderDto? dto = null)
        {
            var order = await _orderService.CompleteOrderAsync(id, dto?.Note);
            return Ok(order);
        }

        #endregion

        #region Statistics

        // ... Statistics endpoints giữ nguyên ...
        [HttpGet("statistics/revenue")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetTotalRevenue([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var from = fromDate ?? DateTime.UtcNow.AddMonths(-1);
            var to = toDate ?? DateTime.UtcNow;
            var revenue = await _orderService.GetTotalRevenueAsync(from, to);
            return Ok(new { TotalRevenue = revenue, FromDate = from, ToDate = to });
        }

        [HttpGet("statistics/count")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetTotalOrdersCount([FromQuery] string? status = null)
        {
            var count = await _orderService.GetTotalOrdersCountAsync(status);
            return Ok(new { TotalOrders = count, Status = status ?? "All" });
        }

        [HttpGet("statistics/by-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetOrdersCountByStatus()
        {
            var counts = await _orderService.GetOrdersCountByStatusAsync();
            return Ok(counts);
        }

        #endregion

        #region Utility Methods

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException("Người dùng chưa đăng nhập"));
        }

        #endregion
    }

    // Helper DTOs
    public class CreateOrderFromCartDto
    {
        public CreateOrderAddressDto Address { get; set; } = new();
        public Guid? CouponId { get; set; }
    }

    public class CreateRentalOrderDto
    {
        public Guid BookId { get; set; }
        public Guid? RentalPlanId { get; set; } // ID gói thuê user chọn (ưu tiên)
        public int Days { get; set; } // 3, 7, 30... (backup nếu không có RentalPlanId)
    }

    public class ShipOrderDto { public string? Note { get; set; } }
    public class CompleteOrderDto { public string? Note { get; set; } }
}