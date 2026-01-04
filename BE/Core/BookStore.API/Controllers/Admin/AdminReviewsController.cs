using BookStore.API.Base;
using BookStore.Application.DTOs.Catalog.Review;
using BookStore.Application.IService.Review;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/reviews")]
    [Authorize(Roles = "Admin")]
    public class AdminReviewsController : ApiControllerBase
    {
        private readonly IReviewService _reviewService;

        public AdminReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingReviews(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                var (reviews, totalCount) = await _reviewService.GetPendingReviewsAsync(page, pageSize);

                return Ok(new
                {
                    Success = true,
                    Data = new
                    {
                        Reviews = reviews,
                        Pagination = new
                        {
                            Page = page,
                            PageSize = pageSize,
                            TotalCount = totalCount,
                            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while retrieving pending reviews",
                    Error = ex.Message
                });
            }
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetReviewById(Guid id)
        {
            try
            {
                var review = await _reviewService.GetReviewByIdAsync(id);
                if (review == null)
                {
                    return NotFound(new { Success = false, Message = "Review not found" });
                }

                return Ok(new
                {
                    Success = true,
                    Data = review
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while retrieving the review",
                    Error = ex.Message
                });
            }
        }


        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveReview(Guid id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var adminId))
                {
                    return Unauthorized(new { Success = false, Message = "Admin not authenticated" });
                }

                var review = await _reviewService.ApproveReviewAsync(id, adminId);

                return Ok(new
                {
                    Success = true,
                    Message = "Review approved successfully. Book statistics updated.",
                    Data = review
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while approving the review",
                    Error = ex.Message
                });
            }
        }


        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectReview(Guid id, [FromBody] UpdateReviewStatusDto dto)
        {
            try
            {
                var review = await _reviewService.RejectReviewAsync(id, dto.Reason);

                return Ok(new
                {
                    Success = true,
                    Message = "Review rejected successfully",
                    Data = review
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while rejecting the review",
                    Error = ex.Message
                });
            }
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(Guid id)
        {
            try
            {
                await _reviewService.DeleteReviewAsync(id);

                return Ok(new
                {
                    Success = true,
                    Message = "Review deleted successfully"
                });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { Success = false, Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while deleting the review",
                    Error = ex.Message
                });
            }
        }
    }
}
