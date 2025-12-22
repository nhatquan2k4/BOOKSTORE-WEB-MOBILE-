using BookStore.Application.Dtos.System.Notification; // Chú ý: Dtos viết thường chữ 's'
using BookStore.Application.IService.System;
using BookStore.Domain.Entities.System;
using BookStore.Domain.IRepository.System;
using Microsoft.Extensions.Logging;

namespace BookStore.Application.Services.System
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            INotificationRepository notificationRepository,
            ILogger<NotificationService> logger)
        {
            _notificationRepository = notificationRepository;
            _logger = logger;
        }

        public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto dto)
        {
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = dto.UserId,
                Title = dto.Title,
                Message = dto.Message,
                Type = dto.Type,
                Link = dto.Link,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationRepository.AddAsync(notification);
            await _notificationRepository.SaveChangesAsync();

            _logger.LogInformation("Created notification {NotificationId} for user {UserId}", 
                notification.Id, dto.UserId);

            return MapToDto(notification);
        }

        public async Task<(IEnumerable<NotificationListDto> Notifications, int TotalCount)> GetUserNotificationsAsync(
            Guid userId, int page, int pageSize, bool? isRead = null)
        {
            var notifications = await _notificationRepository.GetUserNotificationsAsync(userId, page, pageSize, isRead);
            var totalCount = await _notificationRepository.GetUserNotificationsCountAsync(userId, isRead);

            var notificationDtos = notifications.Select(n => new NotificationListDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
                Link = n.Link
            });

            return (notificationDtos, totalCount);
        }

        public async Task<NotificationDto?> GetNotificationByIdAsync(Guid id, Guid userId)
        {
            var notification = await _notificationRepository.GetByIdAsync(id);
            
            if (notification == null || notification.UserId != userId)
                return null;

            return MapToDto(notification);
        }

        public async Task<bool> MarkAsReadAsync(Guid id, Guid userId)
        {
            var notification = await _notificationRepository.GetByIdAsync(id);
            
            if (notification == null || notification.UserId != userId)
                return false;

            await _notificationRepository.MarkAsReadAsync(id);
            await _notificationRepository.SaveChangesAsync(); // Đảm bảo lưu thay đổi
            _logger.LogInformation("Marked notification {NotificationId} as read for user {UserId}", id, userId);
            
            return true;
        }

        public async Task<bool> MarkAllAsReadAsync(Guid userId)
        {
            await _notificationRepository.MarkAllAsReadAsync(userId);
            await _notificationRepository.SaveChangesAsync(); // Đảm bảo lưu thay đổi
            _logger.LogInformation("Marked all notifications as read for user {UserId}", userId);
            
            return true;
        }

        public async Task<UnreadCountDto> GetUnreadCountAsync(Guid userId)
        {
            var count = await _notificationRepository.GetUnreadCountAsync(userId);
            return new UnreadCountDto { UnreadCount = count };
        }

        public async Task<bool> DeleteNotificationAsync(Guid id, Guid userId)
        {
            var notification = await _notificationRepository.GetByIdAsync(id);
            
            if (notification == null || notification.UserId != userId)
                return false;

            _notificationRepository.Delete(notification);
            await _notificationRepository.SaveChangesAsync();
            
            _logger.LogInformation("Deleted notification {NotificationId} for user {UserId}", id, userId);
            
            return true;
        }

        public async Task<IEnumerable<NotificationListDto>> GetRecentNotificationsAsync(Guid userId, int count)
        {
            var notifications = await _notificationRepository.GetRecentNotificationsAsync(userId, count);
            
            return notifications.Select(n => new NotificationListDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
                Link = n.Link
            });
        }

        private NotificationDto MapToDto(Notification notification)
        {
            return new NotificationDto
            {
                Id = notification.Id,
                UserId = notification.UserId,
                Title = notification.Title,
                Message = notification.Message,
                Type = notification.Type,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt,
                Link = notification.Link
            };
        }
    }
}