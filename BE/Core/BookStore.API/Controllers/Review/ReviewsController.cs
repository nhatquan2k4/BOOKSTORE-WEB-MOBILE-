using BookStore.API.Base;
using BookStore.Application.DTOs.Catalog.Review;
using BookStore.Application.IService.Review;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.API.Controllers.Review
{
    [ApiController]
    [Route("api/books/{bookId}/reviews")]
    public class ReviewsController : ApiControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        #region Create Operations

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReview([FromRoute] Guid bookId, [FromBody] CreateReviewDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { Success = false, Message = "User not authenticated" });
                }

                var review = await _reviewService.CreateReviewAsync(userId, bookId, dto);

                return Ok(new
                {
                    Success = true,
                    Message = "Review created successfully. It will be visible after admin approval.",
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
                    Message = "An error occurred while creating the review",
                    Error = ex.Message
                });
            }
        }

        #endregion

        #region Query Methods

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetBookReviews(
            [FromRoute] Guid bookId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? sortBy = null)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 10;

                var (reviews, totalCount) = await _reviewService.GetBookReviewsAsync(bookId, page, pageSize, sortBy);

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
                    Message = "An error occurred while retrieving reviews",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("statistics")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBookReviewStatistics([FromRoute] Guid bookId)
        {
            try
            {
                var statistics = await _reviewService.GetBookReviewStatisticsAsync(bookId);

                return Ok(new
                {
                    Success = true,
                    Data = statistics
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
                    Message = "An error occurred while retrieving statistics",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("my-review")]
        [Authorize]
        public async Task<IActionResult> GetMyReview([FromRoute] Guid bookId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { Success = false, Message = "User not authenticated" });
                }

                var review = await _reviewService.GetUserReviewForBookAsync(userId, bookId);

                if (review == null)
                {
                    return NotFound(new { Success = false, Message = "You have not reviewed this book yet" });
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
                    Message = "An error occurred while retrieving your review",
                    Error = ex.Message
                });
            }
        }

        #endregion

        #region Update Operations

        [HttpPut("my-review")]
        [Authorize]
        public async Task<IActionResult> UpdateMyReview([FromRoute] Guid bookId, [FromBody] UpdateReviewDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { Success = false, Message = "User not authenticated" });
                }

                var review = await _reviewService.UpdateReviewAsync(userId, bookId, dto);

                return Ok(new
                {
                    Success = true,
                    Message = "Review updated successfully. It will be re-reviewed by admin.",
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
                    Message = "An error occurred while updating the review",
                    Error = ex.Message
                });
            }
        }

        #endregion

        #region Delete Operations

        [HttpDelete("my-review")]
        [Authorize]
        public async Task<IActionResult> DeleteMyReview([FromRoute] Guid bookId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { Success = false, Message = "User not authenticated" });
                }

                await _reviewService.DeleteUserReviewAsync(userId, bookId);

                return Ok(new
                {
                    Success = true,
                    Message = "Your review has been deleted successfully"
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

        #endregion

        #region Additional Features

        [HttpPost("{reviewId}/helpful")]
        [Authorize]
        public async Task<IActionResult> MarkReviewAsHelpful([FromRoute] Guid bookId, [FromRoute] Guid reviewId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { Success = false, Message = "User not authenticated" });
                }


                return Ok(new
                {
                    Success = true,
                    Message = "Thank you for your feedback! (Feature coming soon)"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred",
                    Error = ex.Message
                });
            }
        }

        #endregion
    }
}
