using BookStore.API.Base;
using BookStore.Application.DTOs.Comment;
using BookStore.Application.IService.Comment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.API.Controllers.Comment
{
    /// <summary>
    /// DEPRECATED: Review Comments are not used in standard e-commerce
    /// In real e-commerce (Amazon, Shopee, etc.), customers:
    /// 1. Leave REVIEWS with ratings (handled by ReviewsController)
    /// 2. Ask QUESTIONS on the product page (handled by BookCommentsController)
    /// 3. Mark reviews as helpful/not helpful (should be separate feature)
    /// 
    /// This controller is kept for backward compatibility but should not be used
    /// </summary>
    [ApiController]
    [Route("api/reviews/{reviewId}/comments")]
    [ApiExplorerSettings(IgnoreApi = true)] // Hide from Swagger
    public class ReviewCommentsController : ApiControllerBase
    {
        private readonly ICommentService _commentService;

        public ReviewCommentsController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        /// <summary>
        /// Create a comment on a review (User must be logged in)
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateComment(Guid reviewId, [FromBody] CreateCommentDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { Success = false, Message = "User not authenticated" });
                }

                var comment = await _commentService.CreateCommentOnReviewAsync(userId, reviewId, dto);

                return Ok(new
                {
                    Success = true,
                    Message = "Comment created successfully",
                    Data = comment
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
                    Message = "An error occurred while creating the comment",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get all comments for a review (Public access)
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetReviewComments(
            Guid reviewId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                var (comments, totalCount) = await _commentService.GetReviewCommentsAsync(reviewId, page, pageSize);

                return Ok(new
                {
                    Success = true,
                    Data = new
                    {
                        Comments = comments,
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
                    Message = "An error occurred while retrieving comments",
                    Error = ex.Message
                });
            }
        }
    }
}
