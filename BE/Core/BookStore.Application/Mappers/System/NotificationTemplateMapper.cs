using BookStore.Application.DTOs.System.NotificationTemplate;
using BookStore.Domain.Entities.System;

namespace BookStore.Application.Mappers.System
{
    public static class NotificationTemplateMapper
    {
        public static NotificationTemplateDto ToDto(this NotificationTemplate template)
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

        public static NotificationTemplateListDto ToListDto(this NotificationTemplate template)
        {
            return new NotificationTemplateListDto
            {
                Id = template.Id,
                Code = template.Code,
                Subject = template.Subject,
                Description = template.Description,
                IsActive = template.IsActive,
                CreatedAt = template.CreatedAt,
                UpdatedAt = template.UpdatedAt
            };
        }

        public static IEnumerable<NotificationTemplateListDto> ToListDtos(
            this IEnumerable<NotificationTemplate> templates)
        {
            return templates.Select(template => template.ToListDto());
        }
    }
}
