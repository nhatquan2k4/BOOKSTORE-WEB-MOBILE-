using BookStore.API.Base;
using BookStore.Application.DTOs.System.Notification;
using BookStore.Application.IService.System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.API.Controllers.Notification
{
    [ApiController]
    [Route("api/notifications")]
    [Authorize]
    public class NotificationsController : ApiControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(
            INotificationService notificationService,
            ILogger<NotificationsController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        /// <summary>
        /// Get current user's notifications with pagination
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetMyNotifications(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] bool? isRead = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                var (notifications, totalCount) = await _notificationService.GetUserNotificationsAsync(
                    userId, page, pageSize, isRead);

                return Ok(new
                {
                    Success = true,
                    Data = new
                    {
                        Notifications = notifications,
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
                _logger.LogError(ex, "Error getting user notifications");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while retrieving notifications"
                });
            }
        }

        /// <summary>
        /// Get notification by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetNotification(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var notification = await _notificationService.GetNotificationByIdAsync(id, userId);

                if (notification == null)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Notification not found"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Data = notification
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notification {NotificationId}", id);
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while retrieving the notification"
                });
            }
        }

        /// <summary>
        /// Mark a notification as read
        /// </summary>
        [HttpPut("{id}/mark-read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _notificationService.MarkAsReadAsync(id, userId);

                if (!success)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Notification not found"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Notification marked as read"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification as read");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while marking the notification as read"
                });
            }
        }

        /// <summary>
        /// Mark all notifications as read
        /// </summary>
        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                var userId = GetCurrentUserId();
                await _notificationService.MarkAllAsReadAsync(userId);

                return Ok(new
                {
                    Success = true,
                    Message = "All notifications marked as read"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all notifications as read");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while marking all notifications as read"
                });
            }
        }

        /// <summary>
        /// Get unread notifications count
        /// </summary>
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _notificationService.GetUnreadCountAsync(userId);

                return Ok(new
                {
                    Success = true,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread count");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while getting unread count"
                });
            }
        }

        /// <summary>
        /// Get recent notifications (latest 10)
        /// </summary>
        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentNotifications([FromQuery] int count = 10)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (count < 1 || count > 50) count = 10;

                var notifications = await _notificationService.GetRecentNotificationsAsync(userId, count);

                return Ok(new
                {
                    Success = true,
                    Data = notifications
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent notifications");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while retrieving recent notifications"
                });
            }
        }

        /// <summary>
        /// Delete a notification
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _notificationService.DeleteNotificationAsync(id, userId);

                if (!success)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Notification not found"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Notification deleted successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while deleting the notification"
                });
            }
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException("User not authenticated"));
        }
    }
}
