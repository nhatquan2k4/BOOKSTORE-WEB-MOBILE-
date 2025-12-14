using BookStore.Domain.Entities.System;
using BookStore.Domain.IRepository;

namespace BookStore.Domain.IRepository.System
{
    public interface INotificationRepository : IGenericRepository<Notification>
    {
        Task<IEnumerable<Notification>> GetUserNotificationsAsync(Guid userId, int page, int pageSize, bool? isRead = null);
        Task<int> GetUserNotificationsCountAsync(Guid userId, bool? isRead = null);
        Task<int> GetUnreadCountAsync(Guid userId);
        Task MarkAsReadAsync(Guid notificationId);
        Task MarkAllAsReadAsync(Guid userId);
        Task<IEnumerable<Notification>> GetRecentNotificationsAsync(Guid userId, int count);
    }
}
