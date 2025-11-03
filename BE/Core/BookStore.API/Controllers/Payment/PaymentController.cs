using BookStore.Application.Dtos.Payment;
using BookStore.Application.IService.Payment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.API.Controllers.Payment
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        // GET: api/payment/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetPaymentById(Guid id)
        {
            var payment = await _paymentService.GetPaymentByIdAsync(id);
            if (payment == null)
                return NotFound(new { Message = "Payment not found" });

            return Ok(payment);
        }

        // GET: api/payment/order/{orderId}
        [HttpGet("order/{orderId:guid}")]
        public async Task<IActionResult> GetPaymentByOrderId(Guid orderId)
        {
            var payment = await _paymentService.GetPaymentByOrderIdAsync(orderId);
            if (payment == null)
                return NotFound(new { Message = "Payment not found for this order" });

            return Ok(payment);
        }

        // GET: api/payment/transaction/{transactionCode}
        [HttpGet("transaction/{transactionCode}")]
        public async Task<IActionResult> GetPaymentByTransactionCode(string transactionCode)
        {
            var payment = await _paymentService.GetPaymentByTransactionCodeAsync(transactionCode);
            if (payment == null)
                return NotFound(new { Message = "Payment not found with this transaction code" });

            return Ok(payment);
        }

        // GET: api/payment/by-provider
        [HttpGet("by-provider")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPaymentsByProvider(
            [FromQuery] string provider,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _paymentService.GetPaymentsByProviderAsync(provider, pageNumber, pageSize);
            
            return Ok(new
            {
                Items = result.Items,
                TotalCount = result.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)result.TotalCount / pageSize)
            });
        }

        // GET: api/payment/by-status
        [HttpGet("by-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPaymentsByStatus(
            [FromQuery] string status,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _paymentService.GetPaymentsByStatusAsync(status, pageNumber, pageSize);
            
            return Ok(new
            {
                Items = result.Items,
                TotalCount = result.TotalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)result.TotalCount / pageSize)
            });
        }

        // POST: api/payment
        [HttpPost]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentDto dto)
        {
            var payment = await _paymentService.CreatePaymentAsync(dto);
            return CreatedAtAction(nameof(GetPaymentById), new { id = payment.Id }, payment);
        }

        // POST: api/payment/for-order/{orderId}
        [HttpPost("for-order/{orderId:guid}")]
        public async Task<IActionResult> CreatePaymentForOrder(
            Guid orderId,
            [FromBody] CreatePaymentForOrderDto? dto = null)
        {
            var provider = dto?.Provider ?? "VietQR";
            var paymentMethod = dto?.PaymentMethod ?? "Online";

            var payment = await _paymentService.CreatePaymentForOrderAsync(orderId, provider, paymentMethod);
            return CreatedAtAction(nameof(GetPaymentById), new { id = payment.Id }, payment);
        }

        // PUT: api/payment/status
        [HttpPut("status")]
        public async Task<IActionResult> UpdatePaymentStatus([FromBody] UpdatePaymentStatusDto dto)
        {
            var payment = await _paymentService.UpdatePaymentStatusAsync(dto);
            return Ok(payment);
        }

        // POST: api/payment/callback
        [HttpPost("callback")]
        [AllowAnonymous] // Payment gateway callbacks don't have user authentication
        public async Task<IActionResult> ProcessPaymentCallback([FromBody] PaymentCallbackDto dto)
        {
            try
            {
                var payment = await _paymentService.ProcessPaymentCallbackAsync(dto);
                return Ok(new { Message = "Payment callback processed successfully", Payment = payment });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Failed to process payment callback", Error = ex.Message });
            }
        }

        // PUT: api/payment/{id}/mark-success
        [HttpPut("{id:guid}/mark-success")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> MarkPaymentAsSuccess(Guid id)
        {
            await _paymentService.MarkPaymentAsSuccessAsync(id);
            return Ok(new { Message = "Payment marked as successful" });
        }

        // PUT: api/payment/{id}/mark-failed
        [HttpPut("{id:guid}/mark-failed")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> MarkPaymentAsFailed(Guid id)
        {
            await _paymentService.MarkPaymentAsFailedAsync(id);
            return Ok(new { Message = "Payment marked as failed" });
        }

        // GET: api/payment/expired-pending
        [HttpGet("expired-pending")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetExpiredPendingPayments([FromQuery] int minutesThreshold = 15)
        {
            var payments = await _paymentService.GetExpiredPendingPaymentsAsync(minutesThreshold);
            return Ok(new 
            { 
                ExpiredPayments = payments,
                Count = payments.Count,
                ThresholdMinutes = minutesThreshold
            });
        }

        // POST: api/payment/cancel-expired
        [HttpPost("cancel-expired")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CancelExpiredPayments()
        {
            await _paymentService.CancelExpiredPaymentsAsync();
            return Ok(new { Message = "Expired pending payments have been cancelled" });
        }

        // GET: api/payment/statistics/by-provider
        [HttpGet("statistics/by-provider")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPaymentCountByProvider(
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var from = fromDate ?? DateTime.UtcNow.AddMonths(-1);
            var to = toDate ?? DateTime.UtcNow;

            var counts = await _paymentService.GetPaymentCountByProviderAsync(from, to);
            return Ok(new 
            { 
                PaymentCounts = counts,
                FromDate = from,
                ToDate = to
            });
        }

        // GET: api/payment/check-transaction/{transactionCode}
        [HttpGet("check-transaction/{transactionCode}")]
        public async Task<IActionResult> CheckTransactionExists(string transactionCode)
        {
            var exists = await _paymentService.IsTransactionCodeExistsAsync(transactionCode);
            return Ok(new { Exists = exists, TransactionCode = transactionCode });
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException("User not authenticated"));
        }
    }

    // Helper DTOs for specific endpoints
    public class CreatePaymentForOrderDto
    {
        public string Provider { get; set; } = "VietQR";
        public string PaymentMethod { get; set; } = "Online";
    }
}
