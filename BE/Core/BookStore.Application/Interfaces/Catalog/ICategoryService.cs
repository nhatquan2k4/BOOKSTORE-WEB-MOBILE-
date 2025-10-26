using BookStore.Application.DTOs.Catalog.Category;

namespace BookStore.Application.Interfaces.Catalog
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetAllAsync();
        Task<CategoryDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<CategoryDto>> GetSubCategoriesAsync(Guid parentId);
        Task<CategoryDto> CreateAsync(CategoryDto dto);
        Task<CategoryDto> UpdateAsync(CategoryDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> HasSubCategoriesAsync(Guid categoryId);
    }
}