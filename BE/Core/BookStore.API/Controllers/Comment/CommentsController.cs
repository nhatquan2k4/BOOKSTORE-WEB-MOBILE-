using BookStore.API.Base;
using BookStore.Application.DTOs.Comment;
using BookStore.Application.IService.Comment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.API.Controllers.Comment
{
    [ApiController]
    [Route("api/comments")]
    public class CommentsController : ApiControllerBase
    {
        private readonly ICommentService _commentService;

        public CommentsController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        /// <summary>
        /// Get replies for a comment (Public access)
        /// </summary>
        [HttpGet("{parentCommentId}/replies")]
        [AllowAnonymous]
        public async Task<IActionResult> GetReplies(Guid parentCommentId)
        {
            try
            {
                var replies = await _commentService.GetRepliesAsync(parentCommentId);

                return Ok(new
                {
                    Success = true,
                    Data = replies
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while retrieving replies",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Update a comment (User can only update their own comments)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateComment(Guid id, [FromBody] UpdateCommentDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { Success = false, Message = "User not authenticated" });
                }

                var comment = await _commentService.UpdateCommentAsync(userId, id, dto);

                return Ok(new
                {
                    Success = true,
                    Message = "Comment updated successfully",
                    Data = comment
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
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
                    Message = "An error occurred while updating the comment",
                    Error = ex.Message
                });
            }
        }

        /// <summary>
        /// Delete a comment (User can only delete their own comments, Admin can delete any)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteComment(Guid id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { Success = false, Message = "User not authenticated" });
                }

                var isAdmin = User.IsInRole("Admin");
                await _commentService.DeleteCommentAsync(userId, id, isAdmin);

                return Ok(new
                {
                    Success = true,
                    Message = "Comment deleted successfully"
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
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
                    Message = "An error occurred while deleting the comment",
                    Error = ex.Message
                });
            }
        }
    }
}
