using BookStore.API.Base;
using BookStore.Application.Dtos.Rental;
using BookStore.Application.IService.Rental;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.API.Controllers.Rental
{

    [Route("api/rental/subscriptions")]
    [ApiController]
    [Authorize]
    public class SubscriptionsController : ApiControllerBase
    {
        private readonly IUserSubscriptionService _subscriptionService;
        private readonly ILogger<SubscriptionsController> _logger;

        public SubscriptionsController(
            IUserSubscriptionService subscriptionService,
            ILogger<SubscriptionsController> logger)
        {
            _subscriptionService = subscriptionService;
            _logger = logger;
        }

        [HttpPost("subscribe")]
        public async Task<IActionResult> Subscribe([FromBody] SubscribeRentalPlanDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _subscriptionService.SubscribeAsync(userId, dto);

                if (!result.Success)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error subscribing to rental plan");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("subscribe-mock")]
        public async Task<IActionResult> SubscribeMock([FromBody] SubscribeMockDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                // Tạo mã giao dịch giả lập
                var mockTransactionCode = $"MOCK_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid().ToString().Substring(0, 8)}";
                
                var subscribeDto = new SubscribeRentalPlanDto
                {
                    RentalPlanId = dto.RentalPlanId,
                    PaymentMethod = "Cash" // Mock = cash để tự động active
                };

                var result = await _subscriptionService.SubscribeAsync(userId, subscribeDto);

                if (!result.Success)
                    return BadRequest(result);

                return Ok(new
                {
                    result.Success,
                    result.Message,
                    Subscription = result.Subscription,
                    result.PaymentTransactionCode,
                    MockTransactionCode = mockTransactionCode,
                    Warning = "⚠️ ĐÂY LÀ THANH TOÁN GIẢ LẬP - CHỈ DÙNG ĐỂ TEST!"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in mock subscription");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("check")]
        public async Task<IActionResult> CheckSubscription()
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _subscriptionService.CheckUserSubscriptionAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking subscription");
                return StatusCode(500, new { message = "Lỗi khi kiểm tra subscription", details = ex.Message });
            }
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveSubscription()
        {
            try
            {
                var userId = GetCurrentUserId();
                var subscription = await _subscriptionService.GetActiveSubscriptionAsync(userId);

                if (subscription == null)
                    return NotFound(new { message = "Bạn chưa có gói thuê hoặc gói đã hết hạn" });

                return Ok(subscription);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active subscription");
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin subscription", details = ex.Message });
            }
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMySubscriptions()
        {
            try
            {
                var userId = GetCurrentUserId();
                var subscriptions = await _subscriptionService.GetUserSubscriptionsAsync(userId);
                return Ok(subscriptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user subscriptions");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách subscription", details = ex.Message });
            }
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllSubscriptions()
        {
            try
            {
                var subscriptions = await _subscriptionService.GetAllSubscriptionsAsync();
                return Ok(subscriptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all subscriptions");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách subscription", details = ex.Message });
            }
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CancelSubscription(Guid id)
        {
            try
            {
                await _subscriptionService.CancelSubscriptionAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error cancelling subscription {id}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("update-expired")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateExpiredSubscriptions()
        {
            try
            {
                await _subscriptionService.UpdateExpiredSubscriptionsAsync();
                return Ok(new { message = "Đã cập nhật các subscription hết hạn" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating expired subscriptions");
                return StatusCode(500, new { message = "Lỗi khi cập nhật subscription", details = ex.Message });
            }
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException("Người dùng chưa đăng nhập"));
        }
    }
    public class SubscribeMockDto
    {
        public Guid RentalPlanId { get; set; }
    }
}
