using BookStore.Application.DTOs.System.Notification;
using BookStore.Domain.Entities.System;

namespace BookStore.Application.Mappers.System
{
    public static class NotificationMapper
    {
        public static NotificationDto ToDto(this Notification notification)
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

        public static NotificationListDto ToListDto(this Notification notification)
        {
            return new NotificationListDto
            {
                Id = notification.Id,
                Title = notification.Title,
                Message = notification.Message,
                Type = notification.Type,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt,
                Link = notification.Link
            };
        }

        public static IEnumerable<NotificationListDto> ToListDtos(this IEnumerable<Notification> notifications)
        {
            return notifications.Select(notification => notification.ToListDto());
        }

        public static UnreadCountDto ToUnreadCountDto(this int unreadCount)
        {
            return new UnreadCountDto { UnreadCount = unreadCount };
        }
    }
}
