using BookStore.API.Base;
using BookStore.Application.Dtos.Checkout;
using BookStore.Application.Dtos.Ordering;
using BookStore.Application.IService.Checkout;
using BookStore.Shared.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using PaymentDto = BookStore.Application.Dtos.Payment;

namespace BookStore.API.Controllers.Checkout
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CheckoutController : ApiControllerBase
    {
        private readonly ICheckoutService _checkoutService;
        private readonly ILogger<CheckoutController> _logger;

        public CheckoutController(
            ICheckoutService checkoutService,
            ILogger<CheckoutController> logger)
        {
            _checkoutService = checkoutService;
            _logger = logger;
        }

        #region Preview & Validation

        [HttpGet("preview")]
        public async Task<IActionResult> GetCheckoutPreview([FromQuery] string? couponCode = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                var preview = await _checkoutService.GetCheckoutPreviewAsync(userId, couponCode);
                return Ok(preview);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting checkout preview");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi xem trước checkout", details = ex.Message });
            }
        }

        [HttpGet("validate")]
        public async Task<IActionResult> ValidateCheckout()
        {
            try
            {
                var userId = GetCurrentUserId();
                var validation = await _checkoutService.ValidateCheckoutAsync(userId);

                if (!validation.IsValid)
                {
                    return BadRequest(new
                    {
                        message = "Giỏ hàng không hợp lệ để checkout",
                        validation
                    });
                }

                return Ok(new
                {
                    message = "Giỏ hàng hợp lệ, sẵn sàng checkout",
                    validation
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating checkout");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi validate", details = ex.Message });
            }
        }

        [HttpGet("calculate")]
        public async Task<IActionResult> CalculateCheckoutTotal([FromQuery] string? couponCode = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                var calculation = await _checkoutService.CalculateCheckoutTotalAsync(userId, couponCode);
                return Ok(calculation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating checkout total");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi tính toán", details = ex.Message });
            }
        }

        [HttpGet("validate-coupon")]
        public async Task<IActionResult> ValidateCoupon([FromQuery] string code)
        {
            try
            {
                if (string.IsNullOrEmpty(code))
                {
                    return BadRequest(new { message = "Mã coupon không được để trống" });
                }

                var userId = GetCurrentUserId();
                var isValid = await _checkoutService.ValidateCouponAsync(code, userId);

                return Ok(new
                {
                    isValid,
                    message = isValid ? "Mã coupon hợp lệ" : "Mã coupon không hợp lệ hoặc đã hết hạn"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating coupon");
                return StatusCode(500, new { message = "Có lỗi xảy ra", details = ex.Message });
            }
        }

        #endregion

        #region Process Checkout

        [HttpPost("process")]
        public async Task<IActionResult> ProcessCheckout([FromBody] CheckoutRequestDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                dto.UserId = userId; // Đảm bảo user chỉ checkout cho chính mình

                var result = await _checkoutService.ProcessCheckoutAsync(dto);

                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing checkout");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi checkout", details = ex.Message });
            }
        }

        [HttpPost("quick")]
        public async Task<IActionResult> QuickCheckout([FromBody] QuickCheckoutRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();

                var result = await _checkoutService.QuickCheckoutAsync(
                    userId,
                    request.Address,
                    request.CouponCode,
                    request.Provider ?? "VietQR"
                );

                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in quick checkout");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi checkout", details = ex.Message });
            }
        }

        #endregion

        #region Payment Callback & Status


        [HttpPost("payment-callback")]
        [AllowAnonymous] // Payment gateway gọi đến endpoint này
        public async Task<IActionResult> HandlePaymentCallback([FromBody] PaymentDto.PaymentCallbackDto callbackDto)
        {
            try
            {
                // TODO: Verify signature/token từ payment gateway
                _logger.LogInformation($"Received payment callback for transaction {callbackDto.TransactionCode}");

                var result = await _checkoutService.HandlePaymentCallbackAsync(callbackDto);

                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling payment callback");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi xử lý callback", details = ex.Message });
            }
        }

        [HttpGet("payment-status/{orderId:guid}")]
        public async Task<IActionResult> GetPaymentStatus(Guid orderId)
        {
            try
            {
                var userId = GetCurrentUserId();

                // Kiểm tra quyền truy cập (chỉ admin hoặc owner)
                // TODO: Add authorization check

                var payment = await _checkoutService.GetCheckoutPaymentStatusAsync(orderId);

                if (payment == null)
                {
                    return NotFound(new { message = "Không tìm thấy thông tin thanh toán" });
                }

                return Ok(payment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment status");
                return StatusCode(500, new { message = "Có lỗi xảy ra", details = ex.Message });
            }
        }

        #endregion

        #region Order Management

        [HttpPost("cancel/{orderId:guid}")]
        public async Task<IActionResult> CancelCheckout(Guid orderId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _checkoutService.CancelCheckoutAsync(orderId, userId);

                if (!success)
                {
                    return BadRequest(new { message = "Không thể hủy đơn hàng" });
                }

                return Ok(new { message = "Đơn hàng đã được hủy thành công" });
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error cancelling checkout {orderId}");
                return StatusCode(500, new { message = "Có lỗi xảy ra", details = ex.Message });
            }
        }


        [HttpGet("order/{orderId:guid}")]
        public async Task<IActionResult> GetCheckoutByOrderId(Guid orderId)
        {
            try
            {
                // TODO: Add authorization check

                var result = await _checkoutService.GetCheckoutResultByOrderIdAsync(orderId);

                if (result == null)
                {
                    return NotFound(new { message = "Không tìm thấy đơn hàng" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting checkout by order ID");
                return StatusCode(500, new { message = "Có lỗi xảy ra", details = ex.Message });
            }
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetCheckoutHistory(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var userId = GetCurrentUserId();
                var (items, totalCount) = await _checkoutService.GetUserCheckoutHistoryAsync(
                    userId,
                    pageNumber,
                    pageSize
                );

                return Ok(new
                {
                    items,
                    totalCount,
                    pageNumber,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting checkout history");
                return StatusCode(500, new { message = "Có lỗi xảy ra", details = ex.Message });
            }
        }

        #endregion

        #region Helper Methods

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException("Người dùng chưa đăng nhập"));
        }

        #endregion
    }

    #region Request Models


    public class QuickCheckoutRequest
    {
        public CreateOrderAddressDto Address { get; set; } = null!;
        public string? CouponCode { get; set; }
        public string? Provider { get; set; } = "VietQR";
    }

    #endregion
}
