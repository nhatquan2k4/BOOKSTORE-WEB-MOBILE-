using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
// Nhớ using các Service/Dto tương ứng của bạn

namespace BookStore.API.Controllers.Notification
{
    [Route("api/notifications")] // URL chuẩn cho Frontend gọi
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        // Giả sử bạn có INotificationService, nếu chưa có hãy tạo hoặc thay bằng Repository
        // private readonly INotificationService _notificationService;

        public NotificationController(/* INotificationService notificationService */)
        {
            // _notificationService = notificationService;
        }

        // GET: api/notifications/my
        [HttpGet("my")]
        public IActionResult GetMyNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            // MOCK DATA: Trả về dữ liệu giả để Frontend không bị lỗi 500/404
            // Sau này bạn thay bằng logic lấy từ Database thật
            var mockNotifications = new List<object>
            {
                new { 
                    Id = Guid.NewGuid(), 
                    Title = "Chào mừng", 
                    Message = "Chào mừng bạn đến với BookStore!", 
                    IsRead = false, 
                    CreatedAt = DateTime.UtcNow 
                },
                new { 
                    Id = Guid.NewGuid(), 
                    Title = "Đơn hàng", 
                    Message = "Đơn hàng #123 của bạn đã được giao.", 
                    IsRead = true, 
                    CreatedAt = DateTime.UtcNow.AddDays(-1) 
                }
            };

            return Ok(new 
            { 
                Items = mockNotifications, 
                TotalCount = 2, 
                UnreadCount = 1 
            });
        }

        // PUT: api/notifications/{id}/read
        [HttpPut("{id}/read")]
        public IActionResult MarkAsRead(Guid id)
        {
            return Ok(new { Message = "Đã đánh dấu đã đọc" });
        }
        
        // PUT: api/notifications/read-all
        [HttpPut("read-all")]
        public IActionResult MarkAllAsRead()
        {
            return Ok(new { Message = "Đã đánh dấu tất cả là đã đọc" });
        }
    }
}