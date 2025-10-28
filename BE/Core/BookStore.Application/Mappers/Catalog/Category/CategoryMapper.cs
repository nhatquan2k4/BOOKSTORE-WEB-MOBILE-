using BookStore.Application.Dtos.Catalog.Category;
using CategoryEntity = BookStore.Domain.Entities.Catalog.Category;

namespace BookStore.Application.Mappers.Catalog.Category
{
    /// <summary>
    /// Mapper thủ công cho Category entity
    /// </summary>
    public static class CategoryMapper
    {
        /// <summary>
        /// Map Category entity sang CategoryDto (for List)
        /// </summary>
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

        /// <summary>
        /// Map collection Category entities sang collection CategoryDto
        /// </summary>
        public static List<CategoryDto> ToDtoList(this IEnumerable<CategoryEntity> categories)
        {
            return categories.Select(c => c.ToDto()).ToList();
        }

        /// <summary>
        /// Map CreateCategoryDto sang Category entity (for Create)
        /// </summary>
        public static CategoryEntity ToEntity(this CreateCategoryDto dto)
        {
            return new CategoryEntity
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                ParentId = dto.ParentId
            };
        }

        /// <summary>
        /// Update Category entity từ UpdateCategoryDto (for Update)
        /// </summary>
        public static void UpdateFromDto(this CategoryEntity category, UpdateCategoryDto dto)
        {
            category.Name = dto.Name;
            category.Description = dto.Description;
            category.ParentId = dto.ParentId;
        }

        /// <summary>
        /// Map Category entity sang CategoryTreeDto (recursive structure)
        /// </summary>
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

        /// <summary>
        /// Map Category entity sang CategoryBreadcrumbDto
        /// </summary>
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
