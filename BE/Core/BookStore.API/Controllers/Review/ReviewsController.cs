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

        /// <summary>
        /// Create a new review for a book (User only, must have purchased the book)
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReview(Guid bookId, [FromBody] CreateReviewDto dto)
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

        /// <summary>
        /// Create a quick rating for a book (User only, must have purchased the book)
        /// This allows users to rate without writing a full review. Auto-approved.
        /// </summary>
        [HttpPost("../rating")]
        [Authorize]
        public async Task<IActionResult> CreateQuickRating(Guid bookId, [FromBody] QuickRatingDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { Success = false, Message = "User not authenticated" });
                }

                var review = await _reviewService.CreateQuickRatingAsync(userId, bookId, dto);

                return Ok(new
                {
                    Success = true,
                    Message = "Rating submitted successfully",
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
                    Message = "An error occurred while submitting the rating",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get all approved reviews for a book (Public access)
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetBookReviews(
            Guid bookId,
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

        /// <summary>
        /// Get review statistics for a book (Public access)
        /// </summary>
        [HttpGet("statistics")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBookReviewStatistics(Guid bookId)
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
    }
}
