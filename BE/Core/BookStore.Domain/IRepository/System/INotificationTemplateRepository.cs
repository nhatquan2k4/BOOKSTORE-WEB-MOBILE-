using BookStore.Domain.Entities.System;

namespace BookStore.Domain.IRepository.System
{
    public interface INotificationTemplateRepository : IGenericRepository<NotificationTemplate>
    {
        Task<NotificationTemplate?> GetByCodeAsync(string code);
        Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null);
        Task<(IEnumerable<NotificationTemplate> Templates, int TotalCount)> GetTemplatesAsync(
            int page, 
            int pageSize, 
            string? code = null, 
            bool? isActive = null,
            string? searchTerm = null);
        Task<IEnumerable<NotificationTemplate>> GetActiveTemplatesAsync();
    }
}
