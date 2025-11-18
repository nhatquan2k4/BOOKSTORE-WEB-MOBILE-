using BookStore.Application.DTOs.System.NotificationTemplate;

namespace BookStore.Application.IService.System
{
    public interface INotificationTemplateService
    {
        Task<NotificationTemplateDto> CreateTemplateAsync(CreateNotificationTemplateDto dto);
        Task<NotificationTemplateDto> UpdateTemplateAsync(Guid id, UpdateNotificationTemplateDto dto);
        Task DeleteTemplateAsync(Guid id);
        Task<NotificationTemplateDto?> GetTemplateByIdAsync(Guid id);
        Task<NotificationTemplateDto?> GetTemplateByCodeAsync(string code);
        Task<(IEnumerable<NotificationTemplateListDto> Templates, int TotalCount)> GetTemplatesAsync(
            int page, 
            int pageSize, 
            string? code = null, 
            bool? isActive = null,
            string? searchTerm = null);
        Task<IEnumerable<NotificationTemplateListDto>> GetActiveTemplatesAsync();
    }
}
