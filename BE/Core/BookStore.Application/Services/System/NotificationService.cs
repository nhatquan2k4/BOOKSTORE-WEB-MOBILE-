using BookStore.Application.DTOs.System.Notification;
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
            try
            {
                _logger.LogInformation("==== START CreateNotificationAsync ====");
                _logger.LogInformation("UserId: {UserId}, Title: {Title}, Type: {Type}", 
                    dto.UserId, dto.Title, dto.Type);

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

                _logger.LogInformation("Adding notification to repository...");
                await _notificationRepository.AddAsync(notification);
                
                _logger.LogInformation("Saving changes to database...");
                await _notificationRepository.SaveChangesAsync();

                _logger.LogInformation("✅ Created notification {NotificationId} for user {UserId}", 
                    notification.Id, dto.UserId);

                return MapToDto(notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error creating notification for user {UserId}: {Message}", 
                    dto.UserId, ex.Message);
                throw;
            }
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
            _logger.LogInformation("Marked notification {NotificationId} as read for user {UserId}", id, userId);
            
            return true;
        }

        public async Task<bool> MarkAllAsReadAsync(Guid userId)
        {
            await _notificationRepository.MarkAllAsReadAsync(userId);
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

        public async Task<bool> DeleteAllNotificationsAsync(Guid userId)
        {
            var notifications = await _notificationRepository.GetUserNotificationsAsync(userId, 1, int.MaxValue);
            
            foreach (var notification in notifications)
            {
                _notificationRepository.Delete(notification);
            }
            
            await _notificationRepository.SaveChangesAsync();
            _logger.LogInformation("Deleted all notifications for user {UserId}. Total: {Count}", userId, notifications.Count());
            
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
