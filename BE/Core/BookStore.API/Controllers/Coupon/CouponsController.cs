using BookStore.API.Base;
using BookStore.Domain.Entities.Pricing___Inventory;
using BookStore.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BookStore.API.Controllers.Coupon
{
    [ApiController]
    [Route("api/[controller]")]
    public class CouponsController : ApiControllerBase
    {
        private readonly AppDbContext _context;

        public CouponsController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Validate coupon code and get discount information
        /// </summary>
        [HttpPost("validate")]
        [Authorize]
        public async Task<IActionResult> ValidateCoupon([FromBody] ValidateCouponRequest request)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Vui lòng đăng nhập" });
                }

                var coupon = await _context.Coupons
                    .FirstOrDefaultAsync(c => c.Code == request.Code.ToUpper() && !c.IsUsed);

                if (coupon == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Mã giảm giá không hợp lệ hoặc đã được sử dụng"
                    });
                }

                if (coupon.Expiration < DateTime.UtcNow)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Mã giảm giá đã hết hạn"
                    });
                }

                // Check if coupon is for specific user
                if (coupon.UserId.HasValue && coupon.UserId.ToString() != userId)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Mã giảm giá này không dành cho bạn"
                    });
                }

                // Calculate discount
                decimal discountAmount = 0;
                if (coupon.IsPercentage)
                {
                    discountAmount = (request.Subtotal * coupon.Value) / 100;
                }
                else
                {
                    discountAmount = coupon.Value;
                }

                // Ensure discount doesn't exceed subtotal
                discountAmount = Math.Min(discountAmount, request.Subtotal);

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        couponId = coupon.Id,
                        code = coupon.Code,
                        value = coupon.Value,
                        isPercentage = coupon.IsPercentage,
                        discountAmount = discountAmount,
                        expiration = coupon.Expiration,
                        message = $"Áp dụng mã giảm giá thành công! Giảm {(coupon.IsPercentage ? $"{coupon.Value}%" : $"{coupon.Value:N0}đ")}"
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi kiểm tra mã giảm giá",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get available coupons for current user
        /// </summary>
        [HttpGet("my-coupons")]
        [Authorize]
        public async Task<IActionResult> GetMyCoupons()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Vui lòng đăng nhập" });
                }

                var userGuid = Guid.Parse(userId);
                var coupons = await _context.Coupons
                    .Where(c => (c.UserId == null || c.UserId == userGuid) && 
                               !c.IsUsed && 
                               c.Expiration > DateTime.UtcNow)
                    .OrderByDescending(c => c.Value)
                    .Select(c => new
                    {
                        id = c.Id,
                        code = c.Code,
                        value = c.Value,
                        isPercentage = c.IsPercentage,
                        expiration = c.Expiration,
                        isPersonal = c.UserId != null
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    data = coupons
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi lấy danh sách mã giảm giá",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get public/promotional coupons (available for all users)
        /// </summary>
        [HttpGet("public")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicCoupons()
        {
            try
            {
                var coupons = await _context.Coupons
                    .Where(c => c.UserId == null && 
                               !c.IsUsed && 
                               c.Expiration > DateTime.UtcNow)
                    .OrderByDescending(c => c.Value)
                    .Select(c => new
                    {
                        code = c.Code,
                        value = c.Value,
                        isPercentage = c.IsPercentage,
                        expiration = c.Expiration,
                        description = c.IsPercentage 
                            ? $"Giảm {c.Value}%" 
                            : $"Giảm {c.Value:N0}đ"
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    data = coupons
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Đã xảy ra lỗi khi lấy danh sách mã khuyến mãi",
                    error = ex.Message
                });
            }
        }
    }

    public class ValidateCouponRequest
    {
        public string Code { get; set; } = null!;
        public decimal Subtotal { get; set; }
    }
}
