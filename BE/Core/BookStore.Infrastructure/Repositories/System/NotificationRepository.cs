using BookStore.Domain.Entities.System;
using BookStore.Domain.IRepository.System;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Infrastructure.Repositories.System
{
    public class NotificationRepository : GenericRepository<Notification>, INotificationRepository
    {
        public NotificationRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Notification>> GetUserNotificationsAsync(Guid userId, int page, int pageSize, bool? isRead = null)
        {
            var query = _dbSet.Where(n => n.UserId == userId);

            if (isRead.HasValue)
            {
                query = query.Where(n => n.IsRead == isRead.Value);
            }

            return await query
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetUserNotificationsCountAsync(Guid userId, bool? isRead = null)
        {
            var query = _dbSet.Where(n => n.UserId == userId);

            if (isRead.HasValue)
            {
                query = query.Where(n => n.IsRead == isRead.Value);
            }

            return await query.CountAsync();
        }

        public async Task<int> GetUnreadCountAsync(Guid userId)
        {
            return await _dbSet.CountAsync(n => n.UserId == userId && !n.IsRead);
        }

        public async Task MarkAsReadAsync(Guid notificationId)
        {
            var notification = await _dbSet.FindAsync(notificationId);
            if (notification != null && !notification.IsRead)
            {
                notification.IsRead = true;
                _dbSet.Update(notification);
                await _context.SaveChangesAsync();
            }
        }

        public async Task MarkAllAsReadAsync(Guid userId)
        {
            var notifications = await _dbSet
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            if (notifications.Any())
            {
                _dbSet.UpdateRange(notifications);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Notification>> GetRecentNotificationsAsync(Guid userId, int count)
        {
            return await _dbSet
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(count)
                .ToListAsync();
        }
    }
}
