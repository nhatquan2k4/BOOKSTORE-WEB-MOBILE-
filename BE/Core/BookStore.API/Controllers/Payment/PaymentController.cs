using BookStore.Application.Dtos.Payment;
using BookStore.Application.IService.Payment;
using BookStore.API.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Security.Claims;

namespace BookStore.API.Controllers.Payment
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly PaymentSettings _paymentSettings;

        public PaymentController(
            IPaymentService paymentService,
            IOptions<PaymentSettings> paymentSettings)
        {
            _paymentService = paymentService;
            _paymentSettings = paymentSettings.Value;
        }

        // GET: api/payment/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetPaymentById(Guid id)
        {
            var payment = await _paymentService.GetPaymentByIdAsync(id);
            if (payment == null)
                return NotFound(new { Message = "Không tìm thấy thanh toán" });

            return Ok(payment);
        }

        // GET: api/payment/order/{orderId}
        [HttpGet("order/{orderId:guid}")]
        public async Task<IActionResult> GetPaymentByOrderId(Guid orderId)
        {
            var payment = await _paymentService.GetPaymentByOrderIdAsync(orderId);
            if (payment == null)
                return NotFound(new { Message = "Không tìm thấy thanh toán cho đơn hàng này" });

            return Ok(payment);
        }

        // GET: api/payment/transaction/{transactionCode}
        [HttpGet("transaction/{transactionCode}")]
        public async Task<IActionResult> GetPaymentByTransactionCode(string transactionCode)
        {
            var payment = await _paymentService.GetPaymentByTransactionCodeAsync(transactionCode);
            if (payment == null)
                return NotFound(new { Message = "Không tìm thấy thanh toán với mã giao dịch này" });

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

        // --- ĐOẠN SỬA CHỮA QUAN TRỌNG: CREATE QR ---
        // POST: api/payment/qr
        [HttpPost("qr")]
        public IActionResult CreateQRPayment([FromBody] CreateQRPaymentRequestDto dto)
        {
            try
            {
                Console.WriteLine($"=== CreateQRPayment Called ===");
                Console.WriteLine($"OrderId: {dto.OrderId}"); // OrderId giờ là string
                Console.WriteLine($"Amount: {dto.Amount}");
                Console.WriteLine($"Description: {dto.Description}");

                // Get bank configuration from appsettings
                var vietQR = _paymentSettings.VietQR;
                
                Console.WriteLine($"Bank Config - Code: {vietQR.BankCode}, Account: {vietQR.AccountNumber}");

                // Validate input (SỬA: Kiểm tra string null thay vì Guid.Empty)
                if (string.IsNullOrEmpty(dto.OrderId) || dto.Amount <= 0)
                {
                    Console.WriteLine($"Validation failed - OrderId: {dto.OrderId}, Amount: {dto.Amount}");
                    return BadRequest(new { Message = "Thông tin thanh toán không hợp lệ" });
                }

                // Validate settings
                if (string.IsNullOrWhiteSpace(vietQR.BankCode) || 
                    string.IsNullOrWhiteSpace(vietQR.AccountNumber) || 
                    string.IsNullOrWhiteSpace(vietQR.AccountName))
                {
                    Console.WriteLine("❌ Payment settings not configured properly!");
                    return StatusCode(500, new { Message = "Cấu hình thanh toán chưa được thiết lập" });
                }

                // Generate transfer content
                var transferContent = dto.Description;
                if (string.IsNullOrEmpty(transferContent))
                {
                    transferContent = $"MUA {dto.OrderId}";
                }

                // Create VietQR URL
                var qrCodeUrl = $"https://img.vietqr.io/image/{vietQR.BankCode}-{vietQR.AccountNumber}-{vietQR.Template}.jpg?amount={dto.Amount}&addInfo={Uri.EscapeDataString(transferContent)}&accountName={Uri.EscapeDataString(vietQR.AccountName)}";

                var response = new CreateQRPaymentResponseDto
                {
                    Success = true,
                    QrCodeUrl = qrCodeUrl,
                    OrderId = dto.OrderId, // Giữ nguyên string
                    AccountNumber = vietQR.AccountNumber,
                    AccountName = vietQR.AccountName,
                    TransferContent = transferContent
                };

                Console.WriteLine($"QR URL Generated: {qrCodeUrl}");
                Console.WriteLine($"=== Response Created Successfully ===");

                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== Error in CreateQRPayment ===");
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { Message = "Lỗi tạo mã QR thanh toán", Error = ex.Message });
            }
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
                return Ok(new { Message = "Xử lý callback thanh toán thành công", Payment = payment });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Xử lý callback thanh toán thất bại", Error = ex.Message });
            }
        }

        // PUT: api/payment/{id}/mark-success
        [HttpPut("{id:guid}/mark-success")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> MarkPaymentAsSuccess(Guid id)
        {
            await _paymentService.MarkPaymentAsSuccessAsync(id);
            return Ok(new { Message = "Đánh dấu thanh toán là thành công" });
        }

        // PUT: api/payment/{id}/mark-failed
        [HttpPut("{id:guid}/mark-failed")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> MarkPaymentAsFailed(Guid id)
        {
            await _paymentService.MarkPaymentAsFailedAsync(id);
            return Ok(new { Message = "Đánh dấu thanh toán là thất bại" });
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
            return Ok(new { Message = "Đã hủy các thanh toán đang chờ hết hạn" });
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
            return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException("Người dùng chưa đăng nhập"));
        }
    }

    // Helper DTOs
    public class CreatePaymentForOrderDto
    {
        public string Provider { get; set; } = "VietQR";
        public string PaymentMethod { get; set; } = "Online";
    }

    // --- SỬA DTO: Đổi OrderId thành string ---
    public class CreateQRPaymentRequestDto
    {
        public string OrderId { get; set; } = string.Empty; // Sửa từ Guid thành string
        public decimal Amount { get; set; }
        public string? Description { get; set; }
    }

    public class CreateQRPaymentResponseDto
    {
        public bool Success { get; set; }
        public string QrCodeUrl { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty; // Sửa từ Guid thành string
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public string TransferContent { get; set; } = string.Empty;
    }
}