using BookStore.Application.DTOs.Catalog.Category;
using BookStore.Domain.Entities.Catalog;

namespace BookStore.Application.Mappers.Catalog
{
    /// <summary>
    /// Mapper thủ công cho Category entity
    /// </summary>
    public static class CategoryMapper
    {
        /// <summary>
        /// Map Category entity sang CategoryDto
        /// </summary>
        public static CategoryDto ToDto(this Category category)
        {
            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ParentId = category.ParentId ?? Guid.Empty
            };
        }

        /// <summary>
        /// Map collection Category entities sang collection CategoryDto
        /// </summary>
        public static List<CategoryDto> ToDtoList(this IEnumerable<Category> categories)
        {
            return categories.Select(c => c.ToDto()).ToList();
        }

        /// <summary>
        /// Map CategoryDto sang Category entity (for Create)
        /// </summary>
        public static Category ToEntity(this CategoryDto dto)
        {
            return new Category
            {
                Id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id,
                Name = dto.Name,
                Description = dto.Description,
                ParentId = dto.ParentId == Guid.Empty ? null : dto.ParentId
            };
        }

        /// <summary>
        /// Update Category entity từ CategoryDto (for Update)
        /// </summary>
        public static void UpdateFromDto(this Category category, CategoryDto dto)
        {
            category.Name = dto.Name;
            category.Description = dto.Description;
            category.ParentId = dto.ParentId == Guid.Empty ? null : dto.ParentId;
        }
    }
}