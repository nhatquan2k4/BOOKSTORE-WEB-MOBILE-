using BookStore.Application.DTOs.System.NotificationTemplate;
using BookStore.Application.IService.System;
using BookStore.Domain.Entities.System;
using BookStore.Domain.IRepository.System;
using Microsoft.Extensions.Logging;

namespace BookStore.Application.Services.System
{
    public class NotificationTemplateService : INotificationTemplateService
    {
        private readonly INotificationTemplateRepository _templateRepository;
        private readonly ILogger<NotificationTemplateService> _logger;

        public NotificationTemplateService(
            INotificationTemplateRepository templateRepository,
            ILogger<NotificationTemplateService> logger)
        {
            _templateRepository = templateRepository;
            _logger = logger;
        }

        public async Task<NotificationTemplateDto> CreateTemplateAsync(CreateNotificationTemplateDto dto)
        {
            // Validate unique code
            var isUnique = await _templateRepository.IsCodeUniqueAsync(dto.Code);
            if (!isUnique)
            {
                throw new InvalidOperationException($"Template with code '{dto.Code}' already exists");
            }

            var template = new NotificationTemplate
            {
                Id = Guid.NewGuid(),
                Code = dto.Code.ToUpper(), // Ensure code is uppercase
                Subject = dto.Subject,
                Body = dto.Body,
                Description = dto.Description,
                IsActive = dto.IsActive,
                Placeholders = dto.Placeholders,
                CreatedAt = DateTime.UtcNow
            };

            await _templateRepository.AddAsync(template);
            await _templateRepository.SaveChangesAsync();

            _logger.LogInformation("Created notification template with code: {Code}", template.Code);

            return MapToDto(template);
        }

        public async Task<NotificationTemplateDto> UpdateTemplateAsync(Guid id, UpdateNotificationTemplateDto dto)
        {
            var template = await _templateRepository.GetByIdAsync(id);
            if (template == null)
            {
                throw new InvalidOperationException("Template not found");
            }

            // Update fields (Code cannot be changed)
            template.Subject = dto.Subject;
            template.Body = dto.Body;
            template.Description = dto.Description;
            template.IsActive = dto.IsActive;
            template.Placeholders = dto.Placeholders;
            template.UpdatedAt = DateTime.UtcNow;

            _templateRepository.Update(template);
            await _templateRepository.SaveChangesAsync();

            _logger.LogInformation("Updated notification template {Id} with code: {Code}", id, template.Code);

            return MapToDto(template);
        }

        public async Task DeleteTemplateAsync(Guid id)
        {
            var template = await _templateRepository.GetByIdAsync(id);
            if (template == null)
            {
                throw new InvalidOperationException("Template not found");
            }

            _templateRepository.Delete(template);
            await _templateRepository.SaveChangesAsync();

            _logger.LogInformation("Deleted notification template {Id} with code: {Code}", id, template.Code);
        }

        public async Task<NotificationTemplateDto?> GetTemplateByIdAsync(Guid id)
        {
            var template = await _templateRepository.GetByIdAsync(id);
            return template != null ? MapToDto(template) : null;
        }

        public async Task<NotificationTemplateDto?> GetTemplateByCodeAsync(string code)
        {
            var template = await _templateRepository.GetByCodeAsync(code);
            return template != null ? MapToDto(template) : null;
        }

        public async Task<(IEnumerable<NotificationTemplateListDto> Templates, int TotalCount)> GetTemplatesAsync(
            int page, 
            int pageSize, 
            string? code = null, 
            bool? isActive = null, 
            string? searchTerm = null)
        {
            var (templates, totalCount) = await _templateRepository.GetTemplatesAsync(
                page, pageSize, code, isActive, searchTerm);

            var templateDtos = templates.Select(t => new NotificationTemplateListDto
            {
                Id = t.Id,
                Code = t.Code,
                Subject = t.Subject,
                Description = t.Description,
                IsActive = t.IsActive,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            });

            return (templateDtos, totalCount);
        }

        public async Task<IEnumerable<NotificationTemplateListDto>> GetActiveTemplatesAsync()
        {
            var templates = await _templateRepository.GetActiveTemplatesAsync();

            return templates.Select(t => new NotificationTemplateListDto
            {
                Id = t.Id,
                Code = t.Code,
                Subject = t.Subject,
                Description = t.Description,
                IsActive = t.IsActive,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            });
        }

        private static NotificationTemplateDto MapToDto(NotificationTemplate template)
        {
            return new NotificationTemplateDto
            {
                Id = template.Id,
                Code = template.Code,
                Subject = template.Subject,
                Body = template.Body,
                Description = template.Description,
                IsActive = template.IsActive,
                Placeholders = template.Placeholders,
                CreatedAt = template.CreatedAt,
                UpdatedAt = template.UpdatedAt
            };
        }
    }
}
