using BookStore.Application.Dtos.System.Notification;
using BookStore.Application.IService.System;
using BookStore.API.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.API.Controllers.Notification
{
    [Route("api/notifications")]
    [ApiController]
    public class NotificationController : ApiControllerBase // ✅ Kế thừa ApiControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationController> _logger;

        public NotificationController(
            INotificationService notificationService,
            ILogger<NotificationController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        /// <summary>
        /// GET: api/notifications/my
        /// Lấy danh sách thông báo của user hiện tại
        /// </summary>
        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> GetMyNotifications(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 20, 
            [FromQuery] bool? isRead = null)
        {
            try 
            {
                var userId = GetCurrentUserId();
                
                var result = await _notificationService.GetUserNotificationsAsync(userId, page, pageSize, isRead);
                var unreadCount = await _notificationService.GetUnreadCountAsync(userId);

                return Ok(new 
                { 
                    success = true,
                    items = result.Notifications, 
                    totalCount = result.TotalCount,
                    unreadCount = unreadCount.UnreadCount,
                    page = page,
                    pageSize = pageSize
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Unauthorized access: {Message}", ex.Message);
                return Unauthorized(new { success = false, message = "Vui lòng đăng nhập" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notifications");
                return StatusCode(500, new { success = false, message = "Lỗi tải thông báo" });
            }
        }

        /// <summary>
        /// GET: api/notifications/unread-count
        /// Lấy số lượng thông báo chưa đọc
        /// </summary>
        [HttpGet("unread-count")]
        [Authorize]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _notificationService.GetUnreadCountAsync(userId);
                return Ok(new { success = true, unreadCount = result.UnreadCount });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Unauthorized access: {Message}", ex.Message);
                return Unauthorized(new { success = false, message = "Vui lòng đăng nhập" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread count");
                return StatusCode(500, new { success = false, message = "Lỗi tải số lượng thông báo" });
            }
        }

        /// <summary>
        /// GET: api/notifications/{id}
        /// Lấy chi tiết một thông báo
        /// </summary>
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetNotificationById(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var notification = await _notificationService.GetNotificationByIdAsync(id, userId);
                
                if (notification == null)
                    return NotFound(new { success = false, message = "Không tìm thấy thông báo" });

                return Ok(new { success = true, data = notification });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Unauthorized access: {Message}", ex.Message);
                return Unauthorized(new { success = false, message = "Vui lòng đăng nhập" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notification {NotificationId}", id);
                return StatusCode(500, new { success = false, message = "Lỗi tải thông báo" });
            }
        }

        /// <summary>
        /// PUT: api/notifications/{id}/read
        /// Đánh dấu một thông báo là đã đọc
        /// </summary>
        [HttpPut("{id}/read")]
        [Authorize]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _notificationService.MarkAsReadAsync(id, userId);
                
                if (!success)
                    return NotFound(new { success = false, message = "Không tìm thấy thông báo" });

                return Ok(new { success = true, message = "Đã đánh dấu đã đọc" });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Unauthorized access: {Message}", ex.Message);
                return Unauthorized(new { success = false, message = "Vui lòng đăng nhập" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification {NotificationId} as read", id);
                return StatusCode(500, new { success = false, message = "Lỗi cập nhật thông báo" });
            }
        }
        
        /// <summary>
        /// PUT: api/notifications/read-all
        /// Đánh dấu tất cả thông báo là đã đọc
        /// </summary>
        [HttpPut("read-all")]
        [Authorize]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                var userId = GetCurrentUserId();
                await _notificationService.MarkAllAsReadAsync(userId);
                return Ok(new { success = true, message = "Đã đánh dấu tất cả là đã đọc" });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Unauthorized access: {Message}", ex.Message);
                return Unauthorized(new { success = false, message = "Vui lòng đăng nhập" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all notifications as read");
                return StatusCode(500, new { success = false, message = "Lỗi cập nhật thông báo" });
            }
        }

        /// <summary>
        /// DELETE: api/notifications/{id}
        /// Xóa một thông báo
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteNotification(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _notificationService.DeleteNotificationAsync(id, userId);
                
                if (!success)
                    return NotFound(new { success = false, message = "Không tìm thấy thông báo" });

                return Ok(new { success = true, message = "Đã xóa thông báo" });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Unauthorized access: {Message}", ex.Message);
                return Unauthorized(new { success = false, message = "Vui lòng đăng nhập" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification {NotificationId}", id);
                return StatusCode(500, new { success = false, message = "Lỗi xóa thông báo" });
            }
        }

        /// <summary>
        /// GET: api/notifications/recent
        /// Lấy thông báo gần đây (cho dropdown)
        /// </summary>
        [HttpGet("recent")]
        [Authorize]
        public async Task<IActionResult> GetRecentNotifications([FromQuery] int count = 5)
        {
            try
            {
                var userId = GetCurrentUserId();
                var notifications = await _notificationService.GetRecentNotificationsAsync(userId, count);
                return Ok(new { success = true, items = notifications });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Unauthorized access: {Message}", ex.Message);
                return Unauthorized(new { success = false, message = "Vui lòng đăng nhập" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent notifications");
                return StatusCode(500, new { success = false, message = "Lỗi tải thông báo" });
            }
        }
    }
}