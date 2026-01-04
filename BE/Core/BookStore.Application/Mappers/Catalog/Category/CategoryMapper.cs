using BookStore.Application.Dtos.Catalog.Category;
using BookStore.Shared.Utilities;
using CategoryEntity = BookStore.Domain.Entities.Catalog.Category;

namespace BookStore.Application.Mappers.Catalog.Category
{
    public static class CategoryMapper
    {

        public static CategoryDto ToDto(this CategoryEntity category)
        {
            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ParentId = category.ParentId,
                ParentName = category.Parent?.Name,
                BookCount = category.BookCategories?.Count ?? 0,
                SubCategoriesCount = category.SubCategories?.Count ?? 0
            };
        }

        public static List<CategoryDto> ToDtoList(this IEnumerable<CategoryEntity> categories)
        {
            return categories.Select(c => c.ToDto()).ToList();
        }

        public static CategoryEntity ToEntity(this CreateCategoryDto dto)
        {
            return new CategoryEntity
            {
                Id = Guid.NewGuid(),
                Name = dto.Name.NormalizeSpace(),
                Description = dto.Description?.NormalizeSpace(),
                ParentId = dto.ParentId
            };
        }

        public static void UpdateFromDto(this CategoryEntity category, UpdateCategoryDto dto)
        {
            category.Name = dto.Name.NormalizeSpace();
            category.Description = dto.Description?.NormalizeSpace();
            category.ParentId = dto.ParentId;
        }

        public static CategoryTreeDto ToTreeDto(this CategoryEntity category, int level = 0)
        {
            return new CategoryTreeDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ParentId = category.ParentId,
                BookCount = category.BookCategories?.Count ?? 0,
                Level = level,
                SubCategories = category.SubCategories?
                    .Select(sub => sub.ToTreeDto(level + 1))
                    .ToList() ?? new List<CategoryTreeDto>()
            };
        }

        public static CategoryBreadcrumbDto ToBreadcrumbDto(this CategoryEntity category, int level)
        {
            return new CategoryBreadcrumbDto
            {
                Id = category.Id,
                Name = category.Name,
                Level = level
            };
        }
    }
}
