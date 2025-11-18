using BookStore.API.Base;
using BookStore.Application.Dtos.Rental;
using BookStore.Application.IService.Rental;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers.Rental
{
    /// <summary>
    /// Controller quản lý gói thuê sách (Admin)
    /// </summary>
    [Route("api/rental/plans")]
    [ApiController]
    public class RentalPlansController : ApiControllerBase
    {
        private readonly IRentalPlanService _rentalPlanService;
        private readonly ILogger<RentalPlansController> _logger;

        public RentalPlansController(
            IRentalPlanService rentalPlanService,
            ILogger<RentalPlansController> logger)
        {
            _rentalPlanService = rentalPlanService;
            _logger = logger;
        }

        /// <summary>
        /// Lấy tất cả gói thuê (Admin)
        /// GET: api/rental/plans
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllRentalPlans()
        {
            try
            {
                var plans = await _rentalPlanService.GetAllRentalPlansAsync();
                return Ok(plans);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all rental plans");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách gói thuê", details = ex.Message });
            }
        }

        /// <summary>
        /// Lấy các gói thuê đang active (User có thể xem)
        /// GET: api/rental/plans/active
        /// </summary>
        [HttpGet("active")]
        [AllowAnonymous]
        public async Task<IActionResult> GetActiveRentalPlans()
        {
            try
            {
                var plans = await _rentalPlanService.GetActiveRentalPlansAsync();
                return Ok(plans);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active rental plans");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách gói thuê", details = ex.Message });
            }
        }

        /// <summary>
        /// Lấy chi tiết gói thuê
        /// GET: api/rental/plans/{id}
        /// </summary>
        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRentalPlanById(Guid id)
        {
            try
            {
                var plan = await _rentalPlanService.GetRentalPlanByIdAsync(id);
                if (plan == null)
                    return NotFound(new { message = "Không tìm thấy gói thuê" });

                return Ok(plan);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting rental plan {id}");
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin gói thuê", details = ex.Message });
            }
        }

        /// <summary>
        /// Tạo gói thuê mới (Admin)
        /// POST: api/rental/plans
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateRentalPlan([FromBody] CreateRentalPlanDto dto)
        {
            try
            {
                var plan = await _rentalPlanService.CreateRentalPlanAsync(dto);
                return CreatedAtAction(nameof(GetRentalPlanById), new { id = plan.Id }, plan);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating rental plan");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật gói thuê (Admin)
        /// PUT: api/rental/plans/{id}
        /// </summary>
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateRentalPlan(Guid id, [FromBody] UpdateRentalPlanDto dto)
        {
            try
            {
                if (id != dto.Id)
                    return BadRequest(new { message = "ID không khớp" });

                var plan = await _rentalPlanService.UpdateRentalPlanAsync(dto);
                return Ok(plan);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating rental plan {id}");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa gói thuê (Admin)
        /// DELETE: api/rental/plans/{id}
        /// </summary>
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteRentalPlan(Guid id)
        {
            try
            {
                await _rentalPlanService.DeleteRentalPlanAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting rental plan {id}");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
