using BookStore.API.Base;
using BookStore.Application.Dtos.Rental;
using BookStore.Application.IService.Rental;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers.Rental
{

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

        [HttpGet("active")]
        [AllowAnonymous]
        public async Task<IActionResult> GetActiveRentalPlans([FromQuery] string? type = null)
        {
            try
            {
                IEnumerable<RentalPlanDto> plans;
                
                if (!string.IsNullOrWhiteSpace(type))
                {
                    // Filter by type: "Subscription" hoặc "SingleBook"
                    plans = await _rentalPlanService.GetActiveRentalPlansByTypeAsync(type);
                }
                else
                {
                    // Lấy tất cả
                    plans = await _rentalPlanService.GetActiveRentalPlansAsync();
                }
                
                return Ok(plans);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active rental plans");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách gói thuê", details = ex.Message });
            }
        }

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
