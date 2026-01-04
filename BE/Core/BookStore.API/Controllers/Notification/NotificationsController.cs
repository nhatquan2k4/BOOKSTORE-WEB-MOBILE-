using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using BookStore.Application.IService.System;

namespace BookStore.API.Controllers.Notification
{
    [Route("api/notifications")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        // GET: api/notifications/my
        [HttpGet("my")]
        public async Task<IActionResult> GetMyNotifications(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10, 
            [FromQuery] bool? isRead = null)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                
                var (notifications, totalCount) = await _notificationService.GetUserNotificationsAsync(
                    userId, page, pageSize, isRead);
                
                var unreadCount = await _notificationService.GetUnreadCountAsync(userId);

                return Ok(new 
                { 
                    Items = notifications, 
                    TotalCount = totalCount, 
                    UnreadCount = unreadCount.UnreadCount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi lấy thông báo", Details = ex.Message });
            }
        }

        // GET: api/notifications/recent
        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentNotifications([FromQuery] int count = 5)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var notifications = await _notificationService.GetRecentNotificationsAsync(userId, count);
                
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi lấy thông báo gần nhất", Details = ex.Message });
            }
        }

        // GET: api/notifications/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetNotificationById(Guid id)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var notification = await _notificationService.GetNotificationByIdAsync(id, userId);
                
                if (notification == null)
                    return NotFound(new { Message = "Không tìm thấy thông báo" });
                
                return Ok(notification);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi lấy thông báo", Details = ex.Message });
            }
        }

        // PUT: api/notifications/{id}/read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var success = await _notificationService.MarkAsReadAsync(id, userId);
                
                if (!success)
                    return NotFound(new { Message = "Không tìm thấy thông báo" });
                
                return Ok(new { Message = "Đã đánh dấu đã đọc" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi đánh dấu đã đọc", Details = ex.Message });
            }
        }
        
        // PUT: api/notifications/read-all
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                await _notificationService.MarkAllAsReadAsync(userId);
                
                return Ok(new { Message = "Đã đánh dấu tất cả là đã đọc" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi đánh dấu tất cả", Details = ex.Message });
            }
        }
        
        // GET: api/notifications/unread-count
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var result = await _notificationService.GetUnreadCountAsync(userId);
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi lấy số lượng chưa đọc", Details = ex.Message });
            }
        }

        // DELETE: api/notifications/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(Guid id)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var success = await _notificationService.DeleteNotificationAsync(id, userId);
                
                if (!success)
                    return NotFound(new { Message = "Không tìm thấy thông báo" });
                
                return Ok(new { Message = "Đã xóa thông báo" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi xóa thông báo", Details = ex.Message });
            }
        }

        // DELETE: api/notifications/delete-all
        [HttpDelete("delete-all")]
        public async Task<IActionResult> DeleteAllNotifications()
        {
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                await _notificationService.DeleteAllNotificationsAsync(userId);
                
                return Ok(new { Message = "Đã xóa tất cả thông báo" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi xóa tất cả thông báo", Details = ex.Message });
            }
        }

        // POST: api/notifications/test - TEST ONLY: Create test notification
        [HttpPost("test")]
        public async Task<IActionResult> CreateTestNotification()
        {
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                
                var createDto = new BookStore.Application.DTOs.System.Notification.CreateNotificationDto
                {
                    UserId = userId,
                    Title = "🧪 Test Notification",
                    Message = "This is a test notification created at " + DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                    Type = "test",
                    Link = "/test"
                };
                
                var result = await _notificationService.CreateNotificationAsync(createDto);
                
                return Ok(new { 
                    Message = "Test notification created successfully", 
                    Notification = result 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    Message = "Failed to create test notification", 
                    Error = ex.Message,
                    StackTrace = ex.StackTrace,
                    InnerException = ex.InnerException?.Message
                });
            }
        }
    }
}