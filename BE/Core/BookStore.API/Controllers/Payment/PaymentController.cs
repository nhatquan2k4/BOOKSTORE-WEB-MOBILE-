using BookStore.Application.Dtos.Payment;
using BookStore.Application.IService.Payment;
using BookStore.Application.IService.Ordering; // Sửa: Dùng OrderService thay vì Repository
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
        private readonly IOrderService _orderService; // Sử dụng Service để xử lý logic nghiệp vụ
        private readonly ILogger<PaymentController> _logger;

        // Cấu hình ngân hàng cho VietQR (Nên đưa vào AppSettings)
        private const string BANK_ID = "MB"; 
        private const string ACCOUNT_NO = "2230333906939"; 
        private const string ACCOUNT_NAME = "HOANG THO TU"; 
        private const string TEMPLATE = "compact";

        public PaymentController(
            IPaymentService paymentService, 
            IOrderService orderService,
            ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _orderService = orderService;
            _logger = logger;
        }

        #region QR Payment (VietQR / SePay)

        // POST: api/payment/qr
        [HttpPost("qr")]
        [AllowAnonymous] 
        public IActionResult CreateQRPayment([FromBody] CreateQRRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.OrderId) || request.Amount <= 0)
                {
                    return BadRequest(new { Message = "Thông tin thanh toán không hợp lệ" });
                }

                // Generate transfer content: MUA ORD-123...
                var transferContent = request.Description ?? $"MUA {request.OrderId}";
                
                // Encode URL
                var encodedContent = System.Net.WebUtility.UrlEncode(transferContent);
                var encodedName = System.Net.WebUtility.UrlEncode(ACCOUNT_NAME);

                // Create VietQR URL
                var qrCodeUrl = $"https://img.vietqr.io/image/{BANK_ID}-{ACCOUNT_NO}-{TEMPLATE}.png?amount={request.Amount}&addInfo={encodedContent}&accountName={encodedName}";

                return Ok(new 
                {
                    Success = true,
                    QrCodeUrl = qrCodeUrl,
                    OrderId = request.OrderId,
                    AccountNumber = ACCOUNT_NO,
                    AccountName = ACCOUNT_NAME,
                    TransferContent = transferContent
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi tạo mã QR thanh toán", Error = ex.Message });
            }
        }

        // GET: api/payment/status/{orderId}
        [HttpGet("status/{orderId}")]
        [AllowAnonymous] // Cho phép check status không cần login (Frontend polling)
        public async Task<IActionResult> CheckPaymentStatus(string orderId)
        {
            try
            {
                // Gọi OrderService để lấy thông tin
                Guid? guidId = null;
                if (Guid.TryParse(orderId, out var g)) guidId = g;

                var order = guidId.HasValue 
                    ? await _orderService.GetOrderByIdAsync(guidId.Value)
                    : await _orderService.GetOrderByOrderNumberAsync(orderId);

                if (order == null)
                {
                    return NotFound(new { Success = false, Message = "Không tìm thấy đơn hàng" });
                }

                return Ok(new 
                { 
                    Success = true, 
                    Status = order.Status, // Trả về "Pending" hoặc "Paid"
                    Message = "Lấy trạng thái thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }

        // --- NEW: API Webhook (Quan trọng để fix lỗi chưa Paid) ---
        [HttpPost("webhook/sepay")]
        [AllowAnonymous] // Bắt buộc AllowAnonymous để SePay/Postman gọi được
        public async Task<IActionResult> SePayWebhook([FromBody] SePayWebhookDto data)
        {
            _logger.LogInformation($"[SePay Webhook] Received: {data.Content} - Amount: {data.TransferAmount}");

            try
            {
                // 1. Tách mã đơn hàng từ nội dung chuyển khoản
                // Ví dụ nội dung: "MUA ORD-20251223-123456"
                string orderIdString = string.Empty;

                var parts = data.Content.Split(' ');
                foreach (var part in parts)
                {
                    // Tìm chuỗi bắt đầu bằng ORD- hoặc là UUID
                    if (part.StartsWith("ORD-") || part.StartsWith("RENT-") || Guid.TryParse(part, out _))
                    {
                        orderIdString = part;
                        break;
                    }
                }

                if (string.IsNullOrEmpty(orderIdString)) orderIdString = data.ReferenceCode; 

                if (!string.IsNullOrEmpty(orderIdString))
                {
                    // 2. Gọi Service để update trạng thái thành Paid
                    await _orderService.ConfirmPaymentAsync(orderIdString, data.TransferAmount);
                    return Ok(new { success = true, message = "Payment confirmed" });
                }

                return BadRequest(new { success = false, message = "Cannot find OrderId in content" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing SePay webhook");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region Payment Management API (Giữ nguyên logic cũ)

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetPaymentById(Guid id)
        {
            var payment = await _paymentService.GetPaymentByIdAsync(id);
            if (payment == null) return NotFound(new { Message = "Không tìm thấy thanh toán" });
            return Ok(payment);
        }

        [HttpGet("order/{orderId:guid}")]
        public async Task<IActionResult> GetPaymentByOrderId(Guid orderId)
        {
            var payment = await _paymentService.GetPaymentByOrderIdAsync(orderId);
            if (payment == null) return NotFound(new { Message = "Không tìm thấy thanh toán" });
            return Ok(payment);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentDto dto)
        {
            var payment = await _paymentService.CreatePaymentAsync(dto);
            return CreatedAtAction(nameof(GetPaymentById), new { id = payment.Id }, payment);
        }

        // ... Các API khác giữ nguyên như cũ, chỉ cần đảm bảo build không lỗi ...

        #endregion

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) throw new UnauthorizedAccessException("Người dùng chưa đăng nhập");
            return Guid.Parse(userIdClaim);
        }
    }

    // --- DTO Classes ---
    public class CreateQRRequest
    {
        public string OrderId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? Description { get; set; }
    }

    // DTO để hứng dữ liệu từ Postman/SePay
    public class SePayWebhookDto
    {
        public string Gateway { get; set; } = string.Empty;
        public string TransactionDate { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public decimal TransferAmount { get; set; }
        public string Content { get; set; } = string.Empty;
        public string ReferenceCode { get; set; } = string.Empty;
    }
}