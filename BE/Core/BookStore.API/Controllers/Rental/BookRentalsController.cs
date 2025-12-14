using BookStore.API.Base;
using BookStore.Application.Dtos.Rental;
using BookStore.Application.IService.Rental;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.API.Controllers.Rental
{
    /// <summary>
    /// Controller cho thuê từng quyển sách riêng lẻ
    /// </summary>
    [Route("api/rental/rentals")]
    [ApiController]
    [Authorize]
    public class BookRentalsController : ApiControllerBase
    {
        private readonly IBookRentalService _rentalService;
        private readonly ILogger<BookRentalsController> _logger;

        public BookRentalsController(
            IBookRentalService rentalService,
            ILogger<BookRentalsController> logger)
        {
            _rentalService = rentalService;
            _logger = logger;
        }

        /// <summary>
        /// User thuê 1 quyển sách
        /// POST: api/rental/rentals/rent
        /// </summary>
        [HttpPost("rent")]
        public async Task<IActionResult> RentBook([FromBody] CreateBookRentalDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _rentalService.RentBookAsync(userId, dto);

                if (!result.Success)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error renting book");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// [TESTING ONLY] Thuê sách KHÔNG CẦN THANH TOÁN (Mock payment)
        /// POST: api/rental/rentals/rent-mock
        /// </summary>
        [HttpPost("rent-mock")]
        public async Task<IActionResult> RentBookMock([FromBody] RentBookMockDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();

                // Tạo mã giao dịch giả lập
                var mockTransactionCode = $"MOCK_RENTAL_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid().ToString().Substring(0, 8)}";

                var rentDto = new CreateBookRentalDto
                {
                    BookId = dto.BookId,
                    RentalPlanId = dto.RentalPlanId,
                    PaymentTransactionCode = mockTransactionCode
                };

                var result = await _rentalService.RentBookAsync(userId, rentDto);

                if (!result.Success)
                    return BadRequest(result);

                return Ok(new
                {
                    result.Success,
                    result.Message,
                    result.RentalId,
                    result.BookTitle,
                    result.PlanName,
                    result.StartDate,
                    result.EndDate,
                    result.DurationDays,
                    result.Status,
                    MockTransactionCode = mockTransactionCode,
                    Warning = "⚠️ ĐÂY LÀ THANH TOÁN GIẢ LẬP - CHỈ DÙNG ĐỂ TEST!"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in mock rent book");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Xem danh sách sách đang thuê
        /// GET: api/rental/rentals/my
        /// </summary>
        [HttpGet("my")]
        public async Task<IActionResult> GetMyRentals([FromQuery] bool includeExpired = false)
        {
            try
            {
                var userId = GetCurrentUserId();
                var rentals = await _rentalService.GetMyRentalsAsync(userId, includeExpired);
                return Ok(rentals);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting my rentals");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách sách thuê", details = ex.Message });
            }
        }

        /// <summary>
        /// Lấy chi tiết lượt thuê
        /// GET: api/rental/rentals/{id}
        /// </summary>
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetRentalById(Guid id)
        {
            try
            {
                var rental = await _rentalService.GetRentalByIdAsync(id);
                if (rental == null)
                    return NotFound(new { message = "Không tìm thấy lượt thuê" });

                return Ok(rental);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting rental {id}");
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin lượt thuê", details = ex.Message });
            }
        }

        /// <summary>
        /// Gia hạn lượt thuê
        /// POST: api/rental/rentals/{id}/renew
        /// </summary>
        [HttpPost("{id:guid}/renew")]
        public async Task<IActionResult> RenewRental(Guid id, [FromBody] RenewBookRentalDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _rentalService.RenewRentalAsync(userId, id, dto);

                if (!result.Success)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error renewing rental {id}");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Gia hạn MOCK (test không cần thanh toán)
        /// POST: api/rental/rentals/{id}/renew-mock
        /// </summary>
        [HttpPost("{id:guid}/renew-mock")]
        public async Task<IActionResult> RenewRentalMock(Guid id, [FromBody] RenewMockDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var mockTransactionCode = $"MOCK_RENEW_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid().ToString().Substring(0, 8)}";

                var renewDto = new RenewBookRentalDto
                {
                    RentalPlanId = dto.RentalPlanId,
                    PaymentTransactionCode = mockTransactionCode
                };

                var result = await _rentalService.RenewRentalAsync(userId, id, renewDto);

                if (!result.Success)
                    return BadRequest(result);

                return Ok(new
                {
                    result.Success,
                    result.Message,
                    result.RentalId,
                    result.EndDate,
                    MockTransactionCode = mockTransactionCode,
                    Warning = "⚠️ ĐÂY LÀ THANH TOÁN GIẢ LẬP - CHỈ DÙNG ĐỂ TEST!"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in mock renew rental {id}");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Trả sách sớm (hủy lượt thuê)
        /// POST: api/rental/rentals/{id}/return
        /// </summary>
        [HttpPost("{id:guid}/return")]
        public async Task<IActionResult> ReturnBook(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _rentalService.ReturnBookAsync(userId, id);

                if (!result)
                    return BadRequest(new { message = "Không thể trả sách" });

                return Ok(new { message = "Trả sách thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error returning book rental {id}");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Kiểm tra có quyền đọc sách không
        /// GET: api/rental/rentals/{bookId}/check-access
        /// </summary>
        [HttpGet("{bookId:guid}/check-access")]
        public async Task<IActionResult> CheckBookAccess(Guid bookId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _rentalService.CheckBookAccessAsync(userId, bookId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking access for book {bookId}");
                return StatusCode(500, new { message = "Lỗi khi kiểm tra quyền truy cập", details = ex.Message });
            }
        }

        /// <summary>
        /// Lấy link đọc sách đã thuê (Pre-signed URL, hết hạn 10 phút)
        /// GET: api/rental/rentals/{bookId}/access-link
        /// </summary>
        [HttpGet("{bookId:guid}/access-link")]
        public async Task<IActionResult> GetAccessLink(Guid bookId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _rentalService.GetRentalAccessLinkAsync(userId, bookId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting access link for book {bookId}");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Admin: Lấy tất cả rentals
        /// GET: api/rental/rentals/all
        /// </summary>
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllRentals()
        {
            try
            {
                var rentals = await _rentalService.GetAllRentalsAsync();
                return Ok(rentals);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all rentals");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách rentals", details = ex.Message });
            }
        }

        /// <summary>
        /// Admin: Lấy rentals theo user
        /// GET: api/rental/rentals/by-user/{userId}
        /// </summary>
        [HttpGet("by-user/{userId:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetRentalsByUser(Guid userId)
        {
            try
            {
                var rentals = await _rentalService.GetRentalsByUserAsync(userId);
                return Ok(rentals);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting rentals for user {userId}");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách rentals", details = ex.Message });
            }
        }

        /// <summary>
        /// Admin: Lấy rentals theo sách
        /// GET: api/rental/rentals/by-book/{bookId}
        /// </summary>
        [HttpGet("by-book/{bookId:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetRentalsByBook(Guid bookId)
        {
            try
            {
                var rentals = await _rentalService.GetRentalsByBookAsync(bookId);
                return Ok(rentals);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting rentals for book {bookId}");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách rentals", details = ex.Message });
            }
        }

        /// <summary>
        /// Admin: Hủy rental
        /// DELETE: api/rental/rentals/{id}
        /// </summary>
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CancelRental(Guid id)
        {
            try
            {
                await _rentalService.CancelRentalAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error cancelling rental {id}");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Admin/Background Job: Cập nhật các rental hết hạn
        /// POST: api/rental/rentals/update-expired
        /// </summary>
        [HttpPost("update-expired")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateExpiredRentals()
        {
            try
            {
                await _rentalService.UpdateExpiredRentalsAsync();
                return Ok(new { message = "Đã cập nhật các rental hết hạn" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating expired rentals");
                return StatusCode(500, new { message = "Lỗi khi cập nhật rentals", details = ex.Message });
            }
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException("Người dùng chưa đăng nhập"));
        }
    }

    /// <summary>
    /// DTO cho mock rent (testing only)
    /// </summary>
    public class RentBookMockDto
    {
        public Guid BookId { get; set; }
        public Guid RentalPlanId { get; set; }
    }

    /// <summary>
    /// DTO cho mock renew (testing only)
    /// </summary>
    public class RenewMockDto
    {
        public Guid RentalPlanId { get; set; }
    }
}
