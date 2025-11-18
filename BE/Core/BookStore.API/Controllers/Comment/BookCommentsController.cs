using BookStore.API.Base;
using BookStore.Application.DTOs.Comment;
using BookStore.Application.IService.Comment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.API.Controllers.Comment
{
    [ApiController]
    [Route("api/books/{bookId}/comments")]
    public class BookCommentsController : ApiControllerBase
    {
        private readonly ICommentService _commentService;

        public BookCommentsController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        /// <summary>
        /// Create a comment on a book (User must be logged in)
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateComment(Guid bookId, [FromBody] CreateCommentDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { Success = false, Message = "User not authenticated" });
                }

                var comment = await _commentService.CreateCommentOnBookAsync(userId, bookId, dto);

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
        /// Get all comments for a book (Public access)
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetBookComments(
            Guid bookId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                var (comments, totalCount) = await _commentService.GetBookCommentsAsync(bookId, page, pageSize);

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
