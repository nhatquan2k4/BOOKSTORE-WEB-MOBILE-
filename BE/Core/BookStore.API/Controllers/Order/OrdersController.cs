using BookStore.Application.Dtos.Ordering;
using BookStore.Application.IService.Ordering;
using BookStore.API.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.API.Controllers.Order
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrdersController : ApiControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(
            IOrderService orderService,
            ILogger<OrdersController> logger)
        {
            _orderService = orderService;
            _logger = logger;
        }

        // ... Các phương thức GET (GetAllOrders, GetOrderById...) giữ nguyên ...
        // (Để tiết kiệm không gian, tôi chỉ liệt kê phần thay đổi quan trọng, bạn hãy giữ nguyên code cũ của các API GET)

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

        // POST: api/orders
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            var userId = GetCurrentUserId();
            // Always use authenticated user's ID from JWT token, ignore dto.UserId
            dto.UserId = userId;

            var order = await _orderService.CreateOrderAsync(dto);
            return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, order);
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
            var userId = GetCurrentUserId();
            // User Service will calculate price and create order securely
            var order = await _orderService.CreateRentalOrderAsync(userId, dto.BookId, dto.Days);
            
            return Ok(new 
            { 
                Success = true, 
                OrderId = order.Id, 
                OrderNumber = order.OrderNumber,
                Amount = order.FinalAmount,
                Message = "Tạo đơn thuê thành công, vui lòng thanh toán"
            });
        }

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

            var canCancel = await _orderService.CanCancelOrderAsync(id);
            if (!canCancel) return BadRequest(new { Message = "Đơn hàng không thể hủy" });

            dto.OrderId = id;
            var cancelledOrder = await _orderService.CancelOrderAsync(dto);
            return Ok(cancelledOrder);
        }

        [HttpPut("{id:guid}/confirm-payment")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ConfirmPayment(Guid id)
        {
            var order = await _orderService.ConfirmOrderPaymentAsync(id);
            return Ok(order);
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
        public int Days { get; set; } // 3, 7, 30...
    }

    public class ShipOrderDto { public string? Note { get; set; } }
    public class CompleteOrderDto { public string? Note { get; set; } }
}