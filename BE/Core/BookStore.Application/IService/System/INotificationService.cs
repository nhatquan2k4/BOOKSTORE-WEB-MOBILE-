using BookStore.Application.Dtos.System.Notification; // Chú ý: Dtos viết thường chữ 's'

namespace BookStore.Application.IService.System
{
    public interface INotificationService
    {
        Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto dto);
        
        Task<(IEnumerable<NotificationListDto> Notifications, int TotalCount)> GetUserNotificationsAsync(
            Guid userId, int page, int pageSize, bool? isRead = null);
            
        Task<NotificationDto?> GetNotificationByIdAsync(Guid id, Guid userId);
        
        Task<bool> MarkAsReadAsync(Guid id, Guid userId);
        
        Task<bool> MarkAllAsReadAsync(Guid userId);
        
        Task<UnreadCountDto> GetUnreadCountAsync(Guid userId);
        
        Task<bool> DeleteNotificationAsync(Guid id, Guid userId);
        
        Task<IEnumerable<NotificationListDto>> GetRecentNotificationsAsync(Guid userId, int count);
    }
}