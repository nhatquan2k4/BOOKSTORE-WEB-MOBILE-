using BookStore.Application.Dtos.System.Notification; // Chú ý namespace DTO của bạn
using BookStore.Application.IService.System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookStore.API.Controllers.Notification
{
    [Route("api/notifications")]
    [ApiController]
    [Authorize] // Bắt buộc phải đăng nhập mới gọi được
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
                var userId = GetCurrentUserId(); // Lấy ID từ Token
                
                var result = await _notificationService.GetUserNotificationsAsync(userId, page, pageSize, isRead);
                var unreadCount = await _notificationService.GetUnreadCountAsync(userId);

                return Ok(new 
                { 
                    Items = result.Notifications, 
                    TotalCount = result.TotalCount,
                    UnreadCount = unreadCount.UnreadCount,
                    Page = page,
                    PageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi tải thông báo", Error = ex.Message });
            }
        }

        // PUT: api/notifications/{id}/read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var userId = GetCurrentUserId();
            var success = await _notificationService.MarkAsReadAsync(id, userId);
            
            if (!success) return NotFound(new { Message = "Không tìm thấy thông báo hoặc lỗi quyền truy cập" });

            return Ok(new { Message = "Đã đánh dấu đã đọc" });
        }
        
        // PUT: api/notifications/read-all
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = GetCurrentUserId();
            await _notificationService.MarkAllAsReadAsync(userId);
            return Ok(new { Message = "Đã đánh dấu tất cả là đã đọc" });
        }

        // GET: api/notifications/unread-count
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = GetCurrentUserId();
            var count = await _notificationService.GetUnreadCountAsync(userId);
            return Ok(count);
        }

        // DELETE: api/notifications/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(Guid id)
        {
            var userId = GetCurrentUserId();
            var success = await _notificationService.DeleteNotificationAsync(id, userId);
            
            if (!success) return NotFound(new { Message = "Không tìm thấy thông báo" });

            return Ok(new { Message = "Đã xóa thông báo" });
        }

        // Helper lấy UserID từ Token
        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) 
                throw new UnauthorizedAccessException("Không tìm thấy thông tin người dùng trong Token");
            
            return Guid.Parse(userIdClaim);
        }
    }
}